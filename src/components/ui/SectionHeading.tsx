import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  /** Short label above the heading. */
  eyebrow?: string;
  title: ReactNode;
  /** Supporting sentence under the heading. */
  sub?: ReactNode;
  align?: "left" | "center";
  /** Heading level. Styling stays the same. */
  as?: "h1" | "h2" | "h3";
  /** Id for the heading, e.g. for `aria-labelledby` on the section. */
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold tracking-wide text-brand-red-text uppercase">
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className="text-2xl font-bold tracking-tight text-balance text-navy sm:text-3xl lg:text-4xl"
      >
        {title}
      </Heading>
      {sub && (
        <p className="mt-3 text-base text-pretty text-muted sm:text-lg">
          {sub}
        </p>
      )}
    </div>
  );
}
