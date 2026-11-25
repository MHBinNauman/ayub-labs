/**
 * Turns an entry of `media` (site-data.ts) into next/image props. Call it in
 * server components and pass the result down, so the blur previews of every
 * photo never reach the browser bundle.
 */
import { generatedMedia } from "@/data/media.generated";
import type { MediaItem } from "@/data/site-data";

export type MediaProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  placeholder: "blur";
  blurDataURL: string;
};

/**
 * Props for <Image>. Still pass `sizes` (CLAUDE.md), and with `fill` drop
 * `width` and `height`.
 */
export function mediaProps(item: Pick<MediaItem, "src" | "alt">): MediaProps {
  const file = generatedMedia[item.src];
  // validate.ts fails the build first; this keeps the types honest.
  if (!file) throw new Error(`${item.src} is unknown; run \`pnpm images\``);
  return {
    src: file.src,
    alt: item.alt,
    width: file.width,
    height: file.height,
    placeholder: "blur",
    blurDataURL: file.blurDataURL,
  };
}
