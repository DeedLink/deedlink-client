import React, { useMemo } from "react";
import {
  FaFileSignature,
  FaCubes,
  FaChartPie,
  FaShieldAlt,
  FaUserCheck,
  FaExchangeAlt,
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();
  
  const steps = useMemo(() => [
    {
      icon: FaUserCheck,
      title: t("about.howItWorks.step1Title"),
      description: t("about.howItWorks.step1Desc"),
      features: [
        t("about.howItWorks.step1Feature1"),
        t("about.howItWorks.step1Feature2"),
        t("about.howItWorks.step1Feature3"),
      ],
    },
    {
      icon: FaFileSignature,
      title: t("about.howItWorks.step2Title"),
      description: t("about.howItWorks.step2Desc"),
      features: [
        t("about.howItWorks.step2Feature1"),
        t("about.howItWorks.step2Feature2"),
        t("about.howItWorks.step2Feature3"),
      ],
    },
    {
      icon: FaCubes,
      title: t("about.howItWorks.step3Title"),
      description: t("about.howItWorks.step3Desc"),
      features: [
        t("about.howItWorks.step3Feature1"),
        t("about.howItWorks.step3Feature2"),
        t("about.howItWorks.step3Feature3"),
      ],
    },
    {
      icon: FaShieldAlt,
      title: t("about.howItWorks.step4Title"),
      description: t("about.howItWorks.step4Desc"),
      features: [
        t("about.howItWorks.step4Feature1"),
        t("about.howItWorks.step4Feature2"),
        t("about.howItWorks.step4Feature3"),
      ],
    },
    {
      icon: FaExchangeAlt,
      title: t("about.howItWorks.step5Title"),
      description: t("about.howItWorks.step5Desc"),
      features: [
        t("about.howItWorks.step5Feature1"),
        t("about.howItWorks.step5Feature2"),
        t("about.howItWorks.step5Feature3"),
      ],
    },
    {
      icon: FaChartPie,
      title: t("about.howItWorks.step6Title"),
      description: t("about.howItWorks.step6Desc"),
      features: [
        t("about.howItWorks.step6Feature1"),
        t("about.howItWorks.step6Feature2"),
        t("about.howItWorks.step6Feature3"),
      ],
    },
  ], [t]);
  return (
    <section className="relative py-20 md:py-28 px-4 md:px-10 bg-gradient-to-b from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] opacity-20 pointer-events-none"></div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-300/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-900 mb-4 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
            {t("about.howItWorks.title")}
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("about.howItWorks.subtitle")}
          </p>
        </div>

        <div className="relative">
          {/* Enhanced Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-200 via-green-400 to-green-600 shadow-lg"></div>
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-green-300 via-green-500 to-green-700"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative flex items-center mb-12 md:mb-16 ${
                idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div
                className={`w-full md:w-5/12 ${
                  idx % 2 === 0 ? "md:text-right md:pr-10" : "md:pl-10"
                }`}
              >
                <div className="group bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border-2 border-green-100 shadow-lg hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:scale-105">
                  <div
                    className={`flex items-center gap-3 mb-4 ${
                      idx % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                      <step.icon className="text-green-600 text-2xl md:text-3xl" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-green-900 mb-3 group-hover:text-green-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                  <div
                    className={`flex flex-wrap gap-2 ${
                      idx % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    {step.features.map((feature, fidx) => (
                      <span
                        key={fidx}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-full text-xs font-semibold text-green-700 border border-green-200 hover:border-green-400 hover:bg-green-100 transition-all"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white border-4 border-green-600 rounded-full items-center justify-center z-10 shadow-xl hover:scale-110 transition-transform duration-300">
                <div className="p-2 bg-green-50 rounded-full">
                  <step.icon className="text-green-600 text-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
