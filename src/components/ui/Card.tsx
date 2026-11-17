import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section" | "li";
  /** Lift 2px with a deeper shadow on hover. Off under reduced motion. */
  lift?: boolean;
};

export function Card({
  as: Tag = "div",
  lift = true,
  className,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card bg-white p-6 shadow-card",
        lift &&
          "motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  );
}
