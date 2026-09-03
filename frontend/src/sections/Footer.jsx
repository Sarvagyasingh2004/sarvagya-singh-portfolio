import { socialImgs, contactEmail } from "../../constants/index.js";

const Footer = () => {
  // A placeholder URL renders nothing rather than a link to nowhere.
  const socials = socialImgs.filter((s) => s.url && s.url !== "REPLACE_ME");
  const hasEmail = contactEmail && contactEmail !== "REPLACE_ME";

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="flex flex-col md:items-start justify-center items-center">
          {hasEmail ? (
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          ) : null}
        </div>

        {socials.length ? (
          <div className="socials">
            {socials.map(({ name, url, imgPath }) => (
              <a
                key={name}
                className="icon"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
              >
                <img src={imgPath} alt="" />
              </a>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col justify-center">
          <p className="text-center md:text-end">
            &copy; {new Date().getFullYear()} Sarvagya Singh
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
