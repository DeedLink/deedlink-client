import React from "react";
import { FaCubes } from "react-icons/fa";

const FTSection: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-16 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <FaCubes className="text-green-600 text-2xl" />
          <h2 className="text-3xl font-bold text-green-900">Fractional Token Investment</h2>
        </div>
        <p className="text-gray-700 text-base leading-relaxed mb-6">
          Fractional Tokens (FTs) enable property ownership to be divided into multiple shares, democratizing real estate investment. Each token represents a percentage stake, allowing smaller capital investments, improved market liquidity, and collaborative ownership structures backed by smart contracts.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {["25% Share", "40% Share", "10% Share"].map((fraction, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-5 border border-green-100 hover:border-green-300 transition">
              <div className="h-36 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg mb-3 flex items-center justify-center">
                <FaCubes className="text-green-600 text-4xl" />
              </div>
              <h3 className="font-semibold text-base text-green-900">{fraction}</h3>
              <p className="text-gray-600 text-xs mt-1">Tradeable fractional ownership enabling flexible investment strategies.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FTSection;