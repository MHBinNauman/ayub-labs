import { brand } from "@/data/site-data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { homeOgTitle } from "@/lib/page-titles";

export const alt = `${homeOgTitle} | ${brand.displayName}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ title: homeOgTitle });
}
