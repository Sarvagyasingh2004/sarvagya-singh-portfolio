"use client";

import { useRef } from "react";

const Star = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95L12 2.6z"
    />
  </svg>
);

const GlowCard = ({ card, children, index, stars = false }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    el.style.setProperty("--start", angle + 60);
  };

  return (
    <div
      className="card card-border timeline-card rounded-xl p-10 mb-5 break-inside-avoid-column"
      ref={cardRef}
      onMouseMove={handleMouseMove}
    >
      <div className="glow" />

      {stars ? (
        <div className="card-stars" aria-label="5 out of 5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} />
          ))}
        </div>
      ) : null}

      {card?.review ? (
        <div className="mb-5">
          <p className="text-white-50 text-lg">{card.review}</p>
        </div>
      ) : null}

      {children}
    </div>
  );
};

export default GlowCard;
