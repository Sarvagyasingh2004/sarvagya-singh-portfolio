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

/** Clear air between a logo's caption and where its string begins. */
const WIRE_START_GAP = 14;

/**
 * Layout offset of `el` within `ancestor`, walking the offsetParent chain.
 *
 * Deliberately not getBoundingClientRect: the entrance animation transforms
 * the nodes, and a rect read mid-animation bakes that transform into the wire
 * geometry, leaving the strings anchored to a position the logos never settle
 * into. offsetLeft/offsetTop report layout position only, so the measurement
 * is the same whatever frame it happens to run on.
 */
const offsetWithin = (el, ancestor) => {
  let x = 0;
  let y = 0;
  let n = el;
  let guard = 0;
  while (n && n !== ancestor && guard++ < 12) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return { x, y };
};

/**
 * The stack as a constellation that assembles on scroll.
 *
 * Everything here is derived from `techStackIcons` at runtime: the wire
 * geometry, the gradient span and the animation targets. Adding Express,
 * RabbitMQ or anything else to that array is the only change needed - no
 * per-item CSS, no hardcoded nth-child rules, no fixed count anywhere.
 *
 * The animation reads as one gesture: the strings all grow out from under
 * their captions together, travel down, and the monogram lights up as they
 * land.
 */
const TechStack = () => {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const coreRef = useRef(null);
  const nodeRefs = useRef([]);
  const [paths, setPaths] = useState([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Where the wire gradient starts and ends, so the fade runs along the
  // strings themselves rather than across the whole section.
  const [grad, setGrad] = useState({ y1: 0, y2: 1 });

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const core = coreRef.current;
    if (!wrap || !core) return;

    const w = wrap.getBoundingClientRect();
    setBox({ w: wrap.offsetWidth, h: wrap.offsetHeight });

    // The hub is scaled by the timeline, and scaling about the centre leaves
    // the centre where it is - so a rect is safe here, and it also survives
    // the mobile layout where the hub sits in normal flow instead of being
    // absolutely positioned and translated.
    const c = core.getBoundingClientRect();
    const cx = c.left + c.width / 2 - w.left;
    const cy = c.top + c.height / 2 - w.top;

    const nodes = nodeRefs.current.filter(Boolean);
    let firstStartY = null;

    setPaths(
      nodes.map((el) => {
        const o = offsetWithin(el, wrap);
        const x = o.x + el.offsetWidth / 2;
        // el is the whole node - icon plus caption - so its bottom edge is the
        // bottom of the label. Starting below it keeps the strings clear of
        // the text instead of running through it.
        const y = o.y + el.offsetHeight + WIRE_START_GAP;
        if (firstStartY === null) firstStartY = y;

        const dx = x - cx;
        // Nodes sitting almost directly above the hub get a sideways bow,
        // alternating by which side of centre they fall on, so a wire is never
        // a straight vertical line lost inside the orb's glow. Derived from
        // position, so it holds for any number of nodes.
        const bow = Math.abs(dx) < 46 ? (x <= cx ? -62 : 62) : dx * 0.14;
        return `M ${x} ${y} C ${x + bow * 0.45} ${y + (cy - y) * 0.42}, ${cx + bow} ${cy - (cy - y) * 0.3}, ${cx} ${cy}`;
      })
    );

    if (firstStartY !== null && Math.abs(cy - firstStartY) > 1) {
      setGrad({ y1: firstStartY, y2: cy });
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 400);
    // Web fonts change the caption height, which moves where the strings
    // should begin.
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, [measure]);

  useEffect(() => {
    if (!paths.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Below 900px the layout reflows to a grid with the hub in normal flow,
    // and a scrubbed timeline fights touch scroll momentum. Mobile gets the
    // finished constellation rather than a half-assembled one.
    if (window.matchMedia("(max-width: 900px)").matches) return;

    const ctx = gsap.context(() => {
      const wires = gsap.utils.toArray(".constellation-wire");
      // The inner wrapper, never the node itself. The node owns its own
      // transform in CSS (hover lift); an inline transform from GSAP on the
      // same element wins over the stylesheet and silently kills it.
      const nodes = gsap.utils.toArray(".constellation-node-inner");

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
          // The section, not the constellation inside it. Jumping here from
          // the navbar parks the section top just under the navbar - about 8%
          // of the viewport - so ending at 30% guarantees the timeline has
          // finished by the time you land, and the monogram is lit. Ending
          // relative to the inner wrapper left it stranded mid-assembly until
          // you scrolled further.
          trigger: sectionRef.current,
          start: "top 85%",
          end: "top 30%",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      tl
        // Logos arrive first: the strings have to come FROM something.
        .to(nodes, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06 }, 0)
        // All strings grow together, out from under the captions and down
        // toward the monogram. Offset runs to 0 from the path's start point,
        // which is the node end, so the draw travels logo -> hub.
        .to(wires, { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut" }, 0.3)
        // The hub is dark until the strings reach it, then lights up.
        .to(coreRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 1.35)
        .to(".core-glow", { opacity: 1, duration: 0.7, ease: "power2.out" }, 1.6);
    }, wrapRef);

    // A ScrollTrigger records its start/end scroll positions when it is
    // created. This page keeps growing after that - three WebGL canvases and
    // the images mount, and the document height moves under it. When those
    // recorded positions go stale the trigger can end up pointing past the end
    // of the page and simply never fires: the wires stay undrawn and the
    // monogram stays dark no matter how far you scroll. Re-measure once the
    // page has actually finished loading.
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") requestAnimationFrame(refresh);
    else window.addEventListener("load", refresh, { once: true });
    const settle = setTimeout(refresh, 1200);

    return () => {
      clearTimeout(settle);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [paths]);

  return (
    <div id="skills" className="flex-center section-padding" ref={sectionRef}>
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
                  degenerate so the stroke never paints.
                  y1/y2 span the strings themselves, so the fade is faint where
                  a string leaves its logo and solid where it meets the hub -
                  the strings read as being drawn INTO the monogram. */}
              <linearGradient
                id="wire"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={grad.y1}
                x2="0"
                y2={grad.y2}
              >
                <stop offset="0%" stopColor="rgba(196,181,253,0.13)" />
                <stop offset="35%" stopColor="rgba(180,160,251,0.4)" />
                <stop offset="70%" stopColor="rgba(167,139,250,0.78)" />
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
                <div className="constellation-node-inner">
                  <div className="constellation-model">
                    <TechIcon model={icon} />
                  </div>
                  <p>{icon.name}</p>
                </div>
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
