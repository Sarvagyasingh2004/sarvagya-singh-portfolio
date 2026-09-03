import { useEffect, useRef, useState } from "react";
import { techMarquee } from "../../constants/index.js";

const Chip = ({ item }) => (
  <div className="tech-chip">
    <img src={item.imgPath} alt="" loading="lazy" width="34" height="34" />
    <span>{item.name}</span>
  </div>
);

const LogoSection = () => {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);

  // The marquee halts and the marks lift once the strip reaches the middle of
  // the viewport, so they're readable exactly when you're looking at them.
  // It resumes scrolling as you move past.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFocused(entry.isIntersecting),
      { rootMargin: "-38% 0px -38% 0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`tech-marquee-wrap ${focused ? "is-focused" : ""}`}
      aria-label="Technologies I work with"
    >
      <div className="tech-track">
        {techMarquee.map((item) => (
          <Chip key={item.name} item={item} />
        ))}
        {/* Duplicate for a seamless -50% loop; hidden from screen readers so
            each technology is announced only once. */}
        {techMarquee.map((item) => (
          <Chip key={`dup-${item.name}`} item={item} />
        ))}
      </div>
    </section>
  );
};

export default LogoSection;
