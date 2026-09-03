import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import ShowcaseSection from "@/sections/ShowcaseSection";
import LogoSection from "@/sections/LogoSection";
import FeatureCards from "@/sections/FeatureCards";
import ExperienceSection from "@/sections/ExperienceSection";
import TechStack from "@/sections/TechStack";
import Contact from "@/sections/Contact";
import Testimonials from "@/sections/Testimonials";
import Footer from "@/sections/Footer";
import { getTestimonials } from "@/lib/testimonials";

// Section order matches the original App.jsx.
// Server component: the sheet is read here at build time and the rows are
// baked into the HTML, so they are crawlable rather than client-fetched.
export default async function Home() {
  const testimonials = await getTestimonials();

  return (
    <>
      <Navbar />
      <Hero />
      <ShowcaseSection />
      <LogoSection />
      <FeatureCards />
      <ExperienceSection />
      <TechStack />
      <Testimonials testimonials={testimonials} />
      <Contact />
      <Footer />
    </>
  );
}
