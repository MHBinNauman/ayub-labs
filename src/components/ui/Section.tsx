import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";
import { Reveal, REVEAL_STAGGER } from "./Reveal";

const spacings = {
  sm: "py-8 sm:py-10",
  md: "py-14 lg:py-20",
  lg: "py-16 sm:py-24",
};

const backgrounds = {
  white: "bg-white",
  surface: "bg-surface",
  tint: "bg-tint",
  /** tint→white, for light feature bands. */
  fade: "bg-linear-to-b from-tint to-white",
};

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  spacing?: keyof typeof spacings;
  background?: keyof typeof backgrounds;
  /** Wrap children in a Container. Turn off for full-bleed content. */
  contained?: boolean;
  /**
   * Reveal the content as it scrolls into view, children 80ms apart (mark
   * grid items `data-reveal` to stagger them one by one). On by default;
   * turn off for sections that must never move, such as interactive tools.
   */
  reveal?: boolean;
};

/**
 * A page band with consistent vertical rhythm, an optional background and
 * the site-wide scroll reveal.
 */
export function Section({
  spacing = "md",
  background = "white",
  contained = true,
  reveal = true,
  className,
  children,
  ...props
}: SectionProps) {
  const content = reveal ? (
    <Reveal stagger={REVEAL_STAGGER}>{children}</Reveal>
  ) : (
    children
  );
  return (
    <section
      className={cn(spacings[spacing], backgrounds[background], className)}
      {...props}
    >
      {contained ? <Container>{content}</Container> : content}
    </section>
  );
}
