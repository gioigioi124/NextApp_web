import { PostForm } from "../_components/post-form";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getPost(id: string) {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/posts/${id}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PostForm initialData={post} />
    </div>
  );
}
