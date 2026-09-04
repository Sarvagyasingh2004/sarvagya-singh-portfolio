"use client";

/**
 * The SS monogram. Two mirrored S-spines sharing a centre bar, drawn from
 * straight strokes only so it stays legible down to a 16px browser tab.
 * Inline rather than an <img> so it can inherit the theme and be animated.
 */
const Logo = ({ size = 34, glow = false }: { size?: number; glow?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={glow ? "logo-mark is-glowing" : "logo-mark"}
    role="img"
    aria-label="Sarvagya Singh"
  >
    <defs>
      {/* userSpaceOnUse is required: the default objectBoundingBox is
            degenerate for the horizontal strokes (zero height), so those bars
            silently fail to paint and the mark renders as a bare diagonal. */}
        <linearGradient
          id="logo-grad"
          gradientUnits="userSpaceOnUse"
          x1="16"
          y1="10"
          x2="48"
          y2="54"
        >
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="55%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#5b6ef5" />
      </linearGradient>
    </defs>
    <g
      fill="none"
      stroke="url(#logo-grad)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M44 14 H20" />
      <path d="M20 14 L34 30" />
      <path d="M34 30 H20" />
      <path d="M20 30 L34 46" />
      <path d="M34 46 H20" />
      <path d="M20 50 H44" />
    </g>
  </svg>
);

export default Logo;
