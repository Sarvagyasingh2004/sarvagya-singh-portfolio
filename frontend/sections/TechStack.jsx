"use client";

import TitleHeader from "../components/TitleHeader";
import { techStackIcons } from "@/constants";
import dynamic from "next/dynamic";
import { useRef } from "react";

// WebGL can't be server-rendered, and a static export prerenders everything —
// so the canvas loads on the client only.
const TechIcon = dynamic(() => import("../components/Models/TechLogos/TechIcon.jsx"), { ssr: false });
const TechCanvas = dynamic(() => import("../components/Models/TechLogos/TechCanvas.jsx"), { ssr: false });
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
const TechStack = () => {
  const gridRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      ".tech-card",
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.inOut",
        stagger: 0.2,
        scrollTrigger: {
          trigger: "#skills",
          start: "top center",
        },
      }
    );
  }, []);
  return (
    <div id="skills" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="My Preferred Tech Stack"
          sub="🤝 The Skills I Bring to the Table"
        />
        <div className="tech-grid" ref={gridRef}>
          {techStackIcons.map((techStackIcon) => (
            <div
              key={techStackIcon.name}
              className="card-border tech-card overflow-hidden group xl:rounded-full rounded-lg"
            >
              {/* The tech-card-animated-bg div is used to create a background animation when the 
                  component is hovered. */}
              <div className="tech-card-animated-bg" />
              <div className="tech-card-content">
                {/* The tech-icon-wrapper div contains the TechIconCardExperience component, 
                    which renders the 3D model of the tech stack icon. */}
                <div className="tech-icon-wrapper">
                  <TechIcon model={techStackIcon} />
                </div>
                {/* The padding-x and w-full classes are used to add horizontal padding to the 
                    text and make it take up the full width of the component. */}
                <div className="padding-x w-full">
                  {/* The p tag contains the name of the tech stack icon. */}
                  <p>{techStackIcon.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The single shared canvas every <View> above renders through. */}
      <TechCanvas trackRef={gridRef} />
    </div>
  );
};

export default TechStack;
