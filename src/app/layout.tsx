import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import {
  FloatingWhatsApp,
  Footer,
  Header,
  SkipLink,
  Splash,
} from "@/components/layout";
import { brand } from "@/data/site-data";
import { JsonLd, organizationJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import { splashHeadScript } from "@/lib/splash";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The head script may add data-splash before React hydrates.
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashHeadScript }} />
        <noscript>
          <style>{".splash { display: none }"}</style>
        </noscript>
      </head>
      <body className="bg-white font-sans text-ink antialiased">
        <Splash />
        <JsonLd data={organizationJsonLd()} />
        <SkipLink targetId={MAIN_ID} />
        <Header />
        {/* Pages render their content only; the one <main> lives here. */}
        <main id={MAIN_ID} tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
