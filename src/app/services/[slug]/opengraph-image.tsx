import { notFound } from "next/navigation";
import { brand, serviceCategories, services } from "@/data/site-data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

const findService = (slug: string) => services.find((s) => s.slug === slug);

/** One image per service, with its own alt text. */
export function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const service = findService(params.slug);
  return [
    {
      id: "og",
      alt: `${service?.name ?? "Service"} | ${brand.displayName}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const service = findService((await params).slug);
  if (!service) notFound();
  return renderOgImage({
    title: service.name,
    eyebrow: serviceCategories[service.category].label,
  });
}
