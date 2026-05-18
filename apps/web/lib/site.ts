export const siteConfig = {
  name: "Lumina Bedding",
  title: "Lumina Bedding | Chan ga, goi va nem cao cap",
  description:
    "Chan ga, goi va nem cao cap duoc chon loc cho khi hau Viet Nam.",
  keywords: [
    "chan ga",
    "goi",
    "nem",
    "bedding",
    "Lumina Bedding",
    "phong ngu",
  ],
  url: getSiteUrl(),
  ogImage:
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85",
};

export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return siteUrl.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
