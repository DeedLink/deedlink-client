import React, { useEffect } from "react";
import HeroSection from "../sections/HeroSection";
import HowItWorks from "../components/about/HowItWorks";
import NFTSection from "../components/about/NFTSection";
import FTSection from "../components/about/FTSection";
import { useLoader } from "../contexts/LoaderContext";

const AboutPage: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-gray-800">
      <HeroSection />
      <HowItWorks />
      <NFTSection />
      <FTSection />
    </div>
  );
};

export default AboutPage;