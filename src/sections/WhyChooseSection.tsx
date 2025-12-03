import { FaCheckCircle } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useMemo } from "react";

const WhyChooseSection = () => {
  const { t } = useLanguage();

  const features = useMemo(() => [
    {
      title: t("whyChoose.feature1Title"),
      desc: t("whyChoose.feature1Desc"),
    },
    {
      title: t("whyChoose.feature2Title"),
      desc: t("whyChoose.feature2Desc"),
    },
    {
      title: t("whyChoose.feature3Title"),
      desc: t("whyChoose.feature3Desc"),
    },
    {
      title: t("whyChoose.feature4Title"),
      desc: t("whyChoose.feature4Desc"),
    },
    {
      title: t("whyChoose.feature5Title"),
      desc: t("whyChoose.feature5Desc"),
    },
    {
      title: t("whyChoose.feature6Title"),
      desc: t("whyChoose.feature6Desc"),
    },
  ], [t]);

  return (
    <section className="w-full text-gray-900 px-4 md:px-10">
      <div className="mb-4">
        <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
          {t("whyChoose.label")}
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        {t("whyChoose.title")}
      </h2>
      <p className="text-white mb-12 text-lg">
        {t("whyChoose.description")}
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-500 transition-colors">
                <FaCheckCircle className="text-emerald-600 group-hover:text-white text-xl transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSection;