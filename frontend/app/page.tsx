import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import ShowcaseSection from "@/sections/ShowcaseSection";
import LogoSection from "@/sections/LogoSection";
import FeatureCards from "@/sections/FeatureCards";
import ExperienceSection from "@/sections/ExperienceSection";
import TechStack from "@/sections/TechStack";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <ShowcaseSection />
        <LogoSection />
        <FeatureCards />
        <ExperienceSection />
        <TechStack />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
