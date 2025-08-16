import React from "react";
import HeroSection from "../sections/HeroSection";
import HowItWorks from "../components/about/HowItWorks";
import NFTSection from "../components/about/NFTSection";
import FTSection from "../components/about/FTSection";

const AboutPage: React.FC = () => {
  return (
    <div className="text-gray-800 max-w-boundary mx-auto">
      <HeroSection />
      <HowItWorks />
      <NFTSection />
      <FTSection />
    </div>
  );
};

export default AboutPage;
