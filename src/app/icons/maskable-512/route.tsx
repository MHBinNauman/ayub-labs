import { ImageResponse } from "next/og";
import { brandTokens } from "@/data/site-data";
import { emblemDataUrl } from "@/lib/brand-image";

/**
 * 512px maskable icon for the web manifest: the emblem on navy, inside the
 * central 80% safe zone so Android's mask never crops it. Upscaled from the
 * 192px emblem, so slightly soft until a vector logo is supplied.
 */
export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: brandTokens.colors.navy,
      }}
    >
      <div
        style={{
          width: 340,
          height: 340,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 170,
          backgroundColor: "white",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
        <img src={emblemDataUrl} width={300} height={300} alt="" />
      </div>
    </div>,
    { width: 512, height: 512 },
  );
}
