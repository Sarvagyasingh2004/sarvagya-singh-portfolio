"use client";

import { useEffect, useState } from "react";

// API routes are same-origin now — no cross-origin base URL, no CORS.
const API_URL = "";

/**
 * Occupies the slot where "Contact me" used to sit. Contact moved into the
 * nav links, so the one button in the header is the highest-intent action:
 * getting the resume.
 */
const ResumeButton = () => {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/resume/status`)
      .then((r) => r.json())
      .then((d) => setReady(Boolean(d.available)))
      .catch(() => setReady(false));
  }, []);

  const disabled = ready === false;

  return (
    <a
      href={`${API_URL}/api/resume`}
      className="btn-surface resume-btn"
      aria-disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
      title={disabled ? "Resume not available right now" : "Download my resume (PDF)"}
    >
      <span className="resume-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v11" />
          <path d="M8 11l4 4 4-4" />
          <path d="M4 19h16" />
        </svg>
      </span>
      <span>Resume</span>
    </a>
  );
};

export default ResumeButton;
