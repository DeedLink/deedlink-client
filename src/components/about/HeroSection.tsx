import React, { useState, useEffect } from "react";
import { FaArrowRight, FaPlay, FaBuilding, FaUsers, FaExchangeAlt, FaChartLine } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ properties: 0, users: 0, transactions: 0, value: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ properties: 1247, users: 3856, transactions: 2193, value: 450 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 py-24 px-6 md:px-16 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-green-400 rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">

          <div className="inline-flex items-center gap-2 bg-green-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-green-600/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-200 text-sm font-medium">{t("about.hero.badge")}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t("about.hero.title")}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
              {t("about.hero.titleHighlight")}
            </span>
          </h1>

          <p className="text-green-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            {t("about.hero.description")}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-green-900 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition flex items-center gap-2 shadow-lg">
              {t("about.hero.getStarted")} <FaArrowRight />
            </button>
            <button className="bg-green-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800/70 transition flex items-center gap-2 border border-green-600/30">
              <FaPlay className="text-sm" /> {t("about.hero.watchDemo")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { label: t("about.hero.propertiesRegistered"), value: stats.properties, suffix: '+', icon: FaBuilding },
            { label: t("about.hero.activeUsers"), value: stats.users, suffix: '+', icon: FaUsers },
            { label: t("about.hero.totalTransactions"), value: stats.transactions, suffix: '+', icon: FaExchangeAlt },
            { label: t("about.hero.totalValue"), value: stats.value, suffix: 'M+', icon: FaChartLine }
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-green-800/30 backdrop-blur-sm border border-green-600/30 rounded-xl p-6 text-center hover:bg-green-800/40 transition"
            >
              <stat.icon className="text-green-300 text-3xl mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-green-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;