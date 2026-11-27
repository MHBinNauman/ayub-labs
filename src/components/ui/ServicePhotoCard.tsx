import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { MediaProps } from "@/lib/media";
import { serviceIcon } from "@/lib/service-icons";
import type { ServiceCardData } from "./ServiceCard";
import { ServiceIcon } from "./ServiceIcon";

/** A service card plus its photo (mediaProps, built on the server), if it has one. */
export type ServicePhotoCardData = ServiceCardData & { image?: MediaProps };

/**
 * Homepage service card: a 16:10 photo on top, then name, two-line summary
 * and "Learn more". On hover it takes the shared card lift (card-hover in
 * globals.css, which also zooms the data-card-media photo to 1.05), a 15%
 * navy wash fades over the photo and the arrow nudges right. A service with no photo shows its icon on
 * the tint panel instead, so the grid stays even.
 *
 * The name is a stretched link, so the whole card is the click target while
 * screen readers hear one link. Returns an <li>: render it inside a <ul>.
 */
export function ServicePhotoCard({
  service,
  headingLevel: Heading = "h3",
  className,
}: {
  service: ServicePhotoCardData;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const { image } = service;

  return (
    <li
      className={cn(
        // No overflow-hidden here: it would clip card-hover's shadow layer.
        "group card-hover flex flex-col rounded-card bg-white shadow-card ring-1 ring-ink/5",
        className,
      )}
    >
      <div
        data-card-media
        className="relative aspect-[16/10] overflow-hidden rounded-t-card bg-tint"
      >
        {image ? (
          <>
            <Image
              src={image.src}
              alt={image.alt}
              placeholder={image.placeholder}
              blurDataURL={image.blurDataURL}
              fill
              sizes="(min-width: 1024px) 384px, (min-width: 640px) calc(50vw - 2.5rem), calc(100vw - 2rem)"
              className="object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-navy/15 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-300"
            />
          </>
        ) : (
          serviceIcon(service.icon) && (
            <span className="grid size-full place-items-center text-brand-blue">
              <ServiceIcon name={service.icon} className="size-12" />
            </span>
          )
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Heading className="text-lg font-bold text-balance text-navy">
          <Link
            href={service.href}
            prefetch
            className="rounded-sm after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-blue"
          >
            {service.name}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 text-sm text-muted">
          {service.summary}
        </p>
        <span
          aria-hidden="true"
          className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-brand-blue"
        >
          Learn more
          <ArrowRight className="size-4 group-hover:translate-x-1 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-house" />
        </span>
      </div>
    </li>
  );
}
