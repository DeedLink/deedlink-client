import { useEffect } from "react";
import GetStartedCard from "../components/ui/GetStartedCard";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../sections/HeroSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import { useLogin } from "../contexts/LoginContext";
import UserDetailsCard from "../components/ui/UserDetailsCard";
import { useFloatingNotify } from "../contexts/FloatingNotifyContext";

const HomePage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { user } = useLogin();
  const { showNotification } = useFloatingNotify();

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(()=>{
    showNotification({
      type: "success",
      title: "Success",
      message: "Operation completed"
    });
  },[]);

  return (
    <main className="bg-white text-gray-900">
      <HeroSection />

      {user &&  
      <div className="w-full pt-8 md:pt-12">
        <UserDetailsCard user={user}/>
      </div>
      }

      <section className="w-full bg-white max-w-boundary mx-auto py-8 md:py-12">
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