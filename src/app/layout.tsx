import React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import TrackView from "@/components/TrackView";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BMAC Jos — Brilliant Minds Ambassadors Club",
  description:
    "Empowering young minds in Jos through public speaking, literary arts, mentorship, and digital literacy programs.",
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
        {children}
        <TrackView />
      </body>
    </html>
  );
}
