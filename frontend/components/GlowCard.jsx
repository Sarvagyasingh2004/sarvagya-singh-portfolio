"use client";

import { useRef } from "react";

// A pointer-tracking glow wrapper. Content is composed by the caller — this
// component no longer assumes it is rendering a testimonial.
const GlowCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    card.style.setProperty("--start", angle + 60);
  };

  return (
    <div
      className={`card card-border timeline-card rounded-xl p-10 mb-5 break-inside-avoid-column ${className}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
    >
      <div className="glow" />
      {children}
    </div>
  );
};

export default GlowCard;
