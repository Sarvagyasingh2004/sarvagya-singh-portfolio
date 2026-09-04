"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/constants";

/**
 * Projects as a sticky card stack.
 *
 * Each card sticks at a slightly lower offset than the one before, so as you
 * scroll the next card rises over the previous while a sliver of every earlier
 * card stays visible — the depth cue that tells you how many are behind.
 *
 * Built with position: sticky and a per-card top offset rather than
 * scroll-driven JS transforms: the browser owns the pinning, so it stays
 * smooth and it degrades to a plain vertical list if sticky is unsupported.
 */
const ARROW = (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const ProjectCard = ({ project, index, total }) => {
  const links = [
    { label: "View code", url: project.repoUrl },
    { label: "Live demo", url: project.liveUrl },
  ].filter((l) => l.url && l.url !== "REPLACE_ME");

  return (
    <article
      className="stack-card"
      data-accent={project.accent}
      style={{
        // Each card pins 1.6rem lower than the last, leaving the previous
        // card's top edge showing.
        top: `calc(var(--nav-h) + ${index * 1.6}rem)`,
        zIndex: index + 1,
      }}
    >
      <div className="stack-card-inner">
        <header className="stack-shot">
          {project.shot ? (
            <img src={project.shot} alt={`${project.title} interface`} loading="lazy" />
          ) : (
            <div className="stack-shot-empty" role="img" aria-label={`${project.title} — screenshot pending`}>
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
      </div>
    </article>
  );
};

const ShowcaseSection = () => {
  const ref = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <section id="work" className="stack-section" ref={ref}>
      <div className="stack-head">
        <p className="stack-eyebrow">Selected work</p>
        <h2>Systems I designed and built end to end</h2>
        <p className="stack-sub">
          Every one is a public repository &mdash; clone it and read the code.
        </p>
      </div>

      <div className={`stack-track ${reduced ? "is-static" : ""}`}>
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
