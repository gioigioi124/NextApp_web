import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/services/catalog.service";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: categories }, products] = await Promise.all([
    getCategories(),
    getProducts({ limit: "100" }),
  ]);

  const now = new Date();
  const staticRoutes = [
    "",
    "/products",
    "/cart",
    "/wishlist",
    "/login",
    "/register",
  ].map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: absoluteUrl(`/categories/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes = products.data.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: product.createdAt ? new Date(product.createdAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
