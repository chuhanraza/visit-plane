import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "";

// ─── 1. Metadata (title, description, keywords) ──────────────────────────────
export const metadata: Metadata = {
  title: "VisitPlane - Visa Requirements & Documents",
  description:
    "Get instant visa requirements for 150+ countries. Know exactly what documents you need. Fast, free, always updated.",
  keywords: [
    "visa requirements",
    "visa documents",
    "passport requirements",
    "travel visa",
    "visa checker",
    "do I need a visa",
    "country visa guide",
    "immigration documents",
    "travel documents",
    "visa on arrival",
  ],

  // ─── Google Search Console verification ─────────────────────────────────────
  verification: {
    google: "_1giyu5DMW8eS91AviSVAkCw5XGFIZHLU7gsHINSAm8",
  },

  // ─── 5. Canonical URL support ───────────────────────────────────────────────
  metadataBase: new URL("https://visitplane.com"),
  alternates: {
    canonical: "/",
  },

  // ─── Robots ─────────────────────────────────────────────────────────────────
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

  // ─── 2. OpenGraph metadata ───────────────────────────────────────────────────
  openGraph: {
    title: "VisitPlane - Visa Requirements & Documents",
    description:
      "Get instant visa requirements for 150+ countries. Know exactly what documents you need. Fast, free, always updated.",
    url: "https://visitplane.com",
    siteName: "VisitPlane",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VisitPlane – Visa Requirements & Documents",
      },
    ],
    type: "website",
    locale: "en_US",
  },

  // ─── Twitter / X card ───────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "VisitPlane - Visa Requirements & Documents",
    description:
      "Get instant visa requirements for 150+ countries. Know exactly what documents you need. Fast, free, always updated.",
    images: ["/og-image.png"],
    site: "@visitplane",
  },
};

// ─── 3. JSON-LD schema ────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "VisitPlane",
  url: "https://visitplane.com",
  description:
    "Visa requirements platform — get instant visa requirements for 150+ countries and know exactly what documents you need.",
  applicationCategory: "TravelApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#060C18] text-white">
        {children}
        <GoogleTagManager gtmId="GTM-PE2H5RR8HK" />
      </body>
    </html>
  );
}
