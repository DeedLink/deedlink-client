import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const TrustBadges: React.FC = () => {
  const { t } = useLanguage();
  const badges = [
    t("about.trustBadges.blockchainSecured"),
    t("about.trustBadges.smartContractAudited"),
    t("about.trustBadges.support247")
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-y border-green-200/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {badges.map((badge, idx) => (
            <div 
              key={idx} 
              className="group flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-green-200 hover:border-green-400 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaCheckCircle className="text-green-600 text-lg group-hover:text-green-700 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold text-green-800 group-hover:text-green-900">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;