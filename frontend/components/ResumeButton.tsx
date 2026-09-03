"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Role = "backend" | "fullstack" | "frontend";
type Scope = "remote" | "india";

const ROLES: { id: Role; label: string }[] = [
  { id: "backend", label: "Backend" },
  { id: "fullstack", label: "Full-Stack" },
  { id: "frontend", label: "Frontend" },
];

type Variant = { role: Role; scope: Scope; file: string; available: boolean };

/**
 * Navbar resume control. One primary action that downloads immediately with a
 * sensible default; the variant picker is a secondary disclosure so the
 * common case is a single click, not a six-way decision.
 */
const ResumeButton = () => {
  const [role, setRole] = useState<Role>("backend");
  const [scope, setScope] = useState<Scope>("remote");
  const [open, setOpen] = useState(false);
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/resume/variants`)
      .then((r) => r.json())
      .then((d) => setVariants(d.variants ?? []))
      .catch(() => setVariants([]));
  }, []);

  // Dismiss the picker on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ready =
    variants?.find((v) => v.role === role && v.scope === scope)?.available ?? false;
  const href = `${API_URL}/api/resume?role=${role}&scope=${scope}&download=1`;
  const roleLabel = ROLES.find((r) => r.id === role)?.label ?? "Backend";

  return (
    <div className="resume-widget" ref={wrapRef}>
      <div className="resume-actions">
        <a
          className="resume-btn"
          href={href}
          aria-disabled={!ready}
          onClick={(e) => !ready && e.preventDefault()}
          title={ready ? `Download the ${roleLabel} / ${scope} resume` : "Not uploaded yet"}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
          </svg>
          <span>Resume</span>
        </a>

        <button
          type="button"
          className="resume-toggle"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="Choose a resume variant"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
      </div>

      {open ? (
        <div className="resume-picker" role="group" aria-label="Resume variant">
          <p className="resume-picker-hint">
            Six variants. Pick the one that matches your role.
          </p>
          <div className="resume-picker-row">
            <span>Role</span>
            <div>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={role === r.id ? "on" : ""}
                  onClick={() => setRole(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="resume-picker-row">
            <span>Location</span>
            <div>
              {(["remote", "india"] as Scope[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={scope === s ? "on" : ""}
                  onClick={() => setScope(s)}
                >
                  {s === "remote" ? "Remote (Global)" : "India"}
                </button>
              ))}
            </div>
          </div>
          {variants !== null && !ready ? (
            <p className="resume-note">That variant isn&rsquo;t uploaded yet.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ResumeButton;
