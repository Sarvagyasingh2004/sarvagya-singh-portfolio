"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader";
import Logo from "../components/Logo";
import { techStackIcons } from "@/constants";

const TechIcon = dynamic(
  () => import("../components/Models/TechLogos/TechIcon.jsx"),
  { ssr: false }
);
const TechCanvas = dynamic(
  () => import("../components/Models/TechLogos/TechCanvas.jsx"),
  { ssr: false }
);

/**
 * The stack as a constellation rather than a row of cards.
 *
 * Each model sits on an arc above a central monogram, with an SVG curve
 * running from it down into the core. The curves are measured from the live
 * DOM after layout rather than hardcoded, so they stay attached at any
 * viewport width.
 */
const TechStack = () => {
  const wrapRef = useRef(null);
  const coreRef = useRef(null);
  const nodeRefs = useRef([]);
  const [paths, setPaths] = useState([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const core = coreRef.current;
      if (!wrap || !core) return;

      const w = wrap.getBoundingClientRect();
      const c = core.getBoundingClientRect();
      setBox({ w: w.width, h: w.height });

      const cx = c.left + c.width / 2 - w.left;
      const cy = c.top + c.height / 2 - w.top;

      setPaths(
        nodeRefs.current.filter(Boolean).map((el, i) => {
          const r = el.getBoundingClientRect();
          const x = r.left + r.width / 2 - w.left;
          const y = r.top + r.height - w.top - 8;
          // Control points pulled toward the core's vertical axis, so every
          // curve funnels into the centre like fibre into a hub.
          // Nodes sitting almost directly above the hub get a deliberate
          // sideways bow, alternating direction. Without it the centre wire is
          // a straight vertical line that disappears into the orb's glow.
          const dx = x - cx;
          const bow = Math.abs(dx) < 40 ? (i % 2 === 0 ? -58 : 58) : dx * 0.12;
          return `M ${x} ${y} C ${x + bow * 0.5} ${y + (cy - y) * 0.45}, ${cx + bow} ${cy - (cy - y) * 0.32}, ${cx} ${cy}`;
        })
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    // Re-measure once fonts settle, since they shift the arc's height.
    const t = setTimeout(measure, 400);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  return (
    <div id="skills" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="My Preferred Tech Stack"
          sub="The Skills I Bring to the Table"
        />

        <div className="constellation" ref={wrapRef}>
          {/* Connector curves sit behind everything. */}
          <svg
            className="constellation-wires"
            viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* userSpaceOnUse, not the default objectBoundingBox: a nearly
                  vertical path has near-zero bbox width, which makes an
                  objectBoundingBox gradient degenerate and it silently fails
                  to paint. That is exactly why the centre node's wire was
                  missing while the four angled ones drew fine. */}
              <linearGradient
                id="wire"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={box.h || 1}
              >
                <stop offset="0%" stopColor="rgba(167,139,250,0.05)" />
                <stop offset="55%" stopColor="rgba(139,92,246,0.35)" />
                <stop offset="100%" stopColor="rgba(91,110,245,0.7)" />
              </linearGradient>
            </defs>
            {paths.map((d, i) => (
              <path key={i} d={d} className="constellation-wire" fill="none" pathLength={1} />
            ))}
          </svg>

          <div className="constellation-arc">
            {techStackIcons.map((icon, i) => (
              <div
                key={icon.name}
                className="constellation-node"
                ref={(el) => (nodeRefs.current[i] = el)}
              >
                <div className="constellation-model">
                  <TechIcon model={icon} />
                </div>
                <p>{icon.name}</p>
              </div>
            ))}
          </div>

          {/* The hub. */}
          <div className="constellation-core" ref={coreRef}>
            <span className="core-orb" aria-hidden="true" />
            <span className="core-ring" aria-hidden="true" />
            <span className="core-ring core-ring-2" aria-hidden="true" />
            <span className="core-logo">
              <Logo size={92} glow large />
            </span>
          </div>
        </div>

        <TechCanvas />
      </div>
    </div>
  );
};

export default TechStack;
