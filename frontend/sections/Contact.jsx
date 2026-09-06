"use client";

import React, { useEffect, useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader";
import Reveal from "../components/Reveal";
import dynamic from "next/dynamic";

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
      formRef.current?.reset();
      setStatus({ state: "success", message: "Message sent. I'll try to reply within a day." });
    } catch (error) {
      setStatus({
        state: "error",
        message: `${error.message} You can also reach me on LinkedIn — the link is in the footer.`,
      });
    }
  };

  useEffect(() => {
    if (status.state !== "success") return;
    const idle = setTimeout(
      () => setStatus((s) => (s.state === "success" ? { ...s, state: "idle" } : s)),
      4200
    );
    const clear = setTimeout(
      () => setStatus((s) => (s.state === "error" ? s : { state: "idle", message: "" })),
      10000
    );
    return () => {
      clearTimeout(idle);
      clearTimeout(clear);
    };
  }, [status.state]);

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
                className={`w-full flex flex-col gap-7 contact-form${armed ? " is-armed" : ""}${shown ? " is-in" : ""}${status.state === "success" ? " is-sent" : ""}`}
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
