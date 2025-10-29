import React, { useState } from "react";
import NFTOwnership from "./NFTOwnership";
import FTOwnership from "./FTOwnership";

const OwnershipModels: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nft' | 'ft'>('nft');

  return (
    <section className="py-20 px-6 md:px-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">Ownership Models</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Choose between complete ownership or fractional investment</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('nft')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'nft'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-green-900 hover:bg-green-50'
            }`}
          >
            NFT Ownership
          </button>
          <button
            onClick={() => setActiveTab('ft')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'ft'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-green-900 hover:bg-green-50'
            }`}
          >
            Fractional Tokens
          </button>
        </div>

        {activeTab === 'nft' ? <NFTOwnership /> : <FTOwnership />}
      </div>
    </section>
  );
};

export default OwnershipModels;