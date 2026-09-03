import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { ScrollTrigger } from "gsap/all";
import { projects } from "../../constants/index.js";
import TitleHeader from "../components/TitleHeader";

gsap.registerPlugin(ScrollTrigger);

const isReal = (url) => Boolean(url) && url !== "REPLACE_ME";

const ProjectCard = ({ project, featured }) => {
  const { title, thesis, desc, tech, imgPath, repoUrl, liveUrl } = project;

  const links = [
    { label: "Read the code", url: repoUrl },
    { label: "Live demo", url: liveUrl },
  ].filter((l) => isReal(l.url));

  return (
    <article className={`proj-card ${featured ? "featured" : ""}`}>
      <div className="proj-media">
        <img src={imgPath} alt={`${title} interface`} loading="lazy" />
      </div>

      <div className="proj-body">
        <p className="proj-thesis">{thesis}</p>
        <h3 className="proj-title">{title}</h3>
        <p className="proj-desc">{desc}</p>

        <ul className="proj-tech" aria-label={`${title} technologies`}>
          {tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {links.length ? (
          <div className="proj-links">
            {links.map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} — ${title}`}
              >
                {label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="proj-pending">Links coming shortly</p>
        )}
      </div>
    </article>
  );
};

const ShowcaseSection = () => {
  const gridRef = useRef(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.utils.toArray(".proj-card").forEach((card, i) => {
      gsap.from(card, {
        y: 40,
        opacity: 0,
        duration: 0.75,
        delay: i * 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 88%" },
      });
    });
  }, []);

  const [lead, ...rest] = projects;

  return (
    <section id="work" aria-labelledby="work-heading" className="section-padding">
      <div className="w-full md:px-20 px-5">
        <TitleHeader
          id="work-heading"
          title="Systems I Built Alone"
          sub="Independent Work"
        />

        <p className="proj-intro">
          My production work at Kraftshala and BWS shipped to real users, but you
          can&rsquo;t clone it. These you can. Every one is a public repository
          &mdash; read the code and judge it directly.
        </p>

        <div className="proj-grid" ref={gridRef}>
          <ProjectCard project={lead} featured />
          {rest.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
