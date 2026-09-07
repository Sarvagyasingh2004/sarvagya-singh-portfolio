"use client";

import { useGSAP } from "@gsap/react";
import { words } from "@/constants";
import Button from "../components/Button";
import dynamic from "next/dynamic";

const HeroExperience = dynamic(() => import("../components/HeroModels/HeroExperience"), { ssr: false });
import { SplitText } from "gsap/all";
import gsap from "gsap";
import AnimatedCounter from "../components/AnimatedCounter";

const Hero = () => {
  useGSAP(() => {
    gsap.fromTo(
      ".hero-text .hero-line",
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 1,
        ease: "power1.inOut",
      }
    );
  }, []);

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-0 left-0 z-10">
        <img src="/images/bg.png" alt="background" />
      </div>
      <div className="hero-layout">
        <header className="flex flex-col justify-center md:w-full w-screen md:px-20 px-5">
          <div className="flex flex-col gap-7">
            <div className="hero-text">
              <h1>
                {/* The animated words repeat to loop the marquee, which leaves the
                    visible heading reading as one duplicated run-on string. This is
                    the heading a crawler and a screen reader get instead. */}
                <span className="sr-only">
                  Sarvagya Singh — Full-Stack &amp; Backend Engineer
                </span>
                <span className="hero-line" aria-hidden="true">
                Shaping
                <span className="slide">
                  <span className="wrapper">
                    {words.map((word, index) => (
                      <span
                        key={index}
                        className="flex items-center md:gap-3 gap-1 pb-2"
                      >
                        <img
                          src={word.imgPath}
                          alt={word.text}
                          className="xl:size-12 md:size-10 size-7 md:p-2 p-1 rounded-full bg-white-50"
                        />
                        <span>{word.text}</span>
                      </span>
                    ))}
                  </span>
                </span>
                </span>
                <span className="hero-line" aria-hidden="true">into Real Projects</span>
                <span className="hero-line" aria-hidden="true">that Deliver Results</span>
              </h1>
            </div>
            <p className="text-white-50 md:text-xl relative z-10 pointer-events-none">
              Hi, I'm Sarvagya, a developer based in India with passion to learn
              and code.
            </p>
            <Button
              className="md:w-80 md:h-16 w-60 h-12"
              id="counter"
              text="See My Work"
            />
          </div>
        </header>
        <figure>
          <div className="hero-3d-layout">
            <HeroExperience />
          </div>
        </figure>
      </div>
      <AnimatedCounter />
    </section>
  );
};

export default Hero;
