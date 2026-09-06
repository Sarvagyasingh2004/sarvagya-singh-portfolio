"use client";

import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/constants";
import ScrollProgress from "./ScrollProgress";
import ThemeToggle from "./ThemeToggle";
import ResumeButton from "./ResumeButton";
import Logo from "./Logo";
import RoleTyper from "@/components/RoleTyper";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("a")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close on resize up to desktop, or the scroll lock outlives the drawer.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
      <div className="inner">
        <a href="#hero" className="brand" aria-label="Sarvagya Singh — home">
          <span className="brand-mark"><Logo size={30} /></span>
          <span className="brand-name">
            <b>Sarvagya Singh</b>
            <RoleTyper />
          </span>
        </a>
        <nav className="desktop">
          <ul>
            {navLinks.map(({ link, name }, index) => (
              <li key={index} className="group">
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
          <button
            ref={toggleRef}
            type="button"
            className="nav-burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`burger-bars ${menuOpen ? "is-open" : ""}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <ScrollProgress />

      <div
        id="mobile-nav"
        ref={panelRef}
        className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
        hidden={!menuOpen}
      >
        <nav aria-label="Mobile">
          <ul>
            {navLinks.map(({ link, name }) => (
              <li key={name}>
                <a href={link} onClick={() => setMenuOpen(false)}>
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {menuOpen ? (
        <button
          type="button"
          className="mobile-nav-scrim"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </header>
  );
};

export default Navbar;
