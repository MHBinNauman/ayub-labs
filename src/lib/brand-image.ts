/**
 * The emblem as a data URL for next/og images (OG images and app icons).
 * Server-only: reads the file at build time.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Source for every generated icon. Swap for a vector-derived PNG later. */
export const EMBLEM_FILE = "public/brand/logo-emblem-192.png";
export const EMBLEM_SIZE = 192;

export const emblemDataUrl = `data:image/png;base64,${readFileSync(
  join(process.cwd(), EMBLEM_FILE),
).toString("base64")}`;
