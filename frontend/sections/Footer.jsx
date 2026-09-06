import { socialImgs } from "@/constants";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-line">
          <p>Open to full-time backend and full-stack roles.</p>
        </div>

        <div className="socials">
          {socialImgs
            .filter((img) => img.url && img.url !== "REPLACE_ME")
            .map((img) => {
              const internal = img.url.startsWith("#");
              return (
                <a
                  key={img.name}
                  className="social-link"
                  href={img.url}
                  {...(internal
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <span className="icon">
                    <img src={img.imgPath} alt="" />
                  </span>
                  <span className="social-label">{img.name}</span>
                </a>
              );
            })}
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
