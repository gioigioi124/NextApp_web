import { PromotionForm } from "../_components/promotion-form";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

async function getPromotion(id: string) {
  try {
    const token = (await cookies()).get("auth-token")?.value;
    const res = await fetch(`${process.env.API_URL || 'http://localhost:8000/api/v1'}/promotions/${id}`, {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = await getPromotion(id);

  if (!promotion) {
    notFound();
  }

  return <PromotionForm initialData={promotion} />;
}
