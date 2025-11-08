import React from "react";
import {
  FaFileSignature,
  FaCubes,
  FaMapMarkerAlt,
  FaRegClock,
  FaExpand,
  FaTag,
} from "react-icons/fa";
import { formatCurrency, formatNumber, timeAgo, shortAddress } from "../../utils/format";
import ShareBadge from "../deeds/ShareBadge";
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
    <div className="group rounded-2xl shadow-lg border border-indigo-200/50 hover:shadow-2xl hover:border-indigo-300 transition-all overflow-hidden flex flex-col justify-between bg-white/90 backdrop-blur-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isNFT ? (
                <FaFileSignature className="text-indigo-600 flex-shrink-0" />
              ) : (
                <FaCubes className="text-purple-600 flex-shrink-0" />
              )}
              <h3 className="font-semibold text-indigo-700 truncate">
                Deed #{deed.deedNumber}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  isNFT
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-purple-100 text-purple-700 border border-purple-200"
                }`}
              >
                {isNFT ? "NFT" : "FT"}
              </span>
            </div>
            <p className="text-xs text-indigo-500 mt-0.5 truncate">
              {deed.deedType.deedType}
            </p>
          </div>

          <button
            onClick={() => onViewDetails?.(deed.deedNumber)}
            className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-lg border border-indigo-600 text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer flex-shrink-0"
            title="Open details"
          >
            <FaExpand /> View
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-black">
          <div>
            <div className="text-xs text-indigo-500">Sale Price</div>
            <div className="font-semibold text-indigo-700">
              {formatCurrency(transaction.amount, "USD")}
            </div>
          </div>

          <div>
            <div className="text-xs text-indigo-500">Estimated Value</div>
            <div className="font-semibold text-indigo-600">
              {latestValue > 0 ? formatCurrency(latestValue, "USD") : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-xs text-indigo-500">Area</div>
            <div className="font-semibold text-indigo-700">
              {formatNumber(deed.landArea)} {deed.landSizeUnit || "Sqm"}
            </div>
          </div>

          <div>
            <div className="text-xs text-indigo-500">Land Type</div>
            <div className="font-semibold capitalize flex items-center gap-1 text-indigo-700">
              <span>{getLandTypeIcon(deed.landType)}</span>
              <span className="truncate">{deed.landType ?? "Unknown"}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-indigo-500">Location</div>
            <div className="font-semibold text-sm truncate text-indigo-700">
              {deed.district}, {deed.division}
            </div>
          </div>

          {transaction.date && (
            <div>
              <div className="text-xs text-indigo-500">Listed</div>
              <div className="font-semibold text-sm flex items-center gap-1 text-indigo-600">
                <FaRegClock className="text-indigo-400" size={10} />
                {timeAgo(new Date(transaction.date).getTime())}
              </div>
            </div>
          )}

          {deed.landAddress && (
            <div className="col-span-2">
              <div className="text-xs text-indigo-500">Address</div>
              <div className="font-semibold text-sm truncate flex items-center gap-1 text-indigo-700">
                <FaMapMarkerAlt className="text-indigo-400 flex-shrink-0" size={10} />
                {deed.landAddress}
              </div>
            </div>
          )}

          {isFT && (
            <div className="col-span-2">
              <div className="text-xs text-indigo-500 mb-1">Ownership Share</div>
              <ShareBadge share={transaction.share} />
            </div>
          )}

          {transaction.description && (
            <div className="col-span-2">
              <div className="text-xs text-indigo-500">Description</div>
              <p className="text-sm text-indigo-600 line-clamp-2 mt-0.5">
                {transaction.description}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-indigo-100">
          <div className="flex items-center gap-2">
            <FaTag className="text-indigo-400" size={12} />
            <span className="text-xs text-indigo-500">Seller</span>
          </div>
          <span className="text-xs font-medium text-indigo-700" title={transaction.from}>
            {shortAddress(transaction.from)}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5">
        {!isMine && onBuy ? (
          <button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg py-2.5 font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md shadow-indigo-200 hover:shadow-lg"
            onClick={() => onBuy(transaction._id || "", deed._id)}
          >
            Buy Now
          </button>
        ) : isMine ? (
          <button
            className="w-full bg-indigo-100 text-indigo-600 rounded-lg py-2.5 font-semibold cursor-not-allowed border border-indigo-200"
            disabled
          >
            Your Listing
          </button>
        ) : null}
      </div>

      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
    </div>
  );
};

export default MarketPropertyCard;

