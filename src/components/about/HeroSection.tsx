import React, { useState, useEffect } from "react";
import { FaArrowRight, FaPlay, FaBuilding, FaUsers, FaExchangeAlt, FaChartLine } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import { about } from "../../constants/const";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ properties: 0, users: 0, transactions: 0, value: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(about.stats);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 py-24 md:py-32 px-6 md:px-16 overflow-hidden">
      {/* Simple Background Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/15 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-800/60 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-green-500/40 shadow-lg hover:bg-green-800/70 transition-all duration-300">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-green-100 text-sm font-semibold tracking-wide">{t("about.hero.badge")}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t("about.hero.title")}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-green-400">
              {t("about.hero.titleHighlight")}
            </span>
          </h1>

          <p className="text-green-50 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            {t("about.hero.description")}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <button className="group bg-white text-green-900 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-green-500/50 hover:scale-105 transform">
              {t("about.hero.getStarted")} 
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group bg-green-800/60 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-800/80 transition-all duration-300 flex items-center gap-2 border-2 border-green-500/50 shadow-xl hover:shadow-green-500/30 hover:scale-105 transform">
              <FaPlay className="text-sm group-hover:scale-110 transition-transform" /> 
              {t("about.hero.watchDemo")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16">
          {[
            { label: t("about.hero.propertiesRegistered"), value: stats.properties, suffix: '+', icon: FaBuilding },
            { label: t("about.hero.activeUsers"), value: stats.users, suffix: '+', icon: FaUsers },
            { label: t("about.hero.totalTransactions"), value: stats.transactions, suffix: '+', icon: FaExchangeAlt },
            { label: t("about.hero.totalValue"), value: stats.value, suffix: 'M+', icon: FaChartLine }
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="group bg-green-800/40 backdrop-blur-md border border-green-600/40 rounded-2xl p-6 text-center hover:bg-green-800/60 hover:border-green-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 transform"
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="text-green-300 text-3xl md:text-4xl mx-auto drop-shadow-lg" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-green-200 text-xs md:text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;