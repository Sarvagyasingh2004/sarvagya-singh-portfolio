import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const ROLES = [
  { id: "backend", label: "Backend" },
  { id: "fullstack", label: "Full-Stack" },
];
const SCOPES = [
  { id: "remote", label: "Remote" },
  { id: "india", label: "India" },
];

// One button plus a small role/scope toggle, rather than four buttons —
// four choices up front reads as indecision.
const ResumeButton = ({ variant = "solid" }) => {
  const [role, setRole] = useState("backend");
  const [scope, setScope] = useState("remote");
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/resume/variants`)
      .then((r) => r.json())
      .then((d) => setAvailable(d.variants ?? []))
      .catch(() => setAvailable([]));
  }, []);

  const current = available?.find((v) => v.role === role && v.scope === scope);
  const ready = current?.available ?? false;
  const href = `${API_URL}/api/resume?role=${role}&scope=${scope}&download=1`;

  return (
    <div className={`resume-widget ${variant}`}>
      <div className="resume-actions">
        <a
          className="resume-btn"
          href={href}
          // Not target=_blank: this is a download, so the tab would flash and close.
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Resume
        </a>

        <button
          type="button"
          className="resume-toggle"
          aria-expanded={open}
          aria-label="Choose resume variant"
          onClick={() => setOpen((v) => !v)}
        >
          {ROLES.find((r) => r.id === role)?.label} &middot;{" "}
          {SCOPES.find((s) => s.id === scope)?.label}
          <span aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
      </div>

      {open ? (
        <div className="resume-picker">
          <fieldset>
            <legend>Role</legend>
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
          </fieldset>
          <fieldset>
            <legend>Location</legend>
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={scope === s.id ? "on" : ""}
                onClick={() => setScope(s.id)}
              >
                {s.label}
              </button>
            ))}
          </fieldset>
        </div>
      ) : null}

      {available !== null && !ready ? (
        <p className="resume-note">
          This variant isn&rsquo;t uploaded yet.
        </p>
      ) : null}
    </div>
  );
};

export default ResumeButton;
