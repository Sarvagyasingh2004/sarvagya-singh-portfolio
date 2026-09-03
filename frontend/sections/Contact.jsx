"use client";

import React, { useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader";
import { contactEmail } from "@/constants";
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
        message: `${error.message} You can email me directly at ${contactEmail}.`,
      });
    }
  };

  const loading = status.state === "sending";

  return (
    <section id="contact" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Get In Touch With Me"
          sub="☎️ Contact Information"
        />
        <div className="mt-16 grid-12-cols">
          <div className="xl:col-span-5 ">
            <div className="flex-center card-border rounded-xl p-10">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-7"
              >
                <div>
                  <label htmlFor="name">Your name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="What’s your good name?"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="What’s your email address?"
                    required
                  />
                </div>

                <div>
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
                </div>

                {status.message ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className={
                      status.state === "error" ? "form-status is-error" : "form-status is-ok"
                    }
                  >
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

                <button type="submit" disabled={loading}>
                  <div className="cta-button group">
                    <div className="bg-circle" />
                    <p className="text">
                      {loading ? "Sending..." : "Send Message"}
                    </p>
                    <div className="arrow-wrapper">
                      <img src="/images/arrow-down.svg" alt="arrow" />
                    </div>
                  </div>
                </button>
              </form>
            </div>
          </div>
          <div className="xl:col-span-7 min-h-96">
            <div className="w-full h-full bg-[#cb7c2e] hover:cursor-grab rounded-3xl overflow-hidden">
              <ContactExperience />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
