"use client";

import { useEffect, useRef } from "react";
import { socialImgs } from "@/constants";

/**
 * The Email link opens a real mail client, but the address is assembled in the
 * browser rather than sitting in the served HTML, where every scraper would
 * find it. Server-side it renders as a link to the contact form, so if this
 * never runs the link still goes somewhere useful.
 */
const MAIL_USER = "sarvagya3555cc";
const MAIL_HOST = "gmail.com";

const Footer = () => {
  const mailRef = useRef(null);

  useEffect(() => {
    const el = mailRef.current;
    if (!el) return;
    el.href = `mailto:${MAIL_USER}@${MAIL_HOST}`;
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-line">
          <p>Open to full-time backend and full-stack roles.</p>
        </div>

        <div className="socials">
          {socialImgs
            .filter((img) => img.url && img.url !== "REPLACE_ME")
            .map((img) => {
              const isMail = img.name === "Email";
              const internal = img.url.startsWith("#");
              return (
                <a
                  key={img.name}
                  className="social-link"
                  href={img.url}
                  ref={isMail ? mailRef : undefined}
                  title={isMail ? "Email me" : undefined}
                  {...(internal
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <span className="icon">
                    <img src={img.imgPath} alt="" />
                  </span>
                  <span className="social-label">{img.name}</span>
                </a>
              );
            })}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-center md:text-end">
            © {new Date().getFullYear()} Sarvagya Singh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
