"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Programs", href: "/programs" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "Get Involved", href: "/get-involved" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
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
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-logo">BMAC</div>
        <div className="nav-menu">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <Link href="/get-involved" className="btn btn-green">
          Join BMAC <ArrowRight size={20} />
        </Link>
        <button className="hamburger" onClick={() => toggleMenu(true)}>
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Sheet */}
      <div
        className={`sheet-mask ${isOpen ? "open" : ""}`}
        onClick={() => toggleMenu(false)}
      />
      <div className={`sheet ${isOpen ? "open" : ""}`}>
        <button className="sheet-close" onClick={() => toggleMenu(false)}>
          <X size={24} />
        </button>
        <div className="sheet-links">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => toggleMenu(false)}
              className={pathname === link.href ? "active" : ""}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <Link
          href="/get-involved"
          className="btn btn-green"
          style={{ marginTop: "50px" }}
          onClick={() => toggleMenu(false)}
        >
          Join BMAC <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
