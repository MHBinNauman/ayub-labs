"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import type { NavItem } from "@/data/site-data";
import { ariaCurrent, isActivePath, type ServiceMenuGroup } from "@/lib/paths";
import { MegaMenu } from "./MegaMenu";
import { navItemClass, navUnderlineClass } from "./nav-styles";

type NavStripProps = {
  items: NavItem[];
  serviceMenu: ServiceMenuGroup[];
};

/**
 * Desktop (lg+) main navigation: the white strip that stays visible when the
 * header sticks. `pathname` is null while it is unknown (see Header.tsx).
 *
 * 90% white with a backdrop blur: it only looks different once the page
 * scrolls beneath it, so there is no state to animate. Ink on it stays far
 * above AA.
 */
export function NavStripView({
  items,
  serviceMenu,
  pathname,
}: NavStripProps & { pathname: string | null }) {
  return (
    <nav
      aria-label="Main"
      className="relative hidden border-b border-ink/10 bg-nav-strip/90 backdrop-blur-md lg:block"
    >
      <Container>
        <ul className="-mx-4 flex h-14">
          {items.map((item) =>
            item.hasMegaMenu ? (
              <MegaMenu
                key={item.href}
                item={item}
                groups={serviceMenu}
                pathname={pathname}
              />
            ) : (
              <li key={item.href} className="flex">
                <Link
                  href={item.href}
                  aria-current={ariaCurrent(pathname, item.href)}
                  className={navItemClass(isActivePath(pathname, item.href))}
                >
                  {item.label}
                  {isActivePath(pathname, item.href) && (
                    <span aria-hidden="true" className={navUnderlineClass} />
                  )}
                </Link>
              </li>
            ),
          )}
        </ul>
      </Container>
    </nav>
  );
}

export function NavStrip(props: NavStripProps) {
  return <NavStripView {...props} pathname={usePathname()} />;
}
