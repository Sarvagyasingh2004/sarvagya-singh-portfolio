"use client";

import { useEffect, useRef, useState } from "react";
import { logoIconsList } from "@/constants";

const LogoIcon = ({ icon }) => (
  <div
    className={`flex-none flex-center marquee-item${
      icon.invertOnDark ? " invert-on-dark" : ""
    }${icon.invertOnLight ? " invert-on-light" : ""}`}
  >
    <img src={icon.imgPath} alt="" loading="lazy" width="34" height="34" />
    <span className="marquee-label">{icon.name}</span>
  </div>
);

const LogoSection = () => {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => setFocused(e.isIntersecting),
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`md:my-20 my-10 relative marquee-wrap ${focused ? "is-focused" : ""}`}
      aria-label="Technologies I work with"
    >
      <div className="gradient-edge"></div>
      <div className="gradient-edge"></div>
      <div className="marquee h-52">
        <div className="marquee-box">
          {logoIconsList.map((icon) => (
            <LogoIcon key={icon.name} icon={icon} />
          ))}
          {logoIconsList.map((icon) => (
            <LogoIcon key={`dup-${icon.name}`} icon={icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoSection;
