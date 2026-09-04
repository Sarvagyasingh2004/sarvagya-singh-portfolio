"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useRef } from "react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const ShowcaseSection = () => {
  const sectionRef = useRef(null);
  const project1Ref = useRef(null);
  const project2Ref = useRef(null);
  const project3Ref = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      sectionRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 1.5,
      }
    );

    const projects = [
      project1Ref.current,
      project2Ref.current,
      project3Ref.current,
    ];

    projects.forEach((project, index) => {
      gsap.fromTo(
        project,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.3 * (index + 1),
          scrollTrigger: {
            trigger: project,
            start: "top bottom-=100",
          },
        }
      );
    });
  }, []);
  return (
    <section id="work" className="app-showcase" ref={sectionRef}>
      <div className="w-full">
        <div className="showcaselayout">
          {/* left */}
          <div className="first-project-wrapper" ref={project1Ref}>
            <div className="image-wrapper">
              <div className="shot-placeholder" role="img" aria-label="Food Delivery Microservices Platform — screenshot pending">
                <span>6 services</span>
                <b>RabbitMQ &middot; Redis &middot; Socket.IO</b>
              </div>
            </div>
            <div className="text-content">
              <h2>
                Six Independent Microservices Handling Orders, Payments and
                Live Rider Tracking
              </h2>
              <p className="text-white-50 md:text-xl">
                Built with Node.js, TypeScript and RabbitMQ. Redis caching cut
                DB reads ~60%; retries, a dead-letter queue and health checks
                handle partial failure.
              </p>
            </div>
          </div>
          {/* right */}
          <div className="project-list-wrapper overflow-hidden">
            <div className="project" ref={project2Ref}>
              <div className="image-wrapper bg-[#ffefdb]">
                <div className="shot-placeholder alt" role="img" aria-label="Real-Time Chat Application — screenshot pending">
                  <span>WebSockets</span>
                  <b>Offline delivery</b>
                </div>
              </div>
              <h2>Real-Time Chat &mdash; WebSockets with Offline Delivery</h2>
            </div>
            <div className="project" ref={project3Ref}>
              <div className="image-wrapper bg-[#ffe7eb]">
                <div className="shot-placeholder alt2" role="img" aria-label="SaaSify-AI — screenshot pending">
                  <span>2 LLM providers</span>
                  <b>One adapter</b>
                </div>
              </div>
              <h2>SaaSify-AI &mdash; Multi-Provider LLM Platform</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
