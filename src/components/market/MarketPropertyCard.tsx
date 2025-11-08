import React from "react";
import { FaFileSignature, FaCubes, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import type { IDeed } from "../../types/responseDeed";
import type { Title } from "../../types/title";

interface MarketPropertyCardProps {
  deed: IDeed;
  transaction: Title;
  isMine?: boolean;
  onBuy?: (transactionId: string, deedId: string) => void;
  onViewDetails?: (deedNumber: string) => void;
}

const MarketPropertyCard: React.FC<MarketPropertyCardProps> = ({
  deed,
  transaction,
  isMine = false,
  onBuy,
  onViewDetails,
}) => {
  const isNFT = transaction.share === 100;
  const isFT = transaction.share < 100;

  const getLandTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("paddy")) return "🌾";
    if (lowerType.includes("highland")) return "🌲";
    if (lowerType.includes("residential")) return "🏘️";
    return "🏞️";
  };

  const latestValue = deed.valuation && deed.valuation.length > 0
    ? deed.valuation.slice().sort((a, b) => b.timestamp - a.timestamp)[0]?.estimatedValue || 0
    : 0;

  return (
    <div className="bg-[#1C1B1F]/70 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col justify-between h-full transition-transform transform hover:-translate-y-2 hover:scale-105 hover:shadow-emerald-500/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isNFT ? (
            <FaFileSignature className="text-green-400 text-3xl" />
          ) : (
            <FaCubes className="text-purple-500 text-3xl" />
          )}
          <div>
            <h3 className="font-bold text-lg text-[#FEFBF6]">Deed #{deed.deedNumber}</h3>
            <p className="text-xs text-[#FEFBF6]/70">{deed.deedType.deedType}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isNFT
              ? "bg-gradient-to-r from-green-400 to-emerald-400 text-black"
              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          }`}
        >
          {isNFT ? "NFT" : "FT"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {isFT && (
          <p className="text-[#FEFBF6]/70 text-sm">
            Ownership Share: <span className="font-semibold text-[#A6D1E6]">{transaction.share}%</span>
          </p>
        )}
        
        <div className="flex items-center gap-2 text-[#FEFBF6]/70 text-sm">
          <span className="text-xl">{getLandTypeIcon(deed.landType)}</span>
          <span className="capitalize">{deed.landType}</span>
        </div>

        {deed.landAddress && (
          <div className="flex items-start gap-2 text-[#FEFBF6]/70 text-sm">
            <FaMapMarkerAlt className="text-[#7F5283] flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{deed.landAddress}</span>
          </div>
        )}

        {deed.landArea && (
          <p className="text-[#FEFBF6]/70 text-sm">
            Area: <span className="font-semibold">{deed.landArea} {deed.landSizeUnit || "Sqm"}</span>
          </p>
        )}

        {latestValue > 0 && (
          <div className="flex items-center gap-2 text-[#FEFBF6]/70 text-sm">
            <FaDollarSign className="text-green-400" />
            <span>Estimated Value: <span className="font-semibold text-green-400">${latestValue.toLocaleString()}</span></span>
          </div>
        )}

        {transaction.description && (
          <p className="text-[#FEFBF6]/60 text-xs mt-2 line-clamp-2 italic">
            "{transaction.description}"
          </p>
        )}
      </div>

      <div className="border-t border-white/10 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-[#FEFBF6]/70">Price</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              ${transaction.amount.toLocaleString()}
            </p>
          </div>
          {transaction.date && (
            <p className="text-xs text-[#FEFBF6]/50">
              Listed: {new Date(transaction.date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {onViewDetails && (
            <button
              className="flex-1 bg-white/10 text-[#FEFBF6] rounded-full py-2 font-semibold hover:bg-white/20 transition text-sm"
              onClick={() => onViewDetails(deed.deedNumber)}
            >
              View Details
            </button>
          )}
          {!isMine && onBuy && (
            <button
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2 font-semibold hover:brightness-110 transition"
              onClick={() => onBuy(transaction._id || "", deed._id)}
            >
              Buy Now
            </button>
          )}
          {isMine && (
            <button
              className="flex-1 bg-gradient-to-r from-green-400 to-emerald-400 text-black rounded-full py-2 font-semibold hover:brightness-110 transition"
              disabled
            >
              Your Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPropertyCard;

