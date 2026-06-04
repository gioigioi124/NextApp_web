import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const dynamic = "force-dynamic";

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/posts?type=BLOG&status=PUBLISHED`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    const json = await res.json();
    return json || [];
  } catch (error) {
    console.error("Fetch posts error:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">Blog & Tin tức</h1>
        <p className="text-muted-foreground text-lg">Cập nhật những xu hướng thời trang mới nhất và các mẹo phối đồ từ chuyên gia của chúng tôi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
              {post.thumbnail ? (
                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">No Image</div>
              )}
            </div>
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-primary">Thời trang</span>
                <span>•</span>
                <span>{format(new Date(post.createdAt), 'dd MMMM, yyyy', { locale: vi })}</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3 mb-6 flex-1">
                {post.excerpt || post.seoDescription || "Đọc bài viết để biết thêm chi tiết..."}
              </p>
              <div className="flex items-center gap-3 mt-auto">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {post.author?.name?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="text-sm font-medium">{post.author?.name || 'Admin'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          Chưa có bài viết nào được xuất bản.
        </div>
      )}
    </div>
  );
}
