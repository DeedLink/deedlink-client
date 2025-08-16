import React from "react";
import { FaFileSignature, FaCubes } from "react-icons/fa";

interface TokenCardProps {
  deedNumber: string;
  type: "NFT" | "FT";
  owner: string;
  share?: number;
  price: number;
  isMine?: boolean;
  onBuy?: () => void;
  onSell?: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ deedNumber, type, owner, share, price, isMine, onBuy, onSell }) => {
  return (
    <div className="bg-[#1C1B1F]/70 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col justify-between h-full transition-transform transform hover:-translate-y-2 hover:scale-105 hover:shadow-emerald-500/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {type === "NFT" ? (
            <FaFileSignature className="text-green-400 text-3xl" />
          ) : (
            <FaCubes className="text-purple-500 text-3xl" />
          )}
          <h3 className="font-bold text-lg text-[#FEFBF6]">{deedNumber}</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            type === "NFT"
              ? "bg-gradient-to-r from-green-400 to-emerald-400 text-black"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          }`}
        >
          {type}
        </span>
      </div>

      {type === "FT" && <p className="text-[#FEFBF6]/70 mb-2">Ownership: {share}%</p>}
      <p className="text-[#FEFBF6]/70 mb-2">Owner: {owner}</p>
      <p className="text-2xl font-bold text-gradient mb-4">${price.toLocaleString()}</p>

      {isMine ? (
        <button
          className="bg-gradient-to-r from-green-400 to-emerald-400 text-black rounded-full py-2 font-semibold hover:brightness-110 transition"
          onClick={onSell}
        >
          Sell
        </button>
      ) : (
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2 font-semibold hover:brightness-110 transition"
          onClick={onBuy}
        >
          Buy
        </button>
      )}
    </div>
  );
};

export default TokenCard;
