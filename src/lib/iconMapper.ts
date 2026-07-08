import React from "react";
import * as LucideIcons from "lucide-react";
import {
  FaFacebook, FaInstagram, FaXTwitter, FaYoutube, FaLinkedin,
  FaTiktok, FaWhatsapp, FaTelegram, FaDiscord, FaGithub,
  FaSnapchat, FaPinterest, FaThreads, FaBluesky,
} from "react-icons/fa6";

const brandIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  Twitter: FaXTwitter,
  X: FaXTwitter,
  Youtube: FaYoutube,
  YouTube: FaYoutube,
  Linkedin: FaLinkedin,
  LinkedIn: FaLinkedin,
  TikTok: FaTiktok,
  Tiktok: FaTiktok,
  Whatsapp: FaWhatsapp,
  WhatsApp: FaWhatsapp,
  Telegram: FaTelegram,
  Discord: FaDiscord,
  Github: FaGithub,
  GitHub: FaGithub,
  Snapchat: FaSnapchat,
  Pinterest: FaPinterest,
  Threads: FaThreads,
  Bluesky: FaBluesky,
};

export const getIcon = (name: string, props: any = {}) => {
  const BrandIcon = brandIconMap[name];
  if (BrandIcon) return React.createElement(BrandIcon, { size: 18, ...props });
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? React.createElement(IconComponent, props) : null;
};

export const SOCIAL_PLATFORMS = [
  { name: "Facebook", icon: FaFacebook },
  { name: "Instagram", icon: FaInstagram },
  { name: "Twitter", icon: FaXTwitter },
  { name: "YouTube", icon: FaYoutube },
  { name: "LinkedIn", icon: FaLinkedin },
  { name: "TikTok", icon: FaTiktok },
  { name: "WhatsApp", icon: FaWhatsapp },
  { name: "Telegram", icon: FaTelegram },
  { name: "Discord", icon: FaDiscord },
  { name: "Snapchat", icon: FaSnapchat },
  { name: "Pinterest", icon: FaPinterest },
  { name: "Threads", icon: FaThreads },
  { name: "Bluesky", icon: FaBluesky },
  { name: "GitHub", icon: FaGithub },
];
