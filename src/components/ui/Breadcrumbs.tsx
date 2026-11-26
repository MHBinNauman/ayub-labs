import Link from "next/link";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

const chip = "flex min-h-11 items-center px-4 py-2";

/** Ancestor chips: navy on light pages, translucent white on a photo banner. */
const ancestorTones = {
  light: {
    link: "bg-navy hover:bg-brand-blue focus-visible:outline-brand-blue",
    plain: "bg-navy",
  },
  onDark: {
    link: "bg-white/15 hover:bg-white/25 focus-visible:outline-white",
    plain: "bg-white/15",
  },
};

/**
 * Chip-style breadcrumb trail. Ancestors are links; the last item is the
 * current page, shown as a red chip with an arrow-shaped right edge. Use
 * tone="onDark" on a navy photo banner (PageBanner).
 */
export function Breadcrumbs({
  items,
  tone = "light",
  className,
}: {
  items: Crumb[];
  tone?: keyof typeof ancestorTones;
  className?: string;
}) {
  const ancestor = ancestorTones[tone];
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap gap-1 text-sm font-semibold text-white">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const rounded = index === 0 && "rounded-l-md";

          return (
            <li key={`${index}-${item.label}`} className="flex">
              {isCurrent ? (
                <span
                  aria-current="page"
                  className={cn(
                    chip,
                    rounded,
                    "bg-brand-red pr-7 clip-arrow-r",
                  )}
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    chip,
                    rounded,
                    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    ancestor.link,
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(chip, rounded, ancestor.plain)}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
