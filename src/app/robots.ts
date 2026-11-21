import type { MetadataRoute } from "next";
import { routes } from "@/lib/nav";
import { absoluteUrl } from "@/lib/seo";
import { resolvedFeatures } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        routes.styleguide,
        ...(resolvedFeatures.testDirectory ? [] : [routes.tests]),
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
