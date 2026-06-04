import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getPageBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/posts/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type !== 'PAGE') return null;
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  
  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt,
    openGraph: {
      images: page.thumbnail ? [page.thumbnail] : [],
    },
  };
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || page.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
          {page.title}
        </h1>
        {page.excerpt && (
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            {page.excerpt}
          </p>
        )}
      </div>

      {page.thumbnail && (
        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 shadow-md">
          <img src={page.thumbnail} alt={page.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div 
        className="prose prose-lg prose-stone max-w-none 
          prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-sm"
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
    </div>
  );
}
