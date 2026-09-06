"use client";

const srcFor = (size: number, large: boolean) => {
  if (large) return "/brand/mark.png";
  return size * 2 > 128 ? "/brand/mark-256.webp" : "/brand/mark-128.webp";
};

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
    src={srcFor(size, large)}
    alt="Sarvagya Singh"
    width={size}
    height={size}
    className={glow ? "logo-mark is-glowing" : "logo-mark"}
    style={{ width: size, height: size }}
    draggable={false}
  />
);

export default Logo;
