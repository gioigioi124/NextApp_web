import { notFound } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/posts/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Not Found' };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      images: post.thumbnail ? [post.thumbnail] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10">
        <ArrowLeft className="w-4 h-4" />
        Trở về danh sách
      </Link>

      <div className="space-y-6 text-center mb-12">
        <div className="flex items-center justify-center gap-3 text-sm text-primary font-medium">
          <span>{post.type === 'PAGE' ? 'Trang' : 'Tin tức'}</span>
          <span>•</span>
          <span>{format(new Date(post.publishedAt || post.createdAt), 'dd MMMM, yyyy', { locale: vi })}</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
            {post.excerpt}
          </p>
        )}
      </div>

      {post.thumbnail && (
        <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden mb-16 shadow-lg">
          <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Tailwind Typography plugin classes (prose) if installed, otherwise basic styling */}
      <div 
        className="prose prose-lg sm:prose-xl prose-stone max-w-none 
          prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-2xl prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      <hr className="my-16 border-border" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {post.author?.name?.charAt(0) || 'A'}
            </div>
          )}
          <div>
            <div className="text-sm text-muted-foreground mb-1">Được viết bởi</div>
            <div className="font-semibold text-lg">{post.author?.name || 'Admin'}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
