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
    <section className="relative py-16 px-4 md:px-10 bg-gradient-to-b from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] opacity-30 pointer-events-none"></div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-green-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-300/40 rounded-full blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-3">
            {t("about.howItWorks.title")}
          </h2>
          <p className="text-gray-700 text-lg max-w-xl mx-auto">
            {t("about.howItWorks.subtitle")}
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-green-200 via-green-400 to-green-600"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative flex items-center mb-8 ${
                idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div
                className={`w-full md:w-5/12 ${
                  idx % 2 === 0 ? "md:text-right md:pr-8" : "md:pl-8"
                }`}
              >
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-green-100 shadow-sm hover:shadow-lg transition">
                  <div
                    className={`flex items-center gap-2 mb-3 ${
                      idx % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-base">
                      {idx + 1}
                    </div>
                    <step.icon className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 mb-3 leading-relaxed text-sm md:text-base">
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
                        className="bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium text-green-700 border border-green-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-green-600 rounded-full items-center justify-center z-10 shadow-md">
                <step.icon className="text-green-600 text-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
