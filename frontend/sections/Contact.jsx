"use client";

import { useRef, useState } from "react";
import TitleHeader from "../components/TitleHeader";
import dynamic from "next/dynamic";

const ContactExperience = dynamic(() => import("../components/ContactModels/ContactExperience"), {
  ssr: false,
  loading: () => <div className="canvas-skeleton" />,
});
import emailjs from "@emailjs/browser";
import { contactEmail } from "@/constants";

// NOTE: EmailJS is a stopgap so the form works today. It gets replaced by
// POST {API_URL}/api/contact once the Express backend is deployed — that path
// persists submissions to MongoDB and fires an instant SES alert.
const Contact = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const hasEmail = contactEmail && contactEmail !== "REPLACE_ME";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      setForm({ name: "", email: "", message: "" });
      setStatus({
        state: "success",
        message: "Message sent. I'll reply within a day.",
      });
    } catch (error) {
      console.error("EmailJS error", error);
      setStatus({
        state: "error",
        message: hasEmail
          ? `Couldn't send that. Email me directly at ${contactEmail}.`
          : "Couldn't send that. Please try again in a moment.",
      });
    }
  };

  const sending = status.state === "sending";

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="flex-center section-padding"
    >
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          id="contact-heading"
          title="Get In Touch"
          sub="Contact Information"
        />
        <div className="mt-16 grid-12-cols">
          <div className="xl:col-span-5">
            <div className="flex-center card-border rounded-xl p-10">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-7"
                noValidate={false}
              >
                <div>
                  <label htmlFor="name">Your name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">Your email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message">Your message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="What would you like to talk about?"
                    rows="5"
                    required
                  />
                </div>

                <button type="submit" disabled={sending}>
                  <div className="cta-button group">
                    <div className="bg-circle" />
                    <p className="text">
                      {sending ? "Sending..." : "Send message"}
                    </p>
                    <div className="arrow-wrapper">
                      <img src="/images/arrow-down.svg" alt="" />
                    </div>
                  </div>
                </button>

                {/* Announced to screen readers as soon as it populates. */}
                <p
                  role="status"
                  aria-live="polite"
                  className={
                    status.state === "error"
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                >
                  {status.message}
                </p>

                {hasEmail ? (
                  <p className="text-white-50 text-sm">
                    Prefer email?{" "}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="underline underline-offset-4"
                    >
                      {contactEmail}
                    </a>
                  </p>
                ) : null}
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
