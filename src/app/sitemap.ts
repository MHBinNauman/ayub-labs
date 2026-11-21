import type { MetadataRoute } from "next";
import { branches, services } from "@/data/site-data";
import { routes, serviceHref } from "@/lib/nav";
import { absoluteUrl } from "@/lib/seo";
import { resolvedFeatures } from "@/lib/site";

/**
 * Every public page. /styleguide is internal and never listed; /tests only
 * once the directory is switched on. No lastModified: we have no real dates,
 * and a build timestamp would tell crawlers everything changes every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    routes.services,
    ...services.map((service) => serviceHref(service.slug)),
    routes.locations,
    ...branches.map((branch) => `${routes.locations}/${branch.id}`),
    routes.reports,
    routes.about,
    routes.contact,
    ...(resolvedFeatures.testDirectory ? [routes.tests] : []),
  ];
  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
