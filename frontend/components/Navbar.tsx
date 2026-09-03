"use client";

import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/constants";
import ScrollProgress from "./ScrollProgress";
import ThemeToggle from "./ThemeToggle";
import ResumeButton from "./ResumeButton";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
      <div className="inner">
        <a href="#hero" className="logo">
          Sarvagya Singh
        </a>

        <nav className="desktop" aria-label="Main">
          <ul>
            {navLinks.map(({ link, name }: { link: string; name: string }) => (
              <li key={name} className="group">
                <a href={link}>
                  <span>{name}</span>
                  <span className="underline" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          <ResumeButton />
          <a href="#contact" className="nav-contact">
            Contact
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="mobile-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="burger" />
          </button>
        </div>
      </div>

      <ScrollProgress />

      <div
        id="mobile-nav"
        ref={panelRef}
        className={`mobile-nav ${menuOpen ? "open" : ""}`}
        hidden={!menuOpen}
      >
        <nav aria-label="Mobile">
          <ul>
            {navLinks.map(({ link, name }: { link: string; name: string }) => (
              <li key={name}>
                <a href={link} onClick={() => setMenuOpen(false)}>
                  {name}
                </a>
              </li>
            ))}
            <li>
              <a href="#contact" onClick={() => setMenuOpen(false)}>
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
