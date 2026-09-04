"use client";

// Renders a real <button> so it is focusable and operable from the keyboard —
// the original was an <a> with no href, which is invisible to tab navigation.
const Button = ({ className, id, text }) => {
  const handleClick = () => {
    const target = document.getElementById(id || "counter");
    if (!target) return;
    const offset = window.innerHeight * 0.15;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className ?? ""} cta-wrapper`}
    >
      <div className="cta-button group">
        <div className="bg-circle" />
        <p className="text">{text}</p>
        {/* The scroll affordance lives inside the CTA rather than as a separate
            cue below the hero — one signal, in the place you already want to
            click, instead of two competing ones. */}
        <div className="arrow-wrapper">
          <svg
            className="cta-arrow"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 4.5v13" />
            <path d="M6.5 12l5.5 5.5 5.5-5.5" />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default Button;
