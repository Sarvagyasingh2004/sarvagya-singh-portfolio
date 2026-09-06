import TitleHeader from "../components/TitleHeader";
import GlowCard from "../components/GlowCard.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";

/** @param {{ testimonials?: import("@/lib/testimonials").Testimonial[] }} props */
const Testimonials = ({ testimonials = [] }) => {
  if (!testimonials.length) return null;

  // The column count follows the number of entries. A fixed three-column
  // masonry leaves a single testimonial stranded in the left third with two
  // empty columns beside it, which reads as something having failed to load —
  // and the first approved one is always on its own.
  const columns =
    testimonials.length >= 3
      ? "lg:columns-3 md:columns-2 columns-1"
      : testimonials.length === 2
        ? "md:columns-2 columns-1 max-w-4xl mx-auto"
        : "columns-1 max-w-2xl mx-auto";

  return (
    <section id="testimonials" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="What People Say About Me?"
          sub="⭐️ What People I Worked With Say"
        />
        <div className={`${columns} mt-16`}>
          {testimonials.map(({ name, mentions, imgPath, review }, index) => (
            <GlowCard index={index} card={{ review }} key={index} stars>
              <div className="flex items-center gap-3">
                <div className="testimonial-avatar">
                  <CompanyLogo src={imgPath} name={name} />
                </div>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-white-50">{mentions}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
