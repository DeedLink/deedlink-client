import React from "react";
import { FaFileSignature } from "react-icons/fa";

const NFTSection: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-16 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <FaFileSignature className="text-green-600 text-2xl" />
          <h2 className="text-3xl font-bold text-green-900">NFT Deed Ownership</h2>
        </div>
        <p className="text-gray-700 text-base leading-relaxed mb-6">
          Each property deed is minted as a unique Non-Fungible Token (NFT) on the blockchain, representing complete and indivisible ownership. These immutable digital certificates provide cryptographic proof of ownership, eliminate fraud, and enable seamless peer-to-peer transfers without intermediaries.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {["Land Deed", "Commercial Property", "Residential Unit"].map((name, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-5 border border-green-100 hover:border-green-300 transition">
              <div className="h-36 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mb-3 flex items-center justify-center">
                <FaFileSignature className="text-green-600 text-4xl" />
              </div>
              <h3 className="font-semibold text-base text-green-900">{name}</h3>
              <p className="text-gray-600 text-xs mt-1">Unique NFT with complete ownership rights and blockchain verification.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NFTSection;
