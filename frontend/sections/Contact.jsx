"use client";

import React, { useEffect, useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader";
import Reveal from "../components/Reveal";
import dynamic from "next/dynamic";

// WebGL can't be server-rendered, and a static export prerenders everything —
// so the canvas loads on the client only.
const ContactExperience = dynamic(() => import("../components/ContactModels/ContactExperience"), { ssr: false });

const Contact = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company_url: "" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't send that message.");
      }
      setForm({ name: "", email: "", message: "" });
      setStatus({ state: "success", message: "Message sent. I'll reply within a day." });
    } catch (error) {
      setStatus({
        state: "error",
        message: `${error.message} You can also reach me on LinkedIn — the link is in the footer.`,
      });
    }
  };

  // The button holds its "sent" face for a beat, then returns to idle so the
  // form is obviously usable again.
  useEffect(() => {
    if (status.state !== "success") return;
    const t = setTimeout(
      () => setStatus((s) => (s.state === "success" ? { ...s, state: "idle" } : s)),
      4200
    );
    return () => clearTimeout(t);
  }, [status.state]);

  // Fields arrive one after another as the section comes up, so the form reads
  // as being assembled rather than pasted in.
  //
  // Deliberately an IntersectionObserver and CSS rather than a scrubbed GSAP
  // tween. A gsap.from() applies its start state the moment it is created, and
  // its ScrollTrigger start position is measured on mount - before the WebGL
  // canvases on this page finish changing the document height. When that
  // measurement went stale the trigger never fired and the from-state stuck,
  // leaving every field and the submit button at opacity 0. A contact form
  // that can be hidden by its own decoration is a bug, so:
  //   - the markup renders visible; `armed` is what opts into hiding, and it is
  //     only ever set for an element confirmed to be OFF screen
  //   - a timeout guarantees the form reveals itself even if nothing else fires
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          } else {
            // Off screen on first callback: safe to hide and animate in later.
            setArmed(true);
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);

    const failsafe = setTimeout(() => setShown(true), 2600);
    return () => {
      io.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  const loading = status.state === "sending";
  const sent = status.state === "success";

  return (
    <section id="contact" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Get In Touch With Me"
          sub="☎️ Contact Information"
        />
        <div className="mt-16 grid-12-cols">
          <Reveal className="xl:col-span-5">
            <div className="flex-center card-border rounded-xl p-10">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className={`w-full flex flex-col gap-7 contact-form${armed ? " is-armed" : ""}${shown ? " is-in" : ""}`}
              >
                <div className="contact-field" style={{ "--i": 0 }}>
                  <label htmlFor="name">Your name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="What’s your good name?"
                    autoComplete="name"
                    required
                  />
                  <span className="field-line" aria-hidden="true" />
                </div>

                <div className="contact-field" style={{ "--i": 1 }}>
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="What’s your email address?"
                    autoComplete="email"
                    required
                  />
                  <span className="field-line" aria-hidden="true" />
                </div>

                <div className="contact-field" style={{ "--i": 2 }}>
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can I help you?"
                    rows="5"
                    required
                  />
                  <span className="field-line" aria-hidden="true" />
                </div>

                {status.message ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className={
                      status.state === "error" ? "form-status is-error" : "form-status is-ok"
                    }
                  >
                    <span className="form-status-dot" aria-hidden="true" />
                    {status.message}
                  </p>
                ) : null}

                {/* Honeypot — hidden from people, filled by bots. */}
                <input
                  type="text"
                  name="company_url"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="honeypot"
                  onChange={() => {}}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="contact-submit"
                  style={{ "--i": 3 }}
                  data-state={status.state}
                >
                  <div className="cta-button group">
                    <div className="bg-circle" />
                    <p className="text">
                      {loading ? "Sending..." : sent ? "Message sent" : "Send Message"}
                    </p>
                    <div className="arrow-wrapper">
                      {loading ? (
                        <span className="cta-spinner" aria-hidden="true" />
                      ) : sent ? (
                        <svg
                          className="send-check"
                          viewBox="0 0 24 24"
                          width="17"
                          height="17"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg
                          className="send-plane"
                          viewBox="0 0 24 24"
                          width="17"
                          height="17"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21.5 2.5L11 13" />
                          <path d="M21.5 2.5l-6.6 19-3.9-8.5L2.5 9.1z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              </form>
            </div>
          </Reveal>
          <Reveal className="xl:col-span-7 min-h-96" delay={130}>
            <div className="contact-canvas-wrap w-full h-full rounded-3xl overflow-hidden">
              <ContactExperience />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
