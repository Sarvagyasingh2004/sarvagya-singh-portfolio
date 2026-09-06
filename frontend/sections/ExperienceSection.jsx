"use client";

import TitleHeader from "../components/TitleHeader";
import { expCards } from "@/constants";
import GlowCard from "../components/GlowCard.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const ExperienceSection = () => {
  useGSAP(() => {
    gsap.utils.toArray(".timeline-card").forEach((card) => {
      gsap.from(card, {
        xPercent: -100,
        opacity: 0,
        transformOrigin: "left left",
        duration: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
        },
      });
    });

    // The mask retracts as you scroll, uncovering the gradient line beneath.
    //
    // Scrubbed to the scroll position. The previous version called
    // `gsap.to(".timeline", ...)` inside its trigger's onUpdate, which built a
    // fresh half-second tween on every scroll event, each fighting the one
    // before it — that is the line dropping out halfway down and coming back.
    // Its trigger also resolved to a single element while the tween targeted
    // every match, so nothing was scoped to what it animated.
    gsap.utils.toArray(".timeline").forEach((line) => {
      gsap.fromTo(
        line,
        { scaleY: 1 },
        {
          scaleY: 0,
          transformOrigin: "bottom bottom",
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        }
      );
    });

    gsap.utils.toArray(".expText").forEach((text) => {
      gsap.from(text, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: text,
          start: "top 60%",
        },
      });
    });
  }, []);
  return (
    <section
      id="experience"
      className="w-full md:mt-40 mt-20 section-padding xl:px-0"
    >
      <div className="w-full h-full md:px-20 px-5">
        <TitleHeader
          title="Professional Work Experience"
          sub="💼 My Career Overview"
        />
        <div className="mt-32 relative">
          {/* One line for the whole run, rendered once.
              It used to be emitted inside the card loop, but `.timeline-wrapper`
              is absolute and the nearest positioned ancestor is this shared
              container — so all three copies resolved to the same box and
              stacked, spanning the section three times over rather than
              once each. */}
          <div className="timeline-wrapper">
            <div className="timeline" />
            <div className="gradient-line w-1 h-full" />
          </div>
          <div className="relative z-50 xl:space-y-32 space-y-10">
            {expCards.map((card, index) => (
              <div className="exp-card-wrapper" key={index}>
                <div className="xl:w-2/6">
                  <GlowCard index={index}>
                    <div className="exp-summary">
                      <p className="exp-company">{card.company}</p>
                      <p className="exp-review">{card.review}</p>
                    </div>
                  </GlowCard>
                </div>
                <div className="xl:w-4/6">
                  <div className="flex items-start">
                    <div className="expText flex xl:gap-20 md:gap-10 gap-5 relative z-20">
                      <div className="timeline-logo">
                        <CompanyLogo src={card.logoPath} name={card.company} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-3xl">{card.title}</h3>
                        <p className="my-5 text-white-50">🗓️ {card.date}</p>
                        <p className="text-[#839cb5] italic">
                          Responsibilities
                        </p>
                        <ul className="list-disc ms-5 mt-5 flex flex-col gap-5 text-white-50">
                          {card.responsibilities.map((responsibility) => (
                            <li key={responsibility} className="text-lg">
                              {responsibility}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
