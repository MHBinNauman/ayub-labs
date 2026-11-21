/**
 * Open Graph image shared by every route's opengraph-image.tsx: navy
 * background, the emblem, the page title in white Montserrat and a red
 * underline. Server-only (reads files); images are generated at build time.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand, brandTokens } from "@/data/site-data";
import { emblemDataUrl as emblem } from "./brand-image";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// satori reads ttf/otf/woff only (not woff2), so the woff is committed.
const montserratBold = readFileSync(
  join(process.cwd(), "src/assets/fonts/montserrat-latin-700-normal.woff"),
);

const { navy, logoBlue, logoRed } = brandTokens.colors;

/** Long titles step down a size so they stay within three lines. */
function titleSize(title: string): number {
  if (title.length > 60) return 56;
  if (title.length > 34) return 64;
  return 76;
}

export function renderOgImage({
  title,
  eyebrow,
}: {
  title: string;
  /** Small line above the title, e.g. the section name. */
  eyebrow?: string;
}): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px",
        color: "white",
        // The one gradient the brand allows: navy → logo blue.
        backgroundImage: `linear-gradient(135deg, ${navy} 55%, ${logoBlue} 100%)`,
        fontFamily: "Montserrat",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
        <img
          src={emblem}
          width={128}
          height={128}
          alt=""
          style={{ borderRadius: 64, backgroundColor: "white" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 40, letterSpacing: 1 }}>
            {brand.displayName.toUpperCase()}
          </span>
          <span
            style={{
              fontSize: 22,
              letterSpacing: 4,
              opacity: 0.85,
              marginTop: 6,
            }}
          >
            {brand.tagline.value.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow && (
          <span style={{ fontSize: 28, opacity: 0.85, marginBottom: 12 }}>
            {eyebrow}
          </span>
        )}
        <span
          style={{
            fontSize: titleSize(title),
            lineHeight: 1.15,
            maxWidth: 1040,
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: 180,
            height: 10,
            marginTop: 28,
            borderRadius: 5,
            backgroundColor: logoRed,
          }}
        />
      </div>

      <span style={{ fontSize: 24, opacity: 0.85 }}>{brand.domain}</span>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "Montserrat",
          data: montserratBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
