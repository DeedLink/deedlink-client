import React from "react";
import { FaFileSignature } from "react-icons/fa";

const NFTSection: React.FC = () => {
  return (
    <section className="py-24 px-6 md:px-16 bg-gradient-to-tr from-green-50 to-emerald-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-4">
          <FaFileSignature className="text-green-700 text-3xl" />
          <h2 className="text-4xl font-bold text-[#00420A]">NFTs for Deeds</h2>
        </div>
        <p className="text-gray-700 text-lg leading-relaxed">
          Each property deed is represented as a unique NFT, guaranteeing full ownership. These NFTs are immutable and stored on the blockchain. Owners can sell, transfer, or display them in wallets, creating a seamless bridge between real-world property and digital ownership.
        </p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center hover:scale-105 transition transform">
              <div className="h-40 w-32 bg-green-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                NFT Preview
              </div>
              <h3 className="font-semibold text-lg">Deed #{n}</h3>
              <p className="text-gray-600 text-sm text-center mt-2">Unique NFT representing full ownership of this property deed.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NFTSection;
