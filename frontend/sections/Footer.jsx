import { socialImgs, contactEmail } from "@/constants";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="flex flex-col md:items-start justify-center items-center">
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </div>
        <div className="socials">
          {socialImgs
            .filter((img) => img.url && img.url !== "REPLACE_ME")
            .map((img) => (
            <a
              key={img.name}
              className="icon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={img.name}
              href={img.url}
            >
              <img src={img.imgPath} alt="" />
            </a>
          ))}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-center md:text-end">
            © {new Date().getFullYear()} Sarvagya Singh. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
