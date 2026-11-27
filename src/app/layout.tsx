import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import {
  FloatingWhatsApp,
  Footer,
  Header,
  ScrollToTop,
  SkipLink,
  Splash,
} from "@/components/layout";
import { brand } from "@/data/site-data";
import { JsonLd, organizationJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import { splashHeadScript } from "@/lib/splash";
import { waPingHeadScript } from "@/lib/wa-ping";
import { validateSiteData } from "@/lib/validate";
import "./globals.css";

// Fails the build (and the dev server) if site-data.ts is not safe to render.
validateSiteData();

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-montserrat",
});

const MAIN_ID = "main";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: brand.displayName,
    template: `%s | ${brand.displayName}`,
  },
  applicationName: brand.displayName,
  // Phone numbers are already tel: links; stop iOS restyling other digits.
  formatDetection: { telephone: false },
  openGraph: {
    siteName: brand.displayName,
    locale: "en_PK",
    type: "website",
  },
};

// "cover" lets the page run under a notch and the home indicator, and makes
// env(safe-area-inset-*) report them; the gutters (px-gutter), the floating
// buttons (fab-right/fab-left), the drawer and the footer's safe zone
// (pb-fab-zone) keep content clear of both.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The head scripts may add data-splash / data-wa-ping before React hydrates.
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashHeadScript }} />
        <script dangerouslySetInnerHTML={{ __html: waPingHeadScript }} />
        <noscript>
          <style>{".splash { display: none }"}</style>
        </noscript>
      </head>
      {/* relative: page-height sentinels (ScrollToTop) are clamped to the body. */}
      <body className="relative bg-white font-sans text-ink antialiased">
        <Splash />
        <JsonLd data={organizationJsonLd()} />
        <SkipLink targetId={MAIN_ID} />
        <Header />
        {/* Pages render their content only; the one <main> lives here. */}
        <main id={MAIN_ID} tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <ScrollToTop mainId={MAIN_ID} />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
