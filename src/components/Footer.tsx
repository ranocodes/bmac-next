import Link from "next/link";
import { Facebook, Instagram, Twitter, Music2 } from "lucide-react";

const footerLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Programs", href: "/programs" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Get Involved", href: "/get-involved" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-deep text-white pt-20 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <div className="font-display font-bold text-xl text-white">
            <span>BMAC Jos</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Empowering young minds in Jos through public speaking, literary
            arts, mentorship, and digital literacy programs that build confident
            future leaders.
          </p>
        </div>
        
        <div>
          <h4 className="font-display font-bold text-lg mb-6">Navigation</h4>
          <div className="grid grid-cols-2 gap-3">
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-white/60 text-sm hover:text-gold transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-display font-bold text-lg mb-6">Connect</h4>
          <div className="flex gap-4">
            {[
              { icon: <Facebook size={18} />, href: "https://facebook.com/bmacjos", label: "Facebook" },
              { icon: <Music2 size={18} />, href: "https://tiktok.com/@bmacjos", label: "TikTok" },
              { icon: <Instagram size={18} />, href: "https://instagram.com/bmacjos", label: "Instagram" },
              { icon: <Twitter size={18} />, href: "https://twitter.com/bmacjos", label: "Twitter" },
            ].map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                aria-label={social.label}
                className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/80 hover:bg-gold hover:text-deep hover:border-gold transition-all"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-20 pt-8 border-t border-white/5 text-center text-xs text-white/30">
        &copy; {new Date().getFullYear()} Brilliant Minds Ambassadors Club. All
        rights reserved.
      </div>
    </footer>
  );
}
