import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

// `ui-button` opts out of the generic pressed state in globals.css.
// Pressed: one step darker (derived from the variant's own colour, so no new
// hue enters the palette) and, unless reduced motion is on, scaled to 0.98.
// Tailwind v4 writes translate and scale as their own properties, so those
// are what transition.
const base =
  "ui-button relative inline-flex items-center justify-center gap-2 rounded-lg py-2 text-center font-semibold transition-[color,background-color,border-color,filter,translate,scale] duration-200 ease-house focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue active:brightness-90 motion-safe:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-busy:opacity-75";

// Hover for every solid or outlined button: a 1px lift and a shadow. The
// shadow is a layer that fades in, so box-shadow itself never animates; under
// reduced motion it still appears, without the lift.
const lift =
  "motion-safe:hover:-translate-y-px after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:shadow-card-hover after:transition-opacity after:duration-200 after:ease-house hover:after:opacity-100";

const variants = {
  primary: "bg-navy text-white hover:bg-brand-blue",
  secondary:
    "border-2 border-navy bg-white text-navy hover:bg-navy hover:text-white",
  accent: "bg-brand-red text-white hover:bg-brand-red-text",
  // Dark label: white on WhatsApp green is about 2:1 and fails WCAG AA.
  whatsapp: "bg-whatsapp text-ink hover:brightness-95",
  ghost: "text-navy hover:bg-tint",
  // Outline for navy backgrounds. The focus ring turns white because the
  // brand-blue ring is barely visible on navy.
  inverse:
    "border-2 border-white text-white hover:bg-white hover:text-navy focus-visible:outline-white",
};

// Every size is at least 44px tall, the minimum touch target.
const sizes = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
};

type CommonProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Renders a link when `href` is passed (client-side navigation for internal
 * paths, a plain anchor for tel:, mailto:, WhatsApp and external URLs) and a
 * `<button>` otherwise.
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    base,
    variant !== "ghost" && lift,
    variants[variant],
    sizes[size],
    className,
  );

  if (typeof props.href === "string") {
    const { href, ...anchorProps } = props;
    if (href.startsWith("/")) {
      return <Link href={href} className={classes} {...anchorProps} />;
    }
    return (
      <a
        href={href}
        className={classes}
        rel={
          anchorProps.target === "_blank" ? "noopener noreferrer" : undefined
        }
        {...anchorProps}
      />
    );
  }

  return <button type="button" className={classes} {...props} />;
}
