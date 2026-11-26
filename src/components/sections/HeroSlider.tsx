"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { HeroSlide } from "@/data/site-data";
import { cn } from "@/lib/cn";
import {
  HERO_FADE_MS,
  HERO_SLIDE_MS,
  HERO_ZOOM_MS,
  nextSlide,
} from "@/lib/hero";
import type { MediaProps } from "@/lib/media";
import { useHydrated } from "@/lib/use-hydrated";
import { useReducedMotion } from "@/lib/use-media-query";

export type HeroSlideProps = MediaProps & Pick<HeroSlide, "focal">;

type HeroSliderProps = {
  /** From mediaProps(), computed on the server. Slide 1 is the LCP image. */
  slides: HeroSlideProps[];
  /** Overlay drawn above the photos and below the controls. */
  overlay?: ReactNode;
  className?: string;
};

/* Tab visibility, so the slideshow stops while nobody can see it. */
function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
const isHidden = () => document.hidden;
const isHiddenOnServer = () => false;

function prefersSavingData(): boolean {
  const { connection } = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  return connection?.saveData === true;
}

/**
 * Hero photo slideshow: crossfades every 6s with a slow zoom on the photo
 * on screen.
 *
 * Only slide 1 is in the server HTML (preloaded, high priority: it is the
 * LCP element). Slides 2 and 3 are added once the page has loaded and the
 * browser is idle, and the show only moves to a slide whose photo has
 * arrived. It pauses on hover, on keyboard focus, while the tab is hidden and
 * when the pause button is pressed. Under reduced motion (or Save-Data) it
 * stays on slide 1, without controls.
 */
export function HeroSlider({ slides, overlay, className }: HeroSliderProps) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    isHidden,
    isHiddenOnServer,
  );

  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [loadRest, setLoadRest] = useState(false);
  const [loaded, setLoaded] = useState(() => slides.map((_, i) => i === 0));
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const running = playing && !hovered && !focused && !hidden && !reduced;

  // Fetch slides 2 and 3 only after the load event, when the browser is idle.
  useEffect(() => {
    if (reduced || prefersSavingData()) return;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if ("requestIdleCallback" in window) {
        idle = window.requestIdleCallback(() => setLoadRest(true), {
          timeout: 2000,
        });
      } else {
        timer = setTimeout(() => setLoadRest(true), 200);
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, [reduced]);

  const show = (index: number) => {
    setLoadRest(true);
    if (index === active) return;
    setLeaving(active);
    setActive(index);
  };

  useEffect(() => {
    if (!running) return;
    const next = nextSlide(active, loaded);
    if (next === active) return;
    const timer = setTimeout(() => {
      setLeaving(active);
      setActive(next);
    }, HERO_SLIDE_MS);
    return () => clearTimeout(timer);
  }, [running, active, loaded]);

  const markLoaded = (index: number) =>
    setLoaded((current) =>
      current[index] ? current : current.map((v, i) => v || i === index),
    );

  // Touch "hover" would pause the show after every tap; only a mouse counts.
  const onPointer = (over: boolean) => (event: PointerEvent) => {
    if (event.pointerType === "mouse") setHovered(over);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Photos of our lab"
      data-hydrated={hydrated || undefined}
      data-paused={running ? undefined : ""}
      onPointerEnter={onPointer(true)}
      onPointerLeave={onPointer(false)}
      // Keyboard focus pauses; a mouse click on a dot should not.
      onFocus={(event) => {
        if (event.target.matches(":focus-visible")) setFocused(true);
      }}
      onBlur={onBlur}
      className={cn("hero-slider isolate overflow-hidden", className)}
    >
      {/* From lg the photos fade in from the left, so they melt into the hero's own gradient. */}
      <div className="absolute inset-0 isolate lg:hero-fade">
        {slides.map((slide, index) => {
          if (index > 0 && !loadRest) return null;
          const state =
            index === active
              ? "active"
              : index === leaving
                ? "leaving"
                : "idle";
          const { src, alt, placeholder, blurDataURL } = slide;
          return (
            <div
              key={src}
              data-slide={index}
              data-state={state}
              aria-hidden={state === "active" ? undefined : true}
              className="hero-slide absolute inset-0"
              style={{ transitionDuration: `${HERO_FADE_MS}ms` }}
            >
              <div
                className="hero-zoom absolute inset-0"
                style={{ animationDuration: `${HERO_ZOOM_MS}ms` }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(min-width: 64rem) 55vw, 100vw"
                  className={cn(
                    "object-cover",
                    slide.focal === "right" ? "object-right" : "object-center",
                  )}
                  onLoad={() => markLoaded(index)}
                  {...(index === 0
                    ? {
                        // The LCP image: fetched first, painted in the frame
                        // it arrives. No blur placeholder: it would barely
                        // show, and its SVG filter costs raster time across
                        // the whole hero on a slow phone.
                        preload: true,
                        fetchPriority: "high",
                        loading: "eager",
                        decoding: "sync",
                      }
                    : { loading: "eager", placeholder, blurDataURL })}
                />
              </div>
            </div>
          );
        })}

        {overlay}
      </div>

      <div className="absolute bottom-[3.75rem] left-1 z-20 flex items-center motion-reduce:hidden sm:left-3 lg:bottom-16 lg:left-6">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => show(index)}
            className="group grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2.5 rounded-full bg-white ring-1 ring-navy/40 transition-[opacity,transform] duration-300",
                index === active
                  ? "scale-125"
                  : "opacity-60 group-hover:opacity-90",
              )}
            />
          </button>
        ))}
        <button
          type="button"
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          onClick={() => setPlaying((p) => !p)}
          className="ml-1 grid size-11 place-items-center rounded-full text-white ring-1 ring-white/50 ring-inset hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-4" />
          ) : (
            <Play aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
