import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/all";
import { projects } from "../../constants/index.js";

gsap.registerPlugin(ScrollTrigger);

// Links are only rendered once a real URL exists — a REPLACE_ME placeholder
// renders nothing rather than a dead link.
const ProjectLinks = ({ repoUrl, liveUrl, title }) => {
  const links = [
    { label: "View code", url: repoUrl },
    { label: "Live demo", url: liveUrl },
  ].filter((l) => l.url && l.url !== "REPLACE_ME");

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {links.map(({ label, url }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} for ${title}`}
          className="text-white underline underline-offset-4 hover:text-[#839cb5] transition-colors"
        >
          {label}
        </a>
      ))}
    </div>
  );
};

const TechList = ({ tech }) => (
  <ul className="flex flex-wrap gap-2 mt-4" aria-label="Technologies used">
    {tech.map((t) => (
      <li
        key={t}
        className="text-sm text-white-50 border border-white/15 rounded-full px-3 py-1"
      >
        {t}
      </li>
    ))}
  </ul>
);

const ShowcaseSection = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5 });

    cardRefs.current.filter(Boolean).forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.3 * (index + 1),
          scrollTrigger: { trigger: card, start: "top bottom-=100" },
        }
      );
    });
  }, []);

  const [lead, ...rest] = projects;

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="app-showcase"
      ref={sectionRef}
    >
      <div className="w-full">
        <h2 id="work-heading" className="sr-only">
          Selected work
        </h2>
        <p className="text-white-50 md:text-lg max-w-2xl mb-10">
          Systems I designed and built independently. Every one is a public
          repository &mdash; clone it and read the code.
        </p>
        <div className="showcaselayout">
          <div
            className="first-project-wrapper"
            ref={(el) => (cardRefs.current[0] = el)}
          >
            <div className="image-wrapper">
              <img src={lead.imgPath} alt={`${lead.title} interface`} loading="lazy" />
            </div>
            <div className="text-content">
              <p className="text-[#839cb5] text-sm uppercase tracking-wider">
                {lead.thesis}
              </p>
              <h3>{lead.title}</h3>
              <p className="text-white-50 md:text-xl">{lead.desc}</p>
              <TechList tech={lead.tech} />
              <ProjectLinks {...lead} />
            </div>
          </div>

          <div className="project-list-wrapper overflow-hidden">
            {rest.map((project, i) => (
              <div
                className="project"
                key={project.slug}
                ref={(el) => (cardRefs.current[i + 1] = el)}
              >
                <div className="image-wrapper">
                  <img
                    src={project.imgPath}
                    alt={`${project.title} interface`}
                    loading="lazy"
                  />
                </div>
                <p className="text-[#839cb5] text-sm uppercase tracking-wider mt-4">
                  {project.thesis}
                </p>
                <h3>{project.title}</h3>
                <p className="text-white-50 mt-2">{project.desc}</p>
                <TechList tech={project.tech} />
                <ProjectLinks {...project} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
