"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";


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
      lockScroll();
    } else {
      unlockScroll();
    }
  };

  return (
    <>
      {/* Flat Top Navbar */}
      <div className={`fixed top-0 left-0 right-0 z-[1000] transition-colors duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-background/80 backdrop-blur-md border-b border-transparent"}`}>
        <header className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-4 px-4 md:px-6 h-16">
          <Link href="/" className="font-display font-bold text-xl tracking-tight text-secondary min-w-0 truncate max-w-[55vw] sm:max-w-none">
            {logoText}<span className="text-primary">.</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[13px] px-3.5 py-1.5 rounded-lg transition-colors duration-200 font-medium whitespace-nowrap ${
                  pathname === link.href 
                    ? "text-secondary font-semibold underline underline-offset-4 decoration-primary decoration-2"
                    : "text-muted-foreground hover:text-secondary hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
             <Link 
                href="/get-involved" 
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold bg-primary text-card hover:bg-primary/90 transition-colors"
              >
                Join Us
             </Link>
             
             <button 
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-background border border-border" 
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
              className="fixed inset-0 bg-secondary/50 backdrop-blur-sm z-[2000]"
              onClick={() => toggleMenu(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-card z-[2001] border-l border-border p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <Link href="/" className="font-display font-bold text-2xl tracking-tight text-secondary" onClick={() => toggleMenu(false)}>
                  {logoText}<span className="text-primary">.</span>
                </Link>
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted text-secondary hover:bg-muted/80 transition-colors"
                  onClick={() => toggleMenu(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col mb-auto">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full"
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center min-h-[52px] text-lg font-bold tracking-tight ${i < navLinks.length - 1 ? "border-b border-border/30" : ""} ${pathname === link.href ? "text-primary" : "text-secondary"}`}
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
                  className="w-full bg-primary text-card py-4 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors"
                  onClick={() => toggleMenu(false)}
                >
                  Join Us <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
