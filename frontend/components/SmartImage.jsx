"use client";

import { useEffect, useState } from "react";

/**
 * Renders `fallback` until the image is confirmed loadable, then swaps it in.
 *
 * The naive approach — render <img> and handle onError — still paints the
 * browser's broken-image glyph for a moment (and permanently, if the error
 * fires before hydration). Preloading with `new Image()` means a missing file
 * is simply never rendered, so a not-yet-saved asset looks designed rather
 * than broken.
 */
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
