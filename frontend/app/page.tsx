import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import ShowcaseSection from "@/sections/ShowcaseSection";
import LogoSection from "@/sections/LogoSection";
import FeatureCards from "@/sections/FeatureCards";
import ExperienceSection from "@/sections/ExperienceSection";
import TechStack from "@/sections/TechStack";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";

// Section order is unchanged from the original App.jsx. Testimonials is the
// one omission: its six entries were the template's fabricated client quotes.
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ShowcaseSection />
      <LogoSection />
      <FeatureCards />
      <ExperienceSection />
      <TechStack />
      <Contact />
      <Footer />
    </>
  );
}
