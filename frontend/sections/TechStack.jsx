"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
const documentTop = (el) => {
  let y = 0;
  let n = el;
  let guard = 0;
  while (n && guard++ < 24) {
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return y;
};

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
  // Gates the portal below: createPortal needs document.body, so it can only
  // run after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const core = coreRef.current;
    if (!wrap || !core) return;

    const w = wrap.getBoundingClientRect();
    setBox({ w: wrap.offsetWidth, h: wrap.offsetHeight });

    // The hub's rect, corrected for whatever the timeline is currently doing
    // to it.
    //
    // Scale is fine to read straight off the rect: scaling happens about the
    // centre, so the centre does not move. Translation is NOT - and the
    // entrance now lifts the hub in from below the fold. Measuring during that
    // rise (a resize, or fonts settling, mid-animation) aimed every string at
    // a point ~55vh under the monogram, and they visibly shot past it off the
    // bottom of the screen. Subtracting GSAP's own y puts the target back on
    // the hub's resting centre whenever the measurement happens to run.
    const c = core.getBoundingClientRect();
    const coreY = Number(gsap.getProperty(core, "y")) || 0;
    const cx = c.left + c.width / 2 - w.left;
    const cy = c.top + c.height / 2 - w.top - coreY;

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

    let tl;
    let settled = false;

    const ctx = gsap.context(() => {
      const wires = gsap.utils.toArray(".constellation-wire");
      // The inner wrapper, never the node itself. The node owns its own
      // transform in CSS (hover lift); an inline transform from GSAP on the
      // same element wins over the stylesheet and silently kills it.
      const nodes = gsap.utils.toArray(".constellation-node-inner");
      const section = sectionRef.current;

      // GSAP owns dasharray as well as offset. Leaving dasharray to CSS while
      // animating offset made the draw resolve in one frame instead of
      // interpolating.
      wires.forEach((wire) => {
        const len = wire.getTotalLength();
        gsap.set(wire, { strokeDasharray: len, strokeDashoffset: len });
      });

      const navH = () => {
        const nav = document.querySelector(".navbar");
        return nav ? nav.getBoundingClientRect().height : 72;
      };

      // One stage per logo, then one each for the hub, the strings and the
      // glow. Derived from the node count, so adding Express or RabbitMQ
      // lengthens the run on its own rather than needing the numbers retuned.
      const STAGES = nodes.length + 3;
      const unit = 1 / STAGES;

      // Where a piece sits once it has landed, in viewport coordinates. The
      // section is pinned at the navbar, so that is a layout sum rather than a
      // rect - and layout is the only thing here a transform cannot corrupt.
      const restingTop = (el) => navH() + (documentTop(el) - documentTop(section));
      // Each piece starts at the bottom edge of the screen and rises to its
      // place. The hub sits lower than the logos, so it naturally travels less
      // - it enters from the bottom edge either way.
      const rise = (i, el) => Math.max(90, window.innerHeight - restingTop(el));

      // Scrubbed, and therefore REVERSIBLE - it runs backwards as you scroll
      // back up and forwards again on the way down.
      //
      // It used to be forward-only, so it played once and then sat finished.
      // The pin still reserved its full run of scroll on every later pass
      // though, which meant scrolling back up through the section, or coming
      // back down to it, cost several screens of scrolling in which nothing
      // moved. Tying it to the scrub means the scroll always drives something,
      // and the section behaves the same way every time you pass it.
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          // Pinned. Each stage takes half a screen of scrolling, and over that
          // distance an unpinned section would have scrolled away long before
          // the strings drew - the payoff would happen below the fold. Pinning
          // holds it under the navbar so the whole thing plays in view.
          start: () => "top " + navH() + "px",
          end: () => "+=" + window.innerHeight * 0.5 * STAGES,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          scrub: 0.8,
          onUpdate: () => {
            settled = true;
          },
        },
      });

      tl
        // 1. One logo per stage. duration === stagger, so each starts exactly
        //    as the one before it lands: continuous, with no gap and no
        //    overlap.
        .fromTo(
          nodes,
          { opacity: 0, y: rise },
          { opacity: 1, y: 0, duration: unit, ease: "power2.out", stagger: unit },
          0
        )
        // 2. Then the monogram, from the same direction. xPercent is restated
        //    because the hub is centred with translateX(-50%) in CSS, and
        //    handing GSAP a y without it would drop the centring.
        .fromTo(
          coreRef.current,
          { opacity: 0, y: rise, scale: 0.82, xPercent: -50 },
          { opacity: 1, y: 0, scale: 1, xPercent: -50, duration: unit, ease: "power2.out" },
          nodes.length * unit
        )
        // 3. Only once there is something at both ends do the strings appear.
        //    All together, out from under the captions and down into the hub.
        .to(wires, { strokeDashoffset: 0, duration: unit, ease: "power1.inOut" }, (nodes.length + 1) * unit)
        // 4. The strings have landed, so the monogram lights.
        .fromTo(
          ".core-glow",
          { opacity: 0 },
          { opacity: 1, duration: unit, ease: "power2.out" },
          (nodes.length + 2) * unit
        );
    }, wrapRef);

    // Clicking Skills means "show me the skills", not "put me at the start of
    // a four-screen animation". The plain anchor lands on the pin's start, so
    // it is intercepted and aimed at where the pin releases instead - the
    // scrub then resolves to the finished state on arrival. Refreshing first
    // matters: the anchor was landing back in Work because the target was
    // computed against positions that pinning had since moved.
    const onNavClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = e.target instanceof Element ? e.target.closest('a[href="#skills"]') : null;
      const st = tl && tl.scrollTrigger;
      if (!link || !st) return;
      e.preventDefault();
      ScrollTrigger.refresh();
      window.scrollTo({ top: Math.ceil(st.end), behavior: "smooth" });
    };
    document.addEventListener("click", onNavClick);

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
    const settleTimer = setTimeout(refresh, 1200);

    // Failsafe. The timeline's opening state hides the logos, the hub and the
    // strings, so anything that stops the trigger from driving it would leave
    // the whole section blank - which is exactly how the contact form ended up
    // invisible earlier. If the constellation is on screen and nothing has
    // moved it, assemble it outright.
    const failsafe = setTimeout(() => {
      if (settled || !tl || !wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight && r.bottom > 0;
      if (onScreen) tl.progress(1);
    }, 2600);

    return () => {
      clearTimeout(settleTimer);
      clearTimeout(failsafe);
      document.removeEventListener("click", onNavClick);
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

      </div>

      {/* Portalled to <body>, deliberately.
          The shared WebGL canvas is position: fixed so it can cover the
          viewport and host every icon's <View>. This section is pinned, and
          GSAP pins by transforming the element - which re-anchors any fixed
          descendant to that transform instead of the viewport. Left inside,
          the canvas measured 1440x828 at y=7639 rather than filling the
          screen, and the icons drawn into it went with it. Out here it has no
          transformed ancestor to be captured by. */}
      {mounted ? createPortal(<TechCanvas />, document.body) : null}
    </div>
  );
};

export default TechStack;
