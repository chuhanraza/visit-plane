import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import SharedNavbar from "@/components/SharedNavbar";
import ExitIntentModal from "@/components/ExitIntentModal";
import SharedFooter from "@/components/SharedFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const RTL_LOCALES = ["ar", "ur"];

// ─── 1. Metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://www.visitplane.com"),

  title: {
    default: "VisitPlane - Visa Requirements for 197 Countries",
    template: "%s | VisitPlane",
  },

  description:
    "VisitPlane: Free visa requirements, passport strength checker, document checklists and embassy finder for 197 countries. Instant visa information. No signup required.",

  keywords: [
    "VisitPlane",
    "visitplane.com",
    "visa requirements",
    "passport strength checker",
    "visa free countries",
    "embassy finder",
    "visa checklist",
    "travel visa guide",
    "Pakistan visa requirements",
    "India visa requirements",
    "schengen visa",
    "uk visa requirements",
    "usa visa requirements",
    "dubai visa requirements",
    "free visa information",
    "visa processing time",
    "visa cost calculator",
  ],

  authors: [{ name: "VisitPlane" }],
  creator: "VisitPlane",
  publisher: "VisitPlane",

  verification: {
    google: "_1giyu5DMW8eS91AviSVAkCw5XGFIZHLU7gsHINSAm8",
  },

  alternates: {
    canonical: "https://www.visitplane.com",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.visitplane.com",
    siteName: "VisitPlane",
    title: "VisitPlane - Visa Requirements for 197 Countries",
    description:
      "Free visa requirements, passport strength checker, document checklists and embassy finder for 197 countries. Instant visa information. No signup required.",
    images: [
      {
        url: "/api/og-default",
        width: 1200,
        height: 630,
        alt: "VisitPlane - Visa Requirements for 197 Countries",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@visitplane",
    creator: "@visitplane",
    title: "VisitPlane - Visa Requirements for 197 Countries",
    description:
      "Free visa requirements for 197 countries. Passport strength checker, embassy finder and more.",
    images: ["/api/og-default"],
  },
};

// ─── 2. JSON-LD ───────────────────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VisitPlane",
  url: "https://www.visitplane.com",
  logo: "https://www.visitplane.com/logo-v2.png",
  description:
    "Free visa requirements and travel tools for 197 countries — passport strength checker, embassy finder, document checklists and more.",
  sameAs: [
    "https://twitter.com/visitplane",
    "https://www.facebook.com/visitplane",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://www.visitplane.com/contact",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VisitPlane",
  url: "https://www.visitplane.com",
  description:
    "Free visa requirements for 197 countries — VisitPlane gives travelers instant, accurate visa information with no signup required.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate:
        "https://www.visitplane.com/visa/{passport}/{destination}",
    },
    "query-input": "required name=destination",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "VisitPlane",
  url: "https://www.visitplane.com",
  description:
    "Visa requirements platform — get instant visa requirements for 197 countries and know exactly what documents you need. Free, fast, always updated. No signup required.",
  applicationCategory: "TravelApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SharedNavbar />
          <main className="flex-1">{children}</main>
          <SharedFooter />
        </NextIntlClientProvider>
        <GoogleTagManager gtmId="GTM-PE2H5RR8HK" />
        {/* Capture Point 3 — Exit Intent Modal (desktop only) */}
        <ExitIntentModal />
      </body>
    </html>
  );
}
