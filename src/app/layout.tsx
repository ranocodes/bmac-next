import React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import TrackView from "@/components/TrackView";
import SchemaOrg from "@/components/SchemaOrg";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s — BMAC Jos",
  },
  description: SITE_TAGLINE,
  applicationName: "BMAC Jos",
  authors: [{ name: "Brilliant Minds Academic & Career Foundation" }],
  openGraph: {
    siteName: "BMAC Jos",
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "kfU6o5wMl6_RpXxigL9GOw77MrjAKSfL8QzOA_NfZgs",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://js.paystack.co/v1/inline.js" async></script>
      </head>
      <body
        className={`${plusJakartaSans.variable} ${outfit.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <SchemaOrg />
        {children}
        <TrackView />
      </body>
    </html>
  );
}
