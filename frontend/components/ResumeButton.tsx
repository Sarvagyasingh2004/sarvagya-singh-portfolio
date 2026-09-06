"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Edge = "top" | "right" | "bottom" | "left";

const ResumeButton = () => {
  const [ready, setReady] = useState<boolean | null>(null);
  const [edge, setEdge] = useState<Edge>("bottom");
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    fetch("/api/resume/status")
      .then((r) => r.json())
      .then((d) => setReady(Boolean(d.available)))
      .catch(() => setReady(false));
  }, []);

  const onEnter = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const next: Edge =
      Math.abs(nx) > Math.abs(ny)
        ? nx < 0
          ? "left"
          : "right"
        : ny < 0
          ? "top"
          : "bottom";
    setEdge(next);
  }, []);

  const disabled = ready === false;

  return (
    <a
      ref={ref}
      href="/api/resume"
      className="btn-surface resume-btn"
      data-edge={edge}
      onPointerEnter={onEnter}
      aria-disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
      title={disabled ? "Resume not available right now" : "Download my resume (PDF)"}
    >
      <span className="resume-fill" aria-hidden="true" />
      <span className="resume-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v11" />
          <path d="M8 11l4 4 4-4" />
          <path d="M4 19h16" />
        </svg>
      </span>
      <span className="resume-label">Resume</span>
      <span className="sr-only">Download resume (PDF)</span>
    </a>
  );
};

export default ResumeButton;
