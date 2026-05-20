"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Programs", href: "/programs" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
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
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "auto";
    }
  };

  return (
    <>
      {/* Floating Island Navbar - Centered Pill */}
      <div className="fixed top-6 left-0 right-0 z-[1000] flex justify-center px-6 pointer-events-none">
        <header 
          className={`pointer-events-auto transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 rounded-full border flex items-center justify-between gap-4 md:gap-8 px-6 md:px-8 py-2.5 ${
            scrolled 
              ? "bg-card/70 backdrop-blur-xl border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
              : "bg-card/10 backdrop-blur-md border-card/20 shadow-none"
          }`}
          style={{ width: 'auto', maxWidth: '95vw' }}
        >
          <Link href="/" className="font-display font-bold text-xl tracking-tighter text-secondary flex-shrink-0">
            BMAC<span className="text-primary">.</span>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggleMenu(false)}
              className="fixed inset-0 z-[1001] bg-deep/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[1002] shadow-2xl lg:hidden p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-display font-bold text-2xl text-deep">BMAC.</span>
                <button 
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full" 
                  onClick={() => toggleMenu(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => toggleMenu(false)}
                    className={`text-2xl font-display font-bold tracking-tight ${
                      pathname === link.href ? "text-green" : "text-slate-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
               
              </div>

              <div className="mt-auto">
                <Link
                  href="/get-involved"
                  className="w-full flex items-center justify-center gap-2 bg-green text-white py-5 rounded-3xl font-bold"
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
