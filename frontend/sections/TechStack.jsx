"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TitleHeader from "../components/TitleHeader";
import Logo from "../components/Logo";
import { techStackIcons } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

const TechIcon = dynamic(
  () => import("../components/Models/TechLogos/TechIcon.jsx"),
  { ssr: false }
);
const TechCanvas = dynamic(
  () => import("../components/Models/TechLogos/TechCanvas.jsx"),
  { ssr: false }
);

/**
 * The stack as a constellation that assembles on scroll.
 *
 * Everything here is derived from `techStackIcons` at runtime: the arc offsets,
 * the wire geometry, and the animation targets. Adding Express, RabbitMQ or
 * anything else to that array is the only change needed - no per-item CSS, no
 * hardcoded nth-child rules, no fixed count anywhere.
 *
 * The animation reads as one gesture: the strings all grow out of their logos
 * together, travel down, and the monogram lights up as they land.
 */
const TechStack = () => {
  const wrapRef = useRef(null);
  const coreRef = useRef(null);
  const nodeRefs = useRef([]);
  const [paths, setPaths] = useState([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const core = coreRef.current;
    if (!wrap || !core) return;

    const w = wrap.getBoundingClientRect();
    const c = core.getBoundingClientRect();
    setBox({ w: w.width, h: w.height });

    const cx = c.left + c.width / 2 - w.left;
    const cy = c.top + c.height / 2 - w.top;

    const nodes = nodeRefs.current.filter(Boolean);
    setPaths(
      nodes.map((el) => {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2 - w.left;
        const y = r.top + r.height - w.top - 6;
        const dx = x - cx;
        // Nodes sitting almost directly above the hub get a sideways bow,
        // alternating by which side of centre they fall on, so a wire is never
        // a straight vertical line lost inside the orb's glow. Derived from
        // position, so it holds for any number of nodes.
        const bow = Math.abs(dx) < 46 ? (x <= cx ? -62 : 62) : dx * 0.14;
        return `M ${x} ${y} C ${x + bow * 0.45} ${y + (cy - y) * 0.42}, ${cx + bow} ${cy - (cy - y) * 0.3}, ${cx} ${cy}`;
      })
    );
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 400);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, [measure]);

  // Arc shape, computed rather than declared. Outer nodes lift more than inner
  // ones, so the row reads as an arc for any count.
  useEffect(() => {
    const nodes = nodeRefs.current.filter(Boolean);
    const mid = (nodes.length - 1) / 2;
    nodes.forEach((el, i) => {
      const distance = mid === 0 ? 0 : Math.abs(i - mid) / mid;
      el.style.setProperty("--arc-lift", `${(distance * 3.4).toFixed(2)}rem`);
    });
  }, [paths.length]);

  useEffect(() => {
    if (!paths.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const wires = gsap.utils.toArray(".constellation-wire");
      const nodes = gsap.utils.toArray(".constellation-node");

      // GSAP owns dasharray as well as offset. Leaving dasharray to CSS while
      // animating offset made the draw resolve in one frame instead of
      // interpolating.
      wires.forEach((wire) => {
        const len = wire.getTotalLength();
        gsap.set(wire, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(nodes, { opacity: 0, y: -22 });
      gsap.set(coreRef.current, { opacity: 0, scale: 0.7 });
      gsap.set(".core-glow", { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 85%",
          end: "bottom 60%",
          scrub: 0.7,
        },
      });

      tl
        // Logos arrive first: the strings have to come FROM something.
        .to(nodes, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06 }, 0)
        // All strings grow together, out of the logos and down toward the
        // monogram. Offset runs to 0 from the path's start point, which is the
        // node end, so the draw travels logo -> hub.
        .to(wires, { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut" }, 0.3)
        // The hub is dark until the strings reach it, then lights up.
        .to(coreRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 1.35)
        .to(".core-glow", { opacity: 1, duration: 0.7, ease: "power2.out" }, 1.6);
    }, wrapRef);

    return () => ctx.revert();
  }, [paths]);

  return (
    <div id="skills" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="My Preferred Tech Stack"
          sub="The Skills I Bring to the Table"
        />

        <div className="constellation" ref={wrapRef}>
          <svg
            className="constellation-wires"
            viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* userSpaceOnUse: a near-vertical path has near-zero bbox
                  width, which makes the default objectBoundingBox gradient
                  degenerate so the stroke never paints. */}
              <linearGradient
                id="wire"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={box.h || 1}
              >
                <stop offset="0%" stopColor="rgba(196,181,253,0.55)" />
                <stop offset="45%" stopColor="rgba(167,139,250,0.9)" />
                <stop offset="100%" stopColor="rgba(129,140,248,1)" />
              </linearGradient>
            </defs>
            {paths.map((d, i) => (
              <g key={i}>
                {/* Two passes: a wide soft one for the glow, a crisp one on
                    top. A single stroke at this width reads as a scratch. */}
                <path d={d} className="constellation-wire wire-glow" fill="none" />
                <path d={d} className="constellation-wire wire-core" fill="none" />
              </g>
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

          <div className="constellation-core" ref={coreRef}>
            <span className="core-glow" aria-hidden="true" />
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
