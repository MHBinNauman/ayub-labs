import type { MetadataRoute } from "next";
import { brand, brandTokens } from "@/data/site-data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.displayName,
    short_name: brand.shortName,
    description: brand.aboutDraft,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: brandTokens.colors.navy,
    icons: [
      {
        src: "/brand/logo-emblem-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/maskable-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
