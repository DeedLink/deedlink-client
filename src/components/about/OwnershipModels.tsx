import React, { useState } from "react";
import NFTOwnership from "./NFTOwnership";
import FTOwnership from "./FTOwnership";
import { useLanguage } from "../../contexts/LanguageContext";

const OwnershipModels: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'nft' | 'ft'>('nft');

  return (
    <section className="py-24 px-6 md:px-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-900 mb-6 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
            {t("about.ownershipModels.title")}
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t("about.ownershipModels.subtitle")}
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('nft')}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'nft'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/50'
                : 'bg-white text-green-900 hover:bg-green-50 border-2 border-green-200 shadow-lg'
            }`}
          >
            {t("about.ownershipModels.nftOwnership")}
          </button>
          <button
            onClick={() => setActiveTab('ft')}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'ft'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/50'
                : 'bg-white text-green-900 hover:bg-green-50 border-2 border-green-200 shadow-lg'
            }`}
          >
            {t("about.ownershipModels.fractionalTokens")}
          </button>
        </div>

        <div className="transform transition-all duration-500">
          {activeTab === 'nft' ? <NFTOwnership /> : <FTOwnership />}
        </div>
      </div>
    </section>
  );
};

export default OwnershipModels;