import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionEntry = {
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
};

type AccordionProps = {
  items: AccordionEntry[];
  /** Allow only one item open at a time. */
  exclusive?: boolean;
  className?: string;
};

/**
 * Native <details>/<summary>, so it works without JavaScript and keeps the
 * browser's keyboard and find-in-page behaviour. The open/close animation
 * lives in globals.css (.accordion-item).
 */
export function Accordion({
  items,
  exclusive = false,
  className,
}: AccordionProps) {
  const groupName = useId();

  return (
    <div
      className={cn(
        "divide-y divide-ink/10 overflow-hidden rounded-card border border-ink/10 bg-white",
        className,
      )}
    >
      {items.map((item) => (
        <details
          key={item.title}
          name={exclusive ? groupName : undefined}
          open={item.defaultOpen}
          className="accordion-item group"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-navy hover:bg-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue [&::-webkit-details-marker]:hidden">
            {item.title}
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 group-open:rotate-180 motion-safe:transition-transform"
            />
          </summary>
          <div className="px-5 pt-1 pb-5 text-ink">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
