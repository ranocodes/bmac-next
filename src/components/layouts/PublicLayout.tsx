"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { getItem } from "@/data/store";

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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [logoText, setLogoText] = useState("BMAC");
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV);
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL);
  const [copyright, setCopyright] = useState("Brilliant Minds Ambassadors Club. All rights reserved.");

  useEffect(() => {
    const s = getItem<any>("site_settings");
    if (s) {
      if (s.logo_text) setLogoText(s.logo_text);
      if (s.navigation?.length) setNavLinks(s.navigation);
      if (s.social_links?.length) setSocialLinks(s.social_links);
      if (s.copyright) setCopyright(s.copyright);
    }
  }, []);

  return (
    <>
      <Navbar logoText={logoText} navLinks={navLinks} />
      {children}
      <Footer logoText={logoText} copyright={copyright} socialLinks={socialLinks} navLinks={navLinks} />
      <BackToTop />
    </>
  );
}
