import React, { useEffect } from "react";
import TrustBadges from "../components/about/TrustBadges";
import HowItWorks from "../components/about/HowItWorks";
import OwnershipModels from "../components/about/OwnershipModels";
import TechnicalArchitecture from "../components/about/TechnicalArchitecture";
import CTASection from "../components/about/CTASection";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../components/about/HeroSection";

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
      <TrustBadges />
      <HowItWorks />
      <OwnershipModels />
      <TechnicalArchitecture />
      <CTASection />
    </div>
  );
};

export default AboutPage;