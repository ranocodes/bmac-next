"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Music2, Mail, Phone, MapPin, Clock } from "lucide-react";
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
  { name: "Privacy", href: "/privacy" },
];

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@bmacjos.org", href: "mailto:hello@bmacjos.org" },
  { icon: Phone, label: "Phone / WhatsApp", value: "+234 803 456 7891", href: "https://wa.me/2348034567891" },
  { icon: MapPin, label: "Hub", value: "Nalado Street, Jos", href: "" },
  { icon: Clock, label: "Hours", value: "Mon - Sat: 9am - 5pm", href: "" },
];

export default function Footer({ 
  logoText = "BMAC Jos", 
  copyright = "Brilliant Minds Ambassadors Club. All rights reserved.",
  socialLinks = defaultSocials,
  navLinks = defaultLinks
}: FooterProps) {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="font-display font-bold text-xl text-secondary">
            <span>{logoText}</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Empowering young minds in Jos through public speaking, literary
            arts, mentorship, and digital literacy programs that build confident
            future leaders.
          </p>
        </div>
        
        <div>
          <h4 className="font-display font-bold text-lg text-secondary mb-6">Navigation</h4>
          <div className="grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-display font-bold text-lg text-secondary mb-6">Contact</h4>
          <ul className="space-y-4">
            {contactInfo.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="mt-0.5 text-primary">
                  <item.icon size={16} />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-secondary hover:text-primary transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-secondary">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-lg text-secondary mb-6">Connect</h4>
          <div className="flex gap-3">
            {socialLinks.map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                aria-label={social.name}
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                {getIcon(social.icon, { size: 18 })}
              </a>
            ))}
          </div>
          <a
            href="https://wa.me/2348034567891"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
      
      <div className="mt-16 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground/60">
        &copy; {new Date().getFullYear()} {copyright}
      </div>
    </footer>
  );
}
