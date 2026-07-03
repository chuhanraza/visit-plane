import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CommandPalette from "@/components/layout/CommandPalette";
import ChromeGate from "@/components/layout/ChromeGate";
import { CommandPaletteProvider } from "@/components/layout/CommandPaletteContext";
import LazyExitIntent from "@/components/LazyExitIntent";
import FunnelBeacon from "@/components/FunnelBeacon";
import PWAProvider from "@/components/PWAProvider";
import { getAuthor } from "@/lib/data/authors";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevents invisible text during font load (helps CLS + LCP)
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ─── 1. Metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://www.visitplane.com"),

  title: {
    default: "VisitPlane - Visa Requirements for 197 Countries",
    // Page titles across the site already end in "| VisitPlane", so the template
    // must NOT append a second suffix. Using "%s" renders each page title verbatim
    // (single suffix), while the `default` above keeps branding on untitled pages.
    template: "%s",
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

  // ── PWA manifest + theme ──────────────────────────────────────────────────
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10B981" },
    { media: "(prefers-color-scheme: dark)",  color: "#10B981" },
  ],
  appleWebApp: {
    capable:         true,
    statusBarStyle:  "default",
    title:           "VisitPlane",
  },

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
const siteFounder = getAuthor();

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VisitPlane",
  url: "https://www.visitplane.com",
  logo: "https://www.visitplane.com/logo-v2.png",
  description:
    "Free visa requirements and travel tools for 197 countries — passport strength checker, embassy finder, document checklists and more.",
  founder: {
    "@type": "Person",
    name: siteFounder.name,
    jobTitle: siteFounder.role,
    url: siteFounder.url,
  },
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

// Locale is fixed to English at the server layer. The old getLocale()/
// getMessages() calls read the NEXT_LOCALE cookie on EVERY request, which
// forced every route in the app — including ~2,000 SEO pages — to render
// dynamically (cache-control: no-store, x-vercel-cache: MISS, 0.5–1.3s TTFB).
// The language switcher is currently disabled (single locale), and the non-en
// message files only ever covered the homepage shell, so nothing user-visible
// depends on request-time locale. When real localization ships, use locale
// path prefixes (/ur/...) instead of a cookie so pages stay cacheable.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ── Perf: warm the connection to the destination-image CDN early ──
            Every destination card photo loads from images.unsplash.com. Doing the
            DNS + TLS handshake ahead of the request shaves latency off the first
            (and largest) image paint on image-heavy pages. ─────────────────── */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* ── PWA: Apple touch icons ─────────────────────────────────────── */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-maskable-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72.png" />

        {/* ── PWA: iOS splash screens ────────────────────────────────────── */}
        {/* iPhone 14 Pro Max */}
        <link rel="apple-touch-startup-image" media="screen and (device-width:430px) and (device-height:932px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" href="/splash/apple-splash-1290-2796.png" />
        {/* iPhone 14 Pro */}
        <link rel="apple-touch-startup-image" media="screen and (device-width:393px) and (device-height:852px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" href="/splash/apple-splash-1179-2556.png" />
        {/* iPhone 12/13/14 */}
        <link rel="apple-touch-startup-image" media="screen and (device-width:390px) and (device-height:844px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" href="/splash/apple-splash-1170-2532.png" />
        {/* iPhone 12 Pro Max */}
        <link rel="apple-touch-startup-image" media="screen and (device-width:428px) and (device-height:926px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" href="/splash/apple-splash-1284-2778.png" />
        {/* iPhone X/XS/11 Pro */}
        <link rel="apple-touch-startup-image" media="screen and (device-width:375px) and (device-height:812px) and (-webkit-device-pixel-ratio:3) and (orientation:portrait)" href="/splash/apple-splash-1125-2436.png" />
        {/* iPhone SE */}
        <link rel="apple-touch-startup-image" media="screen and (device-width:375px) and (device-height:667px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" href="/splash/apple-splash-750-1334.png" />
        {/* iPad Pro 12.9" */}
        <link rel="apple-touch-startup-image" media="screen and (device-width:1024px) and (device-height:1366px) and (-webkit-device-pixel-ratio:2) and (orientation:portrait)" href="/splash/apple-splash-2048-2732.png" />

        {/* ── PWA: Windows tile ──────────────────────────────────────────── */}
        <meta name="msapplication-TileColor" content="#10B981" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />

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
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <CommandPaletteProvider>
            <ChromeGate><SiteHeader /></ChromeGate>
            <ChromeGate><CommandPalette /></ChromeGate>
            <main className="flex-1">{children}</main>
            <ChromeGate><SiteFooter /></ChromeGate>
          </CommandPaletteProvider>
        </NextIntlClientProvider>
        <GoogleTagManager gtmId="GTM-PE2H5RR8HK" />
        {/* Vercel Analytics — privacy-friendly page-view counter */}
        <Analytics />
        {/* Capture Point 3 — Exit Intent Modal (desktop only). Lazy: keeps
            framer-motion out of every page's critical JS (mobile 3G LCP). */}
        <LazyExitIntent />
        {/* First-party funnel beacon — anonymous page.view on money pages (DNT-safe) */}
        <FunnelBeacon />
        {/* PWA: registers SW, handles install prompt, bg-sync, transitions */}
        <PWAProvider />
      </body>
    </html>
  );
}
