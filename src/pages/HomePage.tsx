import { useEffect } from "react";
import GetStartedCard from "../components/ui/GetStartedCard";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../sections/HeroSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import { useLogin } from "../contexts/LoginContext";
import UserDetailsCard from "../components/ui/UserDetailsCard";

const HomePage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { user } = useLogin();

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-white text-gray-900">
      <HeroSection />

      {user &&  <UserDetailsCard user={user}/> }

      <section className="w-full bg-white max-w-boundary mx-auto">
        { false && (
          <div className="max-w-boundary mx-auto grid md:grid-cols-3 gap-10 items-start">
            <div className="md:col-span-2">
              <WhyChooseSection />
            </div>
            <div className="flex md:justify-end">
              <GetStartedCard />
            </div>
          </div>
        )}
        { true && (
            <div className="max-w-boundary mx-auto gap-10 items-start">
              <div className="w-full">
                <WhyChooseSection />
              </div>
            </div>
          )}
      </section>
    </main>
  );
};

export default HomePage;