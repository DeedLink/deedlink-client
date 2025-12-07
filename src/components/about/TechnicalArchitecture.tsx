import React, { useMemo } from "react";
import { FaLock, FaShieldAlt, FaGlobe } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const TechnicalArchitecture: React.FC = () => {
  const { t } = useLanguage();
  
  const layers = useMemo(() => [
    {
      title: t("about.technicalArchitecture.layer1Title"),
      icon: FaLock,
      color: 'from-green-500 to-emerald-600',
      features: [
        t("about.technicalArchitecture.layer1Feature1"),
        t("about.technicalArchitecture.layer1Feature2"),
        t("about.technicalArchitecture.layer1Feature3"),
        t("about.technicalArchitecture.layer1Feature4")
      ]
    },
    {
      title: t("about.technicalArchitecture.layer2Title"),
      icon: FaShieldAlt,
      color: 'from-emerald-500 to-green-600',
      features: [
        t("about.technicalArchitecture.layer2Feature1"),
        t("about.technicalArchitecture.layer2Feature2"),
        t("about.technicalArchitecture.layer2Feature3"),
        t("about.technicalArchitecture.layer2Feature4")
      ]
    },
    {
      title: t("about.technicalArchitecture.layer3Title"),
      icon: FaGlobe,
      color: 'from-green-600 to-emerald-700',
      features: [
        t("about.technicalArchitecture.layer3Feature1"),
        t("about.technicalArchitecture.layer3Feature2"),
        t("about.technicalArchitecture.layer3Feature3"),
        t("about.technicalArchitecture.layer3Feature4")
      ]
    }
  ], [t]);

  return (
    <section className="py-24 px-6 md:px-16 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-900 mb-6 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
            {t("about.technicalArchitecture.title")}
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t("about.technicalArchitecture.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {layers.map((layer, idx) => (
            <div 
              key={idx} 
              className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-green-100 hover:border-green-400 transition-all duration-300 shadow-xl hover:shadow-2xl p-8 md:p-10 transform hover:-translate-y-2"
            >
              <div className={`bg-gradient-to-br ${layer.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <layer.icon className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-green-900 mb-6 group-hover:text-green-700 transition-colors">
                {layer.title}
              </h3>
              <ul className="space-y-4">
                {layer.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                    <div className="w-2 h-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mt-2 flex-shrink-0 shadow-md"></div>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnicalArchitecture;