import { useEffect } from "react";
import GetStartedCard from "../components/ui/GetStartedCard";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../sections/HeroSection";
import WhyChooseSection from "../sections/WhyChooseSection";

const HomePage = () => {
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);

    return () => clearTimeout(timer);
  },[]);

  return (
    <main className="">
      <HeroSection />

      <div className="w-full px-6 md:px-16 py-16 grid md:grid-cols-3 gap-8 max-w-boundary mx-auto">
        <div className="md:col-span-2">
          <WhyChooseSection />
        </div>

        <div className="flex md:justify-end">
          <GetStartedCard />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
