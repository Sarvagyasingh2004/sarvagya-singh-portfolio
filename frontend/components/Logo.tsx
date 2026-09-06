"use client";

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
