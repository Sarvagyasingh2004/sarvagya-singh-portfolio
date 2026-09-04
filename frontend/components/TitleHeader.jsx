/**
 * Section header.
 *
 * The title renders as a real <h2>. It was a plain <div>, which meant every
 * section on the page except Work had no heading at all — the document
 * outline jumped straight from the hero's h1 to the h3s inside cards. Bad for
 * screen-reader navigation and for how search engines read the page.
 */
const TitleHeader = ({ title, sub, id }) => {
  return (
    <div className="flex flex-col items-center gap-5">
      {sub ? (
        <div className="hero-badge">
          <p>{sub}</p>
        </div>
      ) : null}
      <h2
        id={id}
        className="section-title font-semibold md:text-5xl text-3xl text-center"
      >
        {title}
      </h2>
    </div>
  );
};

export default TitleHeader;
