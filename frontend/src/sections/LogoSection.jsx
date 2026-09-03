import { techMarquee } from "../../constants/index.js";

const LogoIcon = ({ icon }) => {
  return (
    <div className="flex-none flex-center marquee-icon">
      <img src={icon.imgPath} alt={icon.name} />
    </div>
  );
};

const LogoSection = () => {
  return (
    <div className="md:my-20 my-10 relative">
      <div className="gradient-edge"></div>
      <div className="gradient-edge"></div>
      <div className="marquee h-52">
        <div className="marquee-box md:gap-12 gap-5">
          {techMarquee.map((icon, index) => (
            <LogoIcon key={index} icon={icon} />
          ))}
          {techMarquee.map((icon, index) => (
            <LogoIcon key={index} icon={icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoSection;
