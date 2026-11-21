import { ImageResponse } from "next/og";
import { emblemDataUrl } from "@/lib/brand-image";

// Home-screen icon. iOS fills transparency with black, so the emblem sits
// on white with a little padding.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
      <img src={emblemDataUrl} width={156} height={156} alt="" />
    </div>,
    size,
  );
}
