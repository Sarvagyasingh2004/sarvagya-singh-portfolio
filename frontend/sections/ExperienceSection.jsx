"use client";

import TitleHeader from "../components/TitleHeader";
import { expCards } from "@/constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const ExperienceSection = () => {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.utils.toArray(".exp-item").forEach((item) => {
      gsap.from(item, {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 85%" },
      });
    });

    // The rail draws itself downward as the section scrolls through — scaling
    // the line itself, rather than un-masking it with a black overlay.
    gsap.fromTo(
      ".exp-rail-line",
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".exp-timeline",
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="section-padding"
    >
      <div className="w-full md:px-20 px-5">
        <TitleHeader
          id="experience-heading"
          title="Where I've Shipped"
          sub="Professional Experience"
        />

        <ol className="exp-timeline">
          {expCards.map((card) => (
            <li className="exp-item" key={card.company}>
              <div className="exp-rail" aria-hidden="true">
                <span className="exp-dot" />
                <span className="exp-rail-line" />
              </div>

              <div className="exp-body">
                <div className="exp-head">
                  <div>
                    <h3 className="exp-title">{card.title}</h3>
                    <p className="exp-org">
                      <span>{card.company}</span>
                      <span className="exp-sep">/</span>
                      <span>{card.location}</span>
                    </p>
                  </div>
                  <p className="exp-date">{card.date}</p>
                </div>

                <p className="exp-summary">{card.summary}</p>

                <ul className="exp-points">
                  {card.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default ExperienceSection;
