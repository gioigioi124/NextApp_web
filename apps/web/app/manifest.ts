import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Lumina",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f9fc",
    theme_color: "#2b3990",
    icons: [
      {
        src: absoluteUrl("/favicon.ico"),
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
