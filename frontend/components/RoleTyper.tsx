"use client";

import { useEffect, useState } from "react";

/**
 * The line under the brand name, typed out one role at a time.
 *
 * Two things this has to avoid. It must not shift the layout: the roles differ
 * in length, and a navbar whose contents resize every 60ms is worse than a
 * static label. A hidden copy of the longest role holds the width open and the
 * animated text is positioned over it, so the box never changes size.
 *
 * And it must not shout. The text changes constantly, which a screen reader
 * would announce every time, so the animation is hidden from the accessibility
 * tree and a plain static label sits behind it.
 */
const ROLES = [
  "Full-Stack Developer",
  "Backend Engineer",
  "React Developer",
  "Node.js Developer",
  "TypeScript Developer",
];

const TYPE_MS = 65;
const DELETE_MS = 32;
const HOLD_MS = 1600;
const GAP_MS = 340;

// Reserves the width. Measured by rendering, not by character count — these are
// uppercased and letter-spaced, so the longest string is not simply the one
// with the most characters.
const LONGEST = ROLES.reduce((a, b) => (b.length > a.length ? b : a));

const RoleTyper = () => {
  // Starts on the complete first role so the server-rendered markup matches
  // what hydration produces, and so a reader who never sees the animation —
  // reduced motion, or JS that fails — still gets a real label.
  const [text, setText] = useState(ROLES[0]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setRunning(true);

    let i = 0;
    let sub = ROLES[0].length;
    let deleting = true;
    let timer = 0;

    const step = () => {
      const word = ROLES[i];
      if (deleting) {
        sub -= 1;
        if (sub <= 0) {
          sub = 0;
          deleting = false;
          i = (i + 1) % ROLES.length;
          setText("");
          timer = window.setTimeout(step, GAP_MS);
          return;
        }
        setText(word.slice(0, sub));
        timer = window.setTimeout(step, DELETE_MS);
        return;
      }
      sub += 1;
      setText(word.slice(0, sub));
      if (sub >= word.length) {
        deleting = true;
        timer = window.setTimeout(step, HOLD_MS);
        return;
      }
      timer = window.setTimeout(step, TYPE_MS);
    };

    timer = window.setTimeout(step, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <i className="brand-role">
      <span className="brand-role-sizer" aria-hidden="true">
        {LONGEST}
      </span>
      <span className="brand-role-text" aria-hidden="true">
        {text}
        {running && <span className="brand-role-caret" />}
      </span>
      <span className="sr-only">Full-stack and backend developer</span>
    </i>
  );
};

export default RoleTyper;
