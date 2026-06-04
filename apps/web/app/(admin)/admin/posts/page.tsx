import { FileText, Search, Plus, Filter, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies } from "next/headers";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getPosts() {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/posts`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    const json = await res.json();
    return json || [];
  } catch (error) {
    console.error("Fetch posts error:", error);
    return [];
  }
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <span>Quản trị</span>
            <span>/</span>
            <span className="text-primary font-medium">Bài viết & Trang</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">Quản lý Nội dung</h2>
          </div>
          <p className="text-muted-foreground mt-2 max-w-md">Viết blog, tin tức và các trang tĩnh (về chúng tôi, chính sách) cho website.</p>
        </div>
        <Link href="/admin/posts/new">
          <Button size="lg" className="gap-2 rounded-xl h-11 w-full md:w-auto">
            <Plus className="w-4 h-4" />
            Viết bài mới
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" 
              placeholder="Tìm kiếm bài viết..." 
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Lọc
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Tiêu đề</th>
                <th className="px-6 py-4 font-medium">Loại</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Ngày tạo</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
                  </td>
                </tr>
              ) : (
                posts.map((post: any) => (
                  <tr key={post.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {post.title}
                      <div className="text-xs text-muted-foreground mt-1 font-normal">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={post.type === 'BLOG' ? 'default' : 'secondary'}>
                        {post.type === 'BLOG' ? 'Tin tức' : 'Trang tĩnh'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={post.status === 'PUBLISHED' ? 'success' : 'outline'} className={post.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : ''}>
                        {post.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(post.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/posts/${post.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
