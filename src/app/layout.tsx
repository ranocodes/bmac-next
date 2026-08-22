import React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import TrackView from "@/components/TrackView";
import SchemaOrg from "@/components/SchemaOrg";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "BMAC Jos — Brilliant Minds Ambassadors Club",
    template: "%s",
  },
  description:
    "Empowering young minds in Jos through public speaking, literary arts, mentorship, and digital literacy programs.",
  openGraph: {
    siteName: "BMAC Jos",
    type: "website",
    locale: "en_NG",
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
