"use client";

import { useEffect, useRef, useState } from "react";
import { counterItems } from "@/constants";

const AnimatedCounter = () => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const failsafe = window.setTimeout(() => setShown(true), 2600);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(node);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      id="counter"
      ref={ref}
      className={`outcome-strip${shown ? " is-in" : ""}`}
      aria-label="Selected results"
    >
      {counterItems.map((item, i) => (
        <article
          className="outcome"
          key={item.label}
          style={{ "--i": i }}
        >
          <header className="outcome-head">
            <span className="outcome-icon">
              <img src={item.icon} alt="" width="16" height="16" loading="lazy" />
            </span>
            <span className="outcome-where">{item.where}</span>
          </header>

          <p className="outcome-metric">
            <span className="outcome-before">{item.before}</span>
            <span className="outcome-arrow" aria-hidden="true" />
            <span className="outcome-after">{item.after}</span>
          </p>

          <p className="outcome-label">{item.label}</p>
        </article>
      ))}
    </div>
  );
};

export default AnimatedCounter;
