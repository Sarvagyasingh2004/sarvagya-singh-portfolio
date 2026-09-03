"use client";

import { useEffect, useState } from "react";

const ScrollCue = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`scroll-cue ${hidden ? "is-hidden" : ""}`} aria-hidden="true">
      <span className="scroll-cue-label">Scroll down</span>
      <span className="scroll-cue-mouse"><i /></span>
      <span className="scroll-cue-chevrons">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </span>
    </div>
  );
};

export default ScrollCue;
