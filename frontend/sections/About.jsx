"use client";

import TitleHeader from "../components/TitleHeader";
import Reveal from "../components/Reveal";
import { about, now } from "@/constants";

const About = () => (
  <section id="about" className="flex-center section-padding">
    <div className="w-full h-full md:px-10 px-5">
      <TitleHeader title={about.heading} sub={about.eyebrow} />

      <div className="about-grid mt-16">
        <div className="about-copy">
          {about.paragraphs.map((p, i) => (
            <Reveal as="p" key={i} delay={i * 90}>
              {p}
            </Reveal>
          ))}
        </div>

        <Reveal as="aside" className="about-side" delay={140}>
          <dl className="about-facts">
            {about.facts.map(({ k, v }) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="now-card">
            <p className="now-head">
              <span className={`now-dot ${now.status}`} aria-hidden="true" />
              Now
              <span className="now-updated">Updated {now.updated}</span>
            </p>
            <p className="now-headline">{now.headline}</p>
            <ul>
              {now.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default About;
