"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/constants";
import ScrollProgress from "./ScrollProgress";
import ThemeToggle from "./ThemeToggle";
import ResumeButton from "./ResumeButton";
import Logo from "./Logo";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
      <div className="inner">
        <a href="#hero" className="brand" aria-label="Sarvagya Singh — home">
          <span className="brand-mark"><Logo size={30} /></span>
          <span className="brand-name">
            <b>Sarvagya Singh</b>
            <i>Full-Stack Engineer</i>
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
        </div>
      </div>

      <ScrollProgress />
    </header>
  );
};

export default Navbar;
