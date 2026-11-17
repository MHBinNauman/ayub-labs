"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { flushSync } from "react-dom";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import type { NavItem, ServiceMenuGroup } from "@/lib/nav";
import { isActivePath } from "@/lib/nav";
import { serviceIcon } from "@/lib/service-icons";
import { navItemClass } from "./nav-styles";

/** Hover must rest this long before the menu opens, so passing over it does nothing. */
const OPEN_DELAY_MS = 120;
/** Grace period for the pointer to travel from the trigger into the panel. */
const CLOSE_DELAY_MS = 150;

type OpenedBy = "hover" | "click" | "keyboard";

type MegaMenuProps = {
  item: NavItem;
  groups: ServiceMenuGroup[];
  pathname: string | null;
};

/**
 * Desktop services mega menu: a disclosure button plus a full-width panel.
 *
 * - Mouse: opens after resting 120ms on the trigger; closes shortly after the
 *   pointer leaves, unless it was opened by a click.
 * - Click / Enter / Space toggle it; ArrowDown opens it and focuses the first
 *   link; ArrowUp/ArrowDown move between links.
 * - While open, Tab and Shift+Tab cycle between the trigger and the panel's
 *   links. Esc closes it and returns focus to the trigger, as does a click
 *   outside (without moving focus) or choosing a link.
 *
 * Must render inside a positioned ancestor (the nav strip) that the panel
 * spans.
 */
export function MegaMenu({ item, groups, pathname }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const openedBy = useRef<OpenedBy | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const active = isActivePath(pathname, item.href);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const openMenu = useCallback(
    (by: OpenedBy) => {
      clearTimer();
      openedBy.current = by;
      // Synchronous, so the panel is visible before anything is focused in it.
      flushSync(() => setOpen(true));
    },
    [clearTimer],
  );

  const closeMenu = useCallback(
    (returnFocus = false) => {
      clearTimer();
      openedBy.current = null;
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [clearTimer],
  );

  /** The trigger followed by every link in the panel, in Tab order. */
  const focusables = useCallback((): HTMLElement[] => {
    const links = panelRef.current?.querySelectorAll<HTMLElement>("a[href]");
    return [
      ...(triggerRef.current ? [triggerRef.current] : []),
      ...(links ?? []),
    ];
  }, []);

  // A click anywhere outside closes the menu without stealing focus. Esc
  // also works when the menu was opened by hover and focus is elsewhere.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: globalThis.PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu();
    }
    function onDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      const focusInside = rootRef.current?.contains(document.activeElement);
      closeMenu(focusInside);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [open, closeMenu]);

  useEffect(() => clearTimer, [clearTimer]);

  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    clearTimer();
    if (!open) {
      timer.current = setTimeout(() => openMenu("hover"), OPEN_DELAY_MS);
    }
  }

  function onPointerLeave(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    clearTimer();
    if (open && openedBy.current === "hover") {
      timer.current = setTimeout(() => closeMenu(), CLOSE_DELAY_MS);
    }
  }

  function onTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    // detail is 0 for clicks synthesised from Enter or Space.
    const by: OpenedBy = event.detail === 0 ? "keyboard" : "click";
    if (!open) {
      openMenu(by);
    } else if (openedBy.current === "hover" && by === "click") {
      // The hover already opened it; a click means "keep it open".
      openedBy.current = "click";
    } else {
      closeMenu();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    const isTrigger = event.target === triggerRef.current;

    if (!open) {
      if (isTrigger && event.key === "ArrowDown") {
        event.preventDefault();
        openMenu("keyboard");
        focusables()[1]?.focus();
      }
      return;
    }

    const items = focusables();
    const index = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      // Escape is handled by the document listener above.
      case "Tab": {
        // Focus trap: wrap from the last link to the trigger and back.
        const last = items.length - 1;
        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          items[last]?.focus();
        } else if (!event.shiftKey && index === last) {
          event.preventDefault();
          items[0]?.focus();
        }
        return;
      }
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        // Links only; the trigger is reached with Tab or Esc.
        const links = items.slice(1);
        const current = links.indexOf(document.activeElement as HTMLElement);
        const next =
          current === -1
            ? step === 1
              ? 0
              : links.length - 1
            : (current + step + links.length) % links.length;
        links[next]?.focus();
        return;
      }
      case "Home":
      case "End": {
        if (isTrigger) return;
        event.preventDefault();
        const links = items.slice(1);
        links[event.key === "Home" ? 0 : links.length - 1]?.focus();
        return;
      }
    }
  }

  function onPanelClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("a")) closeMenu();
  }

  return (
    <li
      ref={rootRef}
      className="flex"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onTriggerClick}
        className={navItemClass(active, open)}
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 motion-safe:transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        onClick={onPanelClick}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-ink/10 bg-white shadow-card-hover motion-safe:animate-menu-in"
      >
        <Container className="py-8">
          <div className="grid grid-cols-4 gap-8">
            {groups.map((group) => {
              const headingId = `${panelId}-${group.category}`;
              return (
                <div key={group.category}>
                  <p
                    id={headingId}
                    className="border-b border-ink/10 pb-2 text-xs font-bold tracking-wider text-muted uppercase"
                  >
                    {group.label}
                  </p>
                  <ul aria-labelledby={headingId} className="mt-3 space-y-1">
                    {group.items.map((service) => {
                      const Icon = serviceIcon(service.icon);
                      const current = isActivePath(pathname, service.href);
                      return (
                        <li key={service.href}>
                          <Link
                            href={service.href}
                            aria-current={current ? "page" : undefined}
                            className={cn(
                              "-mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors hover:bg-tint hover:text-navy focus-visible:outline-2 focus-visible:outline-brand-blue",
                              current ? "text-navy" : "text-ink",
                            )}
                          >
                            {Icon && (
                              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-tint text-brand-blue">
                                <Icon aria-hidden="true" className="size-4" />
                              </span>
                            )}
                            {service.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-ink/10 pt-4">
            <Link
              href={item.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-navy transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              View all services
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </Container>
      </div>
    </li>
  );
}
