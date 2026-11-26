import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section" | "li";
  /** The shared card hover: lift 3px with a deeper shadow (card-hover in globals.css). */
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
        lift && "card-hover",
        className,
      )}
      {...props}
    />
  );
}
