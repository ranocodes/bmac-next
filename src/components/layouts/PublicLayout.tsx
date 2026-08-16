"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const DEFAULT_NAV = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Programs", href: "/programs" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Contact", href: "/contact" },
];

const DEFAULT_SOCIAL = [
  { name: "Facebook", href: "https://facebook.com/bmacjos", icon: "Facebook" },
  { name: "TikTok", href: "https://tiktok.com/@bmacjos", icon: "Music2" },
  { name: "Instagram", href: "https://instagram.com/bmacjos", icon: "Instagram" },
  { name: "Twitter", href: "https://twitter.com/bmacjos", icon: "Twitter" },
];

interface PublicLayoutProps {
  children: React.ReactNode;
  logoText?: string;
  navLinks?: typeof DEFAULT_NAV;
  socialLinks?: typeof DEFAULT_SOCIAL;
  copyright?: string;
  contactInfo?: { email?: string; phone?: string; whatsapp?: string; address?: string; hours?: string };
}

export default function PublicLayout({ children, logoText: initialLogoText, navLinks: initialNavLinks, socialLinks: initialSocialLinks, copyright: initialCopyright, contactInfo }: PublicLayoutProps) {
  const logoText = initialLogoText || "BMAC";
  const navLinks = initialNavLinks || DEFAULT_NAV;
  const socialLinks = initialSocialLinks || DEFAULT_SOCIAL;
  const copyright = initialCopyright || "Brilliant Minds Ambassadors Club. All rights reserved.";

  return (
    <>
      <Navbar logoText={logoText} navLinks={navLinks} />
      {children}
      <Footer logoText={logoText} copyright={copyright} socialLinks={socialLinks} navLinks={navLinks} contactInfo={contactInfo} />
      <BackToTop />
    </>
  );
}
