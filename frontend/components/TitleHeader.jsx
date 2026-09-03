const TitleHeader = ({ title, sub, id }) => {
  return (
    <div className="flex flex-col items-center gap-5">
      {sub ? (
        <div className="hero-badge">
          <p>{sub}</p>
        </div>
      ) : null}
      <h2 id={id} className="font-semibold md:text-5xl text-3xl text-center">
        {title}
      </h2>
    </div>
  );
};

export default TitleHeader;
