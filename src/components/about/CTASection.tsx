import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const CTASection: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 md:py-32 px-6 md:px-16 bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 leading-tight">
          {t("about.cta.title")}
        </h2>
        <p className="text-green-50 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          {t("about.cta.description")}
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          <button className="group bg-white text-green-900 px-10 py-5 rounded-xl font-bold hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-105 transform text-lg">
            {t("about.cta.registerProperty")}
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button className="group bg-green-700/90 backdrop-blur-sm text-white px-10 py-5 rounded-xl font-bold hover:bg-green-600 transition-all duration-300 border-2 border-green-500/50 shadow-2xl hover:shadow-green-500/30 hover:scale-105 transform text-lg">
            {t("about.cta.exploreMarketplace")}
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;