import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

const spacings = {
  sm: "py-8 sm:py-10",
  md: "py-14 lg:py-20",
  lg: "py-16 sm:py-24",
};

const backgrounds = {
  white: "bg-white",
  surface: "bg-surface",
  tint: "bg-tint",
};

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  spacing?: keyof typeof spacings;
  background?: keyof typeof backgrounds;
  /** Wrap children in a Container. Turn off for full-bleed content. */
  contained?: boolean;
};

/** A page band with consistent vertical rhythm and an optional background. */
export function Section({
  spacing = "md",
  background = "white",
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(spacings[spacing], backgrounds[background], className)}
      {...props}
    >
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}
