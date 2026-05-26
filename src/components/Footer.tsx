"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Music2 } from "lucide-react";
import { getIcon } from "@/lib/iconMapper";

interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

interface NavLink {
  name: string;
  href: string;
}

interface FooterProps {
  logoText?: string;
  copyright?: string;
  socialLinks?: SocialLink[];
  navLinks?: NavLink[];
}

const defaultSocials = [
  { name: "Facebook", href: "https://facebook.com/bmacjos", icon: "Facebook" },
  { name: "TikTok", href: "https://tiktok.com/@bmacjos", icon: "Music2" },
  { name: "Instagram", href: "https://instagram.com/bmacjos", icon: "Instagram" },
  { name: "Twitter", href: "https://twitter.com/bmacjos", icon: "Twitter" },
];

const defaultLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Programs", href: "/programs" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Contact", href: "/contact" },
];

export default function Footer({ 
  logoText = "BMAC Jos", 
  copyright = "Brilliant Minds Ambassadors Club. All rights reserved.",
  socialLinks = defaultSocials,
  navLinks = defaultLinks
}: FooterProps) {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-20 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <div className="font-display font-bold text-xl text-secondary-foreground">
            <span>{logoText}</span>
          </div>
          <p className="text-secondary-foreground/60 text-sm leading-relaxed max-w-sm">
            Empowering young minds in Jos through public speaking, literary
            arts, mentorship, and digital literacy programs that build confident
            future leaders.
          </p>
        </div>
        
        <div>
          <h4 className="font-display font-bold text-lg mb-6">Navigation</h4>
          <div className="grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-secondary-foreground/60 text-sm hover:text-accent transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-display font-bold text-lg mb-6">Connect</h4>
          <div className="flex gap-4">
            {socialLinks.map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                aria-label={social.name}
                className="w-10 h-10 rounded-xl border border-secondary-foreground/10 flex items-center justify-center text-secondary-foreground/80 hover:bg-accent hover:text-secondary hover:border-accent transition-all"
              >
                {getIcon(social.icon, { size: 18 })}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-20 pt-8 border-t border-secondary-foreground/5 text-center text-xs text-secondary-foreground/30">
        &copy; {new Date().getFullYear()} {copyright}
      </div>
    </footer>
  );
}
