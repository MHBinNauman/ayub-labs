import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { BranchStatusChip } from "@/components/ui/BranchStatusChip";
import { brand, contact } from "@/data/site-data";
import { tel, whatsapp } from "@/lib/links";
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

/** Placeholder art; swap for a real photo of the lab when the client supplies one. */
const HERO_IMAGE = "/brand/hero-placeholder.svg";

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

/** Thin hexagon / molecule line pattern, drawn inline. ~6% white on the gradient. */
function HeroPattern() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      className="pointer-events-none absolute inset-0 size-full text-white opacity-[0.06]"
    >
      <defs>
        <pattern
          id="hero-hex"
          width="56"
          height="96"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(1.25)"
        >
          {/* One hexagon plus the stem that joins it to the row below tiles a honeycomb. */}
          <path
            d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 96"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="28" cy="0" r="2.5" fill="currentColor" />
          <circle cx="56" cy="48" r="2.5" fill="currentColor" />
          <circle cx="0" cy="48" r="2.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-hex)" />
    </svg>
  );
}

function RegisteredCard() {
  if (verifiedRegistrations.length === 0) return null;
  return (
    <div className="flex w-fit items-center gap-4 rounded-2xl bg-white p-4 pr-5 text-ink shadow-card-hover lg:absolute lg:bottom-10 lg:-left-10">
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

export function Hero() {
  const sub = offeringPhrase(["laboratory", "diagnostics", "clinics"]);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-linear-to-br from-navy to-brand-blue text-white"
    >
      <HeroPattern />
      {/* Extra bottom padding: the quick-action cards overlap the hero by 3rem. */}
      <Container className="relative grid gap-10 pt-12 pb-24 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pt-20 lg:pb-32">
        <div>
          <p className="text-sm font-semibold tracking-wider text-white/85 uppercase">
            Since {brand.foundedYear.value} · {joinList(cities, "&")}
          </p>
          <h1
            id="hero-heading"
            className="mt-4 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Reliable diagnostics.
            <br />
            <TaglineLine />
          </h1>
          <p className="mt-5 max-w-xl text-lg text-pretty text-white/85">
            {keepHyphens(
              `${sub[0].toUpperCase()}${sub.slice(1)} in ${joinList(cities)}.`,
            )}
          </p>

          {/*
           * Stacked, not wrapped: the chip changes width when it goes live
           * after hydration, and in a wrapping row that re-flowed the line
           * and pushed the CTAs down (CLS 0.10).
           */}
          <div className="mt-6 flex flex-col items-start gap-2 text-sm text-white/85">
            <span>{primaryBranch.name}</span>
            <BranchStatusChip
              branch={{
                hours: primaryBranch.hours,
                hoursVerified: primaryBranch.hoursVerified,
              }}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              href={whatsapp(contact.whatsapp.number, whatsappGreeting)}
              target="_blank"
              variant="whatsapp"
              size="lg"
              className="focus-visible:outline-white"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              WhatsApp us
            </Button>
            <Button href={tel(primaryPhone.e164)} variant="inverse" size="lg">
              <Phone aria-hidden="true" className="size-5" />
              Call now
            </Button>
            <Link
              href={routes.reports}
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-white"
            >
              Get your report
              <ArrowRight
                aria-hidden="true"
                className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative hidden aspect-4/5 overflow-hidden rounded-3xl shadow-card-hover ring-1 ring-white/15 lg:block">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              sizes="(min-width: 80rem) 480px, 38vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-navy/20" />
          </div>
          <RegisteredCard />
        </div>
      </Container>
    </section>
  );
}
