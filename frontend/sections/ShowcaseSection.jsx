"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

const ARROW = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const ProjectCard = ({ project, index, total }) => {
  const links = [
    ...(project.repos ??
      (project.repoUrl ? [{ label: "View code", url: project.repoUrl }] : [])),
    { label: "Live demo", url: project.liveUrl },
  ].filter((l) => l.url && l.url !== "REPLACE_ME");

  return (
    <div className="stack-slot">
      <article className="stack-card" data-accent={project.accent}>
        <header className="stack-shot">
          {project.shot ? (
            <img src={project.shot} alt={`${project.title} interface`} loading="lazy" />
          ) : (
            <div className="stack-shot-empty" role="img" aria-label={`${project.title} preview pending`}>
              <span>{project.stack.slice(0, 3).join(" · ")}</span>
            </div>
          )}
          <span className="stack-count">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </header>

        <div className="stack-body">
          <div className="stack-lede">
            <h3>{project.title}</h3>
            <p>{project.tagline}</p>
            <ul className="stack-chips">
              {project.stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {links.length ? (
              <div className="stack-links">
                {links.map(({ label, url }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer">
                    {label} {ARROW}
                  </a>
                ))}
              </div>
            ) : null}
            {project.note ? <p className="stack-note">{project.note}</p> : null}
          </div>

          <ul className="stack-points">
            {project.highlights.map((h) => (
              <li key={h}>
                <span className="stack-dot" aria-hidden="true" />
                <p>{h}</p>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
};

const ShowcaseSection = () => {
  const root = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".stack-card");
      const slots = gsap.utils.toArray(".stack-slot");
      if (cards.length < 2) return;

      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 72;
      const offset = Math.round(navH + window.innerHeight * 0.06);

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;

        ScrollTrigger.create({
          trigger: slots[i],
          start: () => `top ${offset}px`,
          endTrigger: slots[cards.length - 1],
          end: () => `top ${offset}px`,
          pin: card,
          pinSpacing: false,
        });

        gsap.to(card, {
          scale: 0.94 - (cards.length - 1 - i) * 0.005,
          opacity: 0.45,
          ease: "none",
          scrollTrigger: {
            trigger: slots[i + 1],
            start: () => `top bottom`,
            end: () => `top ${offset}px`,
            scrub: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" className="stack-section" ref={root}>
      <div className="stack-head">
        <h2>Systems I designed and built end to end</h2>
        <p className="stack-sub">
          Three are public repositories you can clone. One shipped inside a
          company, to a team that used it daily.
        </p>
      </div>

      <div className="stack-track">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            total={projects.length}
          />
        ))}
      </div>
    </section>
  );
};

export default ShowcaseSection;
