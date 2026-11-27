import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Button, Container } from "@/components/ui";
import { BranchStatusChip } from "@/components/ui/BranchStatusChip";
import { HexPattern } from "@/components/ui/HexPattern";
import { brand, branches, contact, media } from "@/data/site-data";
import { cn } from "@/lib/cn";
import { heroOverlayVars } from "@/lib/hero";
import { tel, whatsapp } from "@/lib/links";
import { mediaProps } from "@/lib/media";
import { routes } from "@/lib/nav";
import {
  cities,
  joinList,
  keepHyphens,
  offeringPhrase,
  primaryBranch,
  primaryPhone,
  registeredWithShort,
  verifiedRegistrations,
  whatsappGreeting,
} from "@/lib/site";
import { HeroIllustration } from "./HeroIllustration";
import { HeroSlider } from "./HeroSlider";

/** "In Quality We Believe" → "In quality we believe.", with "quality" underlined in brand red. */
function TaglineLine() {
  const sentence = brand.tagline.value
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
  const [before, after] = sentence.split(/\bquality\b/);
  if (after === undefined) return <>{sentence}.</>;
  return (
    <>
      {before}
      {/*
       * Red text on this navy gradient is about 2:1, below WCAG's 3:1 for
       * large text, so the word stays white and carries a red underline.
       */}
      <span className="underline decoration-brand-red decoration-[0.12em] underline-offset-[0.14em]">
        quality
      </span>
      {after}.
    </>
  );
}

/** The template's "hero-note" row: three short facts, each from site-data. */
function heroNotes(): Array<{ label: string; Icon: LucideIcon }> {
  return [
    { label: `Since ${brand.foundedYear.value}`, Icon: CalendarCheck },
    ...(verifiedRegistrations.length > 0
      ? [{ label: `${registeredWithShort} registered`, Icon: ShieldCheck }]
      : []),
    {
      label: `${branches.length} ${branches.length === 1 ? "branch" : "branches"}`,
      Icon: MapPin,
    },
  ];
}

function RegisteredCard({ className }: { className?: string }) {
  if (verifiedRegistrations.length === 0) return null;
  return (
    <div
      className={cn(
        "items-center gap-4 rounded-2xl bg-white p-4 pr-5 text-ink shadow-card-hover",
        className,
      )}
    >
      <ul className="flex shrink-0 gap-2">
        {verifiedRegistrations.map((registration) => (
          <li
            key={registration.id}
            className="relative size-12 rounded-lg border border-ink/10 bg-white"
          >
            <Image
              src={registration.logo}
              alt={registration.name}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </li>
        ))}
      </ul>
      <p className="text-sm leading-snug">
        <span className="block text-muted">Registered with</span>
        <span className="block font-bold text-navy">{registeredWithShort}</span>
      </p>
    </div>
  );
}

/**
 * Homepage hero. Below lg the photo slideshow is the whole background under
 * a navy overlay; from lg it fills the right 55% and melts into the navy
 * behind the copy. Only HeroSlider runs in the browser.
 *
 * Copy is solid white below lg: over a photo, white/85 text would fall
 * below 4.5:1 on a light pixel (see hero.test.ts).
 */
export function Hero() {
  const sub = offeringPhrase(["laboratory", "diagnostics", "clinics"]);
  const slides = media.hero.map((slide) => ({
    ...mediaProps(slide),
    focal: slide.focal,
  }));

  return (
    <section
      aria-labelledby="hero-heading"
      data-hero
      style={heroOverlayVars as CSSProperties}
      className="relative isolate flex min-h-[calc(100svh-6.75rem)] overflow-hidden bg-linear-to-br from-navy to-brand-blue text-white lg:min-h-155"
    >
      <HexPattern />

      <HeroSlider
        slides={slides}
        className="absolute inset-0 lg:left-auto lg:w-[55%]"
        overlay={
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 hero-mask-mobile lg:hero-mask"
          />
        }
      />
      {/* At the visible seam, where the photo comes through the mask, below the headline. */}
      <HeroIllustration className="hero-float absolute top-[60%] left-[60%] hidden w-52 -translate-x-1/2 -translate-y-1/2 opacity-60 lg:block xl:w-60" />

      {/*
       * Bottom padding holds the slider controls (3.75rem up) and the 3rem
       * the quick-action cards overlap, so neither can cover the copy. The
       * container spans the photos too, so it lets the pointer through to
       * the slider (hover pause, dots); only its content takes clicks.
       */}
      <Container className="pointer-events-none relative z-10 flex flex-col justify-center pt-5 pb-28 sm:pt-12 lg:pt-16 lg:pb-32">
        <div className="pointer-events-auto lg:w-[57%] lg:pr-6">
          <p className="text-sm font-semibold tracking-wider uppercase lg:text-white/85">
            <span className="sm:hidden">
              Since {brand.foundedYear.value} ·{" "}
            </span>
            {joinList(cities, "&")}
          </p>
          <h1
            id="hero-heading"
            className="mt-3 text-[1.875rem] leading-[1.1] font-extrabold tracking-tight text-balance sm:mt-4 sm:text-5xl xl:text-6xl"
          >
            Reliable diagnostics.
            <br />
            <TaglineLine />
          </h1>
          <p className="mt-3 max-w-xl text-base text-pretty sm:mt-5 sm:text-lg lg:text-white/85">
            {keepHyphens(
              `${sub[0].toUpperCase()}${sub.slice(1)} in ${joinList(cities)}.`,
            )}
          </p>

          {/*
           * Stacked, not wrapped: the chip changes width when it goes live
           * after hydration, and in a wrapping row that re-flowed the line
           * and pushed the CTAs down (CLS 0.10).
           */}
          <div className="mt-4 flex flex-col items-start gap-2 text-sm sm:mt-6 lg:text-white/85">
            <span>{primaryBranch.name}</span>
            <BranchStatusChip
              branch={{
                hours: primaryBranch.hours,
                hoursVerified: primaryBranch.hoursVerified,
              }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:items-center">
            <Button
              href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
              target="_blank"
              variant="whatsapp"
              className="px-3 focus-visible:outline-white sm:min-h-14 sm:px-7 sm:text-lg"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              WhatsApp us
            </Button>
            <Button
              href={tel(primaryPhone.e164)}
              variant="inverse"
              className="px-3 sm:min-h-14 sm:px-7 sm:text-lg"
            >
              <Phone aria-hidden="true" className="size-5" />
              Call now
            </Button>
            <Link
              href={routes.reports}
              className="group col-span-2 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md px-1 font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-white sm:px-2"
            >
              Get your report
              <ArrowRight
                aria-hidden="true"
                className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <ul className="mt-8 hidden flex-wrap gap-x-6 gap-y-3 border-t border-white/20 pt-6 text-sm font-semibold sm:flex">
            {heroNotes().map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white shadow-card">
                  <Icon
                    aria-hidden="true"
                    className="size-4.5 text-brand-red"
                  />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <RegisteredCard className="pointer-events-auto absolute right-8 bottom-20 hidden lg:flex" />
      </Container>
    </section>
  );
}
