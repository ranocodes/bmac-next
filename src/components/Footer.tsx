import Link from "next/link";
import { Sparkles } from "lucide-react";

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
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-about">
          <div className="nav-logo" style={{ color: "var(--white)" }}>
            <span>BMAC Jos</span>
          </div>
          <p>
            Empowering young minds in Jos through public speaking, literary
            arts, mentorship, and digital literacy programs that build confident
            future leaders.
          </p>
        </div>
        <div>
          <h4>Navigation</h4>
          <div className="footer-links">
            {footerLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4>Connect</h4>
          <div className="footer-socials">
            <a href="https://facebook.com/bmacjos" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://tiktok.com/@bmacjos" aria-label="TikTok">
              <i className="fa-brands fa-tiktok"></i>
            </a>
            <a href="https://instagram.com/bmacjos" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://twitter.com/bmacjos" aria-label="Twitter">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} Brilliant Minds Ambassadors Club. All
        rights reserved.
      </div>
    </footer>
  );
}
