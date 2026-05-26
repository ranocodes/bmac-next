"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavLink {
  name: string;
  href: string;
}

interface NavbarProps {
  logoText?: string;
  navLinks?: NavLink[];
}

const defaultLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Programs", href: "/programs" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar({ logoText = "BMAC", navLinks = defaultLinks }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  return (
    <>
      {/* Floating Island Navbar - Centered Pill */}
      <div className="fixed top-0 left-0 right-0 z-[1000] flex justify-center pt-6 px-4 pointer-events-none">
        <header 
          className={`pointer-events-auto transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 rounded-full border flex items-center justify-between gap-4 md:gap-8 px-6 md:px-8 py-2.5 ${
            scrolled 
              ? "bg-card/70 backdrop-blur-xl border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
              : "bg-card/10 backdrop-blur-md border-card/20 shadow-none"
          }`}
          style={{ width: 'auto', maxWidth: '95vw' }}
        >
          <Link href="/" className="font-display font-bold text-xl tracking-tighter text-secondary flex-shrink-0">
            {logoText}<span className="text-primary">.</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[13px] px-4 py-2 rounded-full transition-all duration-300 font-medium ${
                  pathname === link.href 
                    ? scrolled ? "bg-secondary text-secondary-foreground shadow-sm" : "bg-card/20 text-secondary"
                    : scrolled ? "text-muted-foreground hover:text-secondary hover:bg-muted" : "text-secondary/70 hover:text-secondary hover:bg-card/10"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
             <Link 
                href="/get-involved" 
                className={`hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-lg ${
                  scrolled 
                    ? "bg-primary text-primary-foreground hover:bg-secondary shadow-primary/10" 
                    : "bg-card text-secondary hover:bg-accent shadow-card/10"
                }`}
              >
                Join Us
             </Link>
             
             <button 
                className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-full border transition-[background-color,border-color,color] ${
                  scrolled ? "bg-card border-border" : "bg-card/20 border-card/20 text-secondary"
                }`} 
                onClick={() => toggleMenu(true)}
                aria-label="Toggle Menu"
              >
                <Menu size={20} />
             </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-secondary/60 backdrop-blur-xl z-[2000]"
              onClick={() => toggleMenu(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-card z-[2001] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <Link href="/" className="font-display font-bold text-2xl tracking-tighter" onClick={() => toggleMenu(false)}>
                  {logoText}<span className="text-primary">.</span>
                </Link>
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-secondary hover:bg-muted/80 transition-colors"
                  onClick={() => toggleMenu(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-4 mb-auto">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`text-2xl font-bold tracking-tight py-2 block ${
                        pathname === link.href ? "text-primary" : "text-secondary"
                      }`}
                      onClick={() => toggleMenu(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="pt-8 border-t border-border/50">
                <Link 
                  href="/get-involved" 
                  className="w-full bg-primary text-primary-foreground py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
                  onClick={() => toggleMenu(false)}
                >
                  Join the Movement <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
