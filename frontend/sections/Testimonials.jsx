import TitleHeader from "../components/TitleHeader";
import GlowCard from "../components/GlowCard.jsx";
import CompanyLogo from "../components/CompanyLogo.jsx";
// Original markup and classes, unchanged. The only difference is that the
// entries arrive as a prop, read from the Google Sheet at build time, instead
// of being hardcoded. Renders nothing at all when none are approved yet — an
// empty heading looks worse than no section.
/**
 * @param {{ testimonials?: import("@/lib/testimonials").Testimonial[] }} props
 */
const Testimonials = ({ testimonials = [] }) => {
  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="What People Say About Me?"
          sub="⭐️ Client Feedback Highlights"
        />
        <div className="lg:columns-3 md:columns-2 columns-1 mt-16">
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
