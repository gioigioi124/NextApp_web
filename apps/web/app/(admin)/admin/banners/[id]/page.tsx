import { BannerForm } from "../_components/banner-form";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

async function getBanner(id: string) {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/banners/${id}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await getBanner(id);

  if (!banner) {
    notFound();
  }

  return <BannerForm initialData={banner} />;
}
