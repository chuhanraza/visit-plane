import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import SharedNavbar from "@/components/SharedNavbar";
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
  title: "VisitPlane - Visa Requirements & Documents",
  description:
    "Get instant visa requirements for 197 countries. Know exactly what documents you need. Free, fast, always updated. No signup required.",
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
  verification: {
    google: "_1giyu5DMW8eS91AviSVAkCw5XGFIZHLU7gsHINSAm8",
  },
  metadataBase: new URL("https://visitplane.com"),
  alternates: { canonical: "/" },
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
    title: "VisitPlane - Visa Requirements & Documents",
    description:
      "Get instant visa requirements for 197 countries. Know exactly what documents you need. Free, fast, always updated. No signup required.",
    url: "https://visitplane.com",
    siteName: "VisitPlane",
    images: [
      {
        url: "https://visitplane.com/api/og-default",
        width: 1200,
        height: 630,
        alt: "VisitPlane – Visa Requirements & Documents",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisitPlane - Visa Requirements & Documents",
    description:
      "Get instant visa requirements for 197 countries. Know exactly what documents you need. Free, fast, always updated. No signup required.",
    images: ["https://visitplane.com/api/og-default"],
    site: "@visitplane",
  },
};

// ─── 2. JSON-LD ───────────────────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "VisitPlane",
  url: "https://visitplane.com",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAFA]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SharedNavbar />
          <main className="flex-1">{children}</main>
          <SharedFooter />
        </NextIntlClientProvider>
        <GoogleTagManager gtmId="GTM-PE2H5RR8HK" />
      </body>
    </html>
  );
}
