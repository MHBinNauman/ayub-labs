import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const dots = {
  open: "bg-status-open",
  closed: "bg-brand-red",
  neutral: null,
};

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: keyof typeof dots;
};

/**
 * Small status label. The dot is decorative: the text must carry the meaning
 * ("Open now", "Closed"), so colour is never the only signal.
 */
export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  const dot = dots[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-ink/10 bg-surface px-2.5 py-1 text-sm font-semibold text-ink",
        className,
      )}
      {...props}
    >
      {dot && (
        <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
      )}
      {children}
    </span>
  );
}
