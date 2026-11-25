"use client";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { NavItem } from "@/data/site-data";
import { cn } from "@/lib/cn";
import { ariaCurrent, isActivePath, type ServiceMenuGroup } from "@/lib/paths";
import { serviceIcon } from "@/lib/service-icons";

type MobileNavProps = {
  items: NavItem[];
  serviceMenu: ServiceMenuGroup[];
  /** Rendered on the server: the logo for the drawer's top row. */
  logo: ReactNode;
  /** Rendered on the server: Call | WhatsApp | Directions. */
  actionBar: ReactNode;
};

/**
 * Hamburger button (below lg) and the full-screen navy drawer it opens.
 *
 * The drawer is a modal <dialog>, so the browser makes the page behind it
 * inert, keeps focus inside, closes it on Esc and returns focus to the
 * hamburger. It is only mounted while open, so the nav links exist in the DOM
 * once, not as a hidden mobile copy.
 */
export function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-11 shrink-0 place-items-center rounded-lg text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
      >
        <Menu aria-hidden="true" className="size-6" />
        <span className="sr-only">Menu</span>
      </button>
      {open && <Drawer {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Matches Tailwind's lg breakpoint: the drawer has no purpose at desktop widths. */
const DESKTOP_QUERY = "(min-width: 64rem)";

function Drawer({
  items,
  serviceMenu,
  logo,
  actionBar,
  onClose,
}: MobileNavProps & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Guarded: in development React runs this effect twice.
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialog.close();
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const close = () => dialogRef.current?.close();

  // Choosing a page closes the drawer. tel:, WhatsApp and map links leave it
  // open, so the visitor is still in the menu when they come back.
  function onClick(event: MouseEvent<HTMLDialogElement>) {
    const link = (event.target as Element).closest("a");
    if (link?.getAttribute("href")?.startsWith("/")) close();
  }

  const linkClass = (active: boolean) =>
    cn(
      "flex min-h-14 items-center rounded-lg px-3 text-lg font-semibold transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white",
      active &&
        "bg-white/10 underline decoration-brand-red decoration-2 underline-offset-8",
    );

  return (
    // The dialog's own `close` event drives unmounting, whatever closed it.
    <dialog
      ref={dialogRef}
      data-scroll-lock=""
      aria-label="Menu"
      onClose={onClose}
      onClick={onClick}
      className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-navy p-0 text-white motion-safe:animate-drawer-in"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/15 px-4 sm:px-6">
          {logo}
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="grid size-11 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X aria-hidden="true" className="size-6" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav
          aria-label="Main"
          className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-4"
        >
          <ul className="divide-y divide-white/10">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);

              if (!item.hasMegaMenu) {
                return (
                  <li key={item.href} className="py-1">
                    <Link
                      href={item.href}
                      aria-current={ariaCurrent(pathname, item.href)}
                      className={linkClass(active)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href} className="py-1">
                  <details open={active} className="accordion-item group">
                    <summary
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        linkClass(active),
                        "cursor-pointer list-none justify-between [&::-webkit-details-marker]:hidden",
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        aria-hidden="true"
                        className="size-5 group-open:rotate-180 motion-safe:transition-transform"
                      />
                    </summary>
                    <div className="px-3 pb-3">
                      {serviceMenu.map((group) => (
                        <div key={group.category} className="mt-3">
                          <p className="text-xs font-bold tracking-wider text-white/75 uppercase">
                            {group.label}
                          </p>
                          <ul className="mt-1">
                            {group.items.map((service) => {
                              const Icon = serviceIcon(service.icon);
                              const current = isActivePath(
                                pathname,
                                service.href,
                              );
                              return (
                                <li key={service.href}>
                                  <Link
                                    href={service.href}
                                    aria-current={current ? "page" : undefined}
                                    className={cn(
                                      "-mx-2 flex min-h-12 items-center gap-3 rounded-lg px-2 font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white",
                                      current && "bg-white/10",
                                    )}
                                  >
                                    {Icon && (
                                      <Icon
                                        aria-hidden="true"
                                        className="size-5 shrink-0 text-white/75"
                                      />
                                    )}
                                    {service.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                      <Link
                        href={item.href}
                        className="-mx-2 mt-3 flex min-h-12 items-center gap-2 rounded-lg px-2 font-semibold transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                      >
                        View all services
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/15 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          {actionBar}
        </div>
      </div>
    </dialog>
  );
}
