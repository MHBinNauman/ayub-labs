import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";

/**
 * Centres content at the site's maximum width with responsive side padding
 * (16 / 24 / 32px), widened where a landscape notch would cover it
 * (px-gutter in globals.css).
 */
export function Container({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cx("mx-auto w-full max-w-7xl px-gutter", className)}
      {...props}
    />
  );
}
