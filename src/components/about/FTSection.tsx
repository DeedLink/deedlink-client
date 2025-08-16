import React from "react";
import { FaCubes } from "react-icons/fa";

const FTSection: React.FC = () => {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-4">
          <FaCubes className="text-green-700 text-3xl" />
          <h2 className="text-4xl font-bold text-[#00420A]">Fractional Ownership (FT)</h2>
        </div>
        <p className="text-gray-700 text-lg leading-relaxed">
          Fractional tokens (FTs) allow multiple investors to hold shares of a single property. Each token represents a percentage of ownership, enabling smaller investments and improving liquidity. FTs can be traded, sold, or pooled to create collaborative ownership opportunities.
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center hover:scale-105 transition transform">
              <div className="h-40 w-32 bg-green-50 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                FT Preview
              </div>
              <h3 className="font-semibold text-lg">Fraction #{n}</h3>
              <p className="text-gray-600 text-sm text-center mt-2">Represents a fraction of property ownership for decentralized investment.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FTSection;
