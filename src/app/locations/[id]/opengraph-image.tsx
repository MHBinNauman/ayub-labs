import { notFound } from "next/navigation";
import { brand, branches } from "@/data/site-data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { branchTitle, pageTitles } from "@/lib/page-titles";

export function generateStaticParams() {
  return branches.map((branch) => ({ id: branch.id }));
}

const findBranch = (id: string) => branches.find((b) => b.id === id);

/** One image per branch, with its own alt text. */
export function generateImageMetadata({ params }: { params: { id: string } }) {
  const branch = findBranch(params.id);
  return [
    {
      id: "og",
      alt: `${branch ? branchTitle(branch) : pageTitles.locations} | ${brand.displayName}`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const branch = findBranch((await params).id);
  if (!branch) notFound();
  return renderOgImage({
    title: branchTitle(branch),
    eyebrow: pageTitles.locations,
  });
}
