import Link from "next/link";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

const chip = "flex min-h-11 items-center px-4 py-2";

/**
 * Chip-style breadcrumb trail. Ancestors are navy links; the last item is the
 * current page, shown as a red chip with an arrow-shaped right edge.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
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
                    "bg-navy transition-colors hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(chip, rounded, "bg-navy")}>
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
