// Scrolls to the element named by `targetId`. Renders a real <button> so it is
// focusable and operable from the keyboard.
const Button = ({ className, targetId, text }) => {
  const handleClick = () => {
    const target = document.getElementById(targetId);
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
        <div className="arrow-wrapper">
          <img src="/images/arrow-down.svg" alt="" />
        </div>
      </div>
    </button>
  );
};

export default Button;
