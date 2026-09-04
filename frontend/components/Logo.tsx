"use client";

/**
 * The brand mark: a triangulated neon "S".
 *
 * Served as a PNG with a luminance-derived alpha channel rather than a hard
 * cut-out, so the neon falloff survives and the mark sits correctly on both
 * the light and dark grounds. The 128px file is used everywhere it appears
 * small (navbar, tab); the 512px only where it is displayed large.
 */
const Logo = ({
  size = 34,
  glow = false,
  large = false,
}: {
  size?: number;
  glow?: boolean;
  large?: boolean;
}) => (
  <img
    src={large ? "/brand/mark.png" : "/brand/mark-128.png"}
    alt="Sarvagya Singh"
    width={size}
    height={size}
    className={glow ? "logo-mark is-glowing" : "logo-mark"}
    style={{ width: size, height: size }}
    draggable={false}
  />
);

export default Logo;
