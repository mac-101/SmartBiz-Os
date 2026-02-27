import Navbar from "../landingPage/Navbar";
import HeroSection from "../landingPage/HeroSection";
import TrustedBrands from "../landingPage/TrustedBrands";
import FeaturesGrid from "../landingPage/FeaturesGrid";
import { PricingSection } from "../landingPage/PricingSection";
import {Testimonials} from "../landingPage/Testimonials";
import Footer from "../landingPage/Footer";
import {FAQ} from "../landingPage/Faq";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TrustedBrands />
      <FeaturesGrid />
      <PricingSection />
      <Testimonials />
      <FAQ />
      <Footer />
    </>
  );
}