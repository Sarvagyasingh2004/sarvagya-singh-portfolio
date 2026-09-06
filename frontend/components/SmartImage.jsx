"use client";

import { useEffect, useState } from "react";

const SmartImage = ({ src, alt = "", className = "", width, height, fallback }) => {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => !cancelled && setOk(true);
    img.onerror = () => !cancelled && setOk(false);
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!ok) return fallback;

  return (
    <img src={src} alt={alt} className={className} width={width} height={height} />
  );
};

export default SmartImage;
