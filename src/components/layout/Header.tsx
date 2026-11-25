import { MessageCircle, Navigation, Phone } from "lucide-react";
import { Suspense } from "react";
import { Button, Container } from "@/components/ui";
import { contact, navigation } from "@/data/site-data";
import { mapsDirections, tel, whatsapp } from "@/lib/links";
import { serviceMenu } from "@/lib/nav";
import { primaryBranch, primaryPhone, whatsappGreeting } from "@/lib/site";
import { HeaderShadow } from "./HeaderShadow";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavStrip, NavStripView } from "./NavStrip";
import { TopBar } from "./TopBar";

const HEADER_ID = "site-header";

/**
 * The one site header: top bar, navy header band and (lg+) nav strip, in a
 * single <header> for every screen size.
 *
 * The whole header is sticky with a negative `top` equal to the height of
 * the part that should scroll away, so only the bottom stays pinned:
 *   below lg: top bar (h-11) scrolls away, the band (logo + menu) sticks;
 *   lg+:      top bar (h-11) + band (h-22) = 132px scroll away, the nav
 *             strip sticks.
 * Keep these heights in sync with TopBar, the band below and the sentinel in
 * HeaderShadow.
 */
export function Header() {
  const whatsappHref = whatsapp(contact.whatsapp.number, whatsappGreeting);
  const directionsHref =
    primaryBranch.googleMapsUrl ?? mapsDirections(primaryBranch.mapQuery);

  return (
    <>
      <HeaderShadow headerId={HEADER_ID} />
      <header
        id={HEADER_ID}
        className="sticky -top-11 z-40 transition-shadow duration-200 data-stuck:shadow-card lg:-top-33"
      >
        <TopBar />

        <div className="bg-navy">
          <Container className="flex h-16 items-center justify-between gap-2 lg:h-22">
            <Logo eager />

            <div className="flex shrink-0 items-center gap-2 lg:gap-3">
              <Button
                href={tel(primaryPhone.e164)}
                variant="inverse"
                size="sm"
                className="max-sm:w-11 max-sm:px-0"
              >
                <Phone aria-hidden="true" className="size-4" />
                <span className="sr-only sm:not-sr-only">Call</span>
                <span className="hidden xl:inline">{primaryPhone.display}</span>
              </Button>
              <Button
                href={whatsappHref}
                target="_blank"
                variant="whatsapp"
                size="sm"
                className="hidden focus-visible:outline-white sm:inline-flex"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
                WhatsApp
              </Button>
              <MobileNav
                items={navigation.navItems}
                serviceMenu={serviceMenu}
                logo={<Logo size="md" />}
                actionBar={
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      href={tel(primaryPhone.e164)}
                      variant="secondary"
                      className="min-h-14 flex-col gap-1 border-white px-2 text-sm hover:bg-surface hover:text-navy focus-visible:outline-white"
                    >
                      <Phone aria-hidden="true" className="size-5" />
                      Call
                    </Button>
                    <Button
                      href={whatsappHref}
                      target="_blank"
                      variant="whatsapp"
                      className="min-h-14 flex-col gap-1 px-2 text-sm focus-visible:outline-white"
                    >
                      <MessageCircle aria-hidden="true" className="size-5" />
                      WhatsApp
                    </Button>
                    <Button
                      href={directionsHref}
                      target="_blank"
                      variant="inverse"
                      aria-label={`Directions to ${primaryBranch.name}`}
                      className="min-h-14 flex-col gap-1 px-2 text-sm"
                    >
                      <Navigation aria-hidden="true" className="size-5" />
                      Directions
                    </Button>
                  </div>
                }
              />
            </div>
          </Container>
        </div>

        {/*
         * usePathname suspends on routes whose params are only known at
         * request time; the fallback is the same strip with no active link.
         */}
        <Suspense
          fallback={
            <NavStripView
              items={navigation.navItems}
              serviceMenu={serviceMenu}
              pathname={null}
            />
          }
        >
          <NavStrip items={navigation.navItems} serviceMenu={serviceMenu} />
        </Suspense>
      </header>
    </>
  );
}
