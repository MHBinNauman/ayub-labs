import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/** Centres content at the site's maximum width with responsive side padding. */
export function Container({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
