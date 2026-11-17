import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import {
  FloatingWhatsApp,
  Footer,
  Header,
  SkipLink,
} from "@/components/layout";
import { brand } from "@/data/site-data";
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
  metadataBase: new URL(`https://${brand.domain}`),
  title: {
    default: brand.displayName,
    template: `%s | ${brand.displayName}`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="bg-white font-sans text-ink antialiased">
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
