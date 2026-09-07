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

const TechStack = () => {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const coreRef = useRef(null);
  const nodeRefs = useRef([]);
  const [paths, setPaths] = useState([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [grad, setGrad] = useState({ y1: 0, y2: 1 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The shared canvas draws the whole viewport every frame. There is no reason
  // to do that while the section is nowhere near the screen, which is most of
  // the time and most of the scrolling.
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "120% 0px 120% 0px",
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const core = coreRef.current;
    if (!wrap || !core) return;

    const w = wrap.getBoundingClientRect();
    setBox({ w: wrap.offsetWidth, h: wrap.offsetHeight });

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
        const y = o.y + el.offsetHeight + WIRE_START_GAP;
        if (firstStartY === null) firstStartY = y;

        const dx = x - cx;
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
    if (window.matchMedia("(max-width: 900px)").matches) return;

    let tl;
    let settled = false;

    const ctx = gsap.context(() => {
      const wires = gsap.utils.toArray(".constellation-wire");
      const nodes = gsap.utils.toArray(".constellation-node-inner");
      const section = sectionRef.current;

      wires.forEach((wire) => {
        const len = wire.getTotalLength();
        gsap.set(wire, { strokeDasharray: len, strokeDashoffset: len });
      });

      const navH = () => {
        const nav = document.querySelector(".navbar");
        return nav ? nav.getBoundingClientRect().height : 72;
      };

      const STAGES = nodes.length + 3;
      const unit = 1 / STAGES;

      const MAX_SCREENS = 5.5;
      const perStage = Math.min(0.5, MAX_SCREENS / STAGES);

      const restingTop = (el) => navH() + (documentTop(el) - documentTop(section));
      const rise = (i, el) => Math.max(90, window.innerHeight - restingTop(el));

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => "top " + navH() + "px",
          end: () => "+=" + window.innerHeight * perStage * STAGES,
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
        .fromTo(
          nodes,
          { opacity: 0, y: rise },
          { opacity: 1, y: 0, duration: unit, ease: "power2.out", stagger: unit },
          0
        )
        .fromTo(
          coreRef.current,
          { opacity: 0, y: rise, scale: 0.82, xPercent: -50 },
          { opacity: 1, y: 0, scale: 1, xPercent: -50, duration: unit, ease: "power2.out" },
          nodes.length * unit
        )
        .to(wires, { strokeDashoffset: 0, duration: unit, ease: "power1.inOut" }, (nodes.length + 1) * unit)
        // 4. The strings have landed, so the monogram lights.
        .fromTo(
          ".core-glow",
          { opacity: 0 },
          { opacity: 1, duration: unit, ease: "power2.out" },
          (nodes.length + 2) * unit
        );
    }, wrapRef);

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

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") requestAnimationFrame(refresh);
    else window.addEventListener("load", refresh, { once: true });
    const settleTimer = setTimeout(refresh, 1200);

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
              <Logo size={92} glow />
            </span>
          </div>
        </div>

      </div>

      {mounted ? createPortal(<TechCanvas active={inView} />, document.body) : null}
    </div>
  );
};

export default TechStack;
