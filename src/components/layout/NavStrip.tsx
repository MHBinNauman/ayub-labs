"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { isActivePath, type NavItem, type ServiceMenuGroup } from "@/lib/paths";
import { MegaMenu } from "./MegaMenu";
import { navItemClass } from "./nav-styles";

type NavStripProps = {
  items: NavItem[];
  serviceMenu: ServiceMenuGroup[];
};

/**
 * Desktop (lg+) main navigation: the white strip that stays visible when the
 * header sticks. `pathname` is null while it is unknown (see Header.tsx).
 */
export function NavStripView({
  items,
  serviceMenu,
  pathname,
}: NavStripProps & { pathname: string | null }) {
  return (
    <nav
      aria-label="Main"
      className="relative hidden border-b border-ink/10 bg-nav-strip lg:block"
    >
      <Container>
        <ul className="-mx-4 flex h-14">
          {items.map((item) =>
            item.megaMenu ? (
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
                  aria-current={
                    isActivePath(pathname, item.href) ? "page" : undefined
                  }
                  className={navItemClass(isActivePath(pathname, item.href))}
                >
                  {item.label}
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
