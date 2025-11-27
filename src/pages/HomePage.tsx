import { useEffect } from "react";
import GetStartedCard from "../components/ui/GetStartedCard";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../sections/HeroSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import { useLogin } from "../contexts/LoginContext";
import UserDetailsCard from "../components/ui/UserDetailsCard";

const clarityCards = [
  {
    title: "What is ADeed?",
    body: "A secure government-backed workspace that turns paper land deeds into verified digital certificates with traceable history.",
  },
  {
    title: "Who uses it?",
    body: "Citizens, surveyors, legal officers, banks, and ministries collaborate in one interface to submit, review, and authorize property transactions.",
  },
  {
    title: "Why it matters",
    list: [
      "Removes guesswork on deed status and requirements",
      "Flags risky transfers before they are approved",
      "Keeps every supporting document organized and searchable",
    ],
  },
];

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

      <section className="bg-[#00420A] text-white">
        <div className="max-w-boundary mx-auto px-6 md:px-16 py-10 md:py-14 grid gap-6 md:grid-cols-3">
          {clarityCards.map((card) => (
            <div
              key={card.title}
              className="bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200 mb-3">
                {card.title}
              </p>
              {"body" in card && <p className="text-sm md:text-base opacity-95">{card.body}</p>}
              {"list" in card && (
                <ul className="space-y-2 text-sm md:text-base opacity-95">
                  {card.list.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-200" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {user &&  
      <div className="w-full pt-8 md:pt-12 px-6 md:px-16">
        <UserDetailsCard user={user}/>
      </div>
      }

      <section className="w-full bg-white max-w-boundary mx-auto py-8 md:py-12 px-6 md:px-16">
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