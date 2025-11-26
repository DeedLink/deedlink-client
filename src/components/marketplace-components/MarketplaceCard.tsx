import React, { useState, useEffect } from "react";
import type { Marketplace } from "../../types/marketplace";
import { FaMapMarkerAlt, FaClock, FaEthereum, FaCoins, FaTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getDeedById } from "../../api/api";
import type { IDeed } from "../../types/responseDeed";
import { useToast } from "../../contexts/ToastContext";
import BuyMarketplacePopup from "./BuyMarketplacePopup";

interface MarketplaceCardProps {
  marketplace: Marketplace;
  onUpdate: () => void;
  isOwnListing?: boolean;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ 
  marketplace, 
  onUpdate,
  isOwnListing = false
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deed, setDeed] = useState<IDeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuyPopup, setShowBuyPopup] = useState(false);

  useEffect(() => {
    const fetchDeed = async () => {
      try {
        if (marketplace.deedId) {
          const deedData = await getDeedById(marketplace.deedId);
          setDeed(deedData);
        }
      } catch (error) {
        console.error("Failed to fetch deed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeed();
  }, [marketplace.deedId]);

  const handleViewDeed = () => {
    if (deed?.deedNumber) {
      navigate(`/deed/${deed.deedNumber}`);
    }
  };

  const handleBuy = () => {
    if (marketplace.status === "sale_completed") {
      showToast("This listing has already been sold", "error");
      return;
    }
    if (isOwnListing) {
      showToast("You cannot buy your own listing", "info");
      return;
    }
    setShowBuyPopup(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!deed) {
    return null;
  }

  const isAvailable = marketplace.status === "open_to_sale";
  const listingType = marketplace.listingTypeOnChain || (marketplace.share === 100 ? "NFT" : "FRACTIONAL");
  const isFractional = listingType === "FRACTIONAL";
  
  const pricePerToken = isFractional && marketplace.share && marketplace.amount
    ? (marketplace.amount / (marketplace.share / 100)).toFixed(6)
    : null;

  return (
    <>
      <div className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
        isOwnListing 
          ? 'border-blue-400 shadow-md' 
          : isAvailable 
            ? 'border-green-300 shadow-sm' 
            : 'border-gray-300 opacity-75'
      }`}>
        <div className={`p-5 rounded-t-xl ${
          isOwnListing 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
            : isAvailable 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Deed #{deed.deedNumber}</h3>
              <p className="text-white/90 text-sm">{deed.deedType.deedType}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                isOwnListing 
                  ? 'bg-white text-blue-700'
                  : isAvailable 
                    ? 'bg-white text-green-700' 
                    : 'bg-gray-700 text-white'
              }`}>
                {isOwnListing ? 'Your Listing' : isAvailable ? 'Available' : 'Sold'}
              </span>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${
                listingType === "NFT"
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-indigo-100 text-indigo-700 border-indigo-300'
              }`}>
                {listingType}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <FaMapMarkerAlt className="text-gray-400" size={14} />
            <span className="text-sm font-medium">{deed.district}, {deed.division}</span>
          </div>

          {isFractional ? (
            <div className="space-y-3 mb-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <FaCoins className="text-indigo-600" size={16} />
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Fractional Token Listing</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <div className="text-xs text-indigo-600 mb-1 font-medium">Share</div>
                    <div className="text-lg font-bold text-gray-900">{marketplace.share.toFixed(4)}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <div className="text-xs text-indigo-600 mb-1 font-medium">Price/Token</div>
                    <div className="text-lg font-bold text-gray-900 flex items-center gap-1">
                      <FaEthereum size={14} className="text-indigo-600" />
                      {pricePerToken || marketplace.amount} ETH
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-600 font-medium">Total Value</span>
                    <span className="text-base font-bold text-gray-900 flex items-center gap-1">
                      <FaEthereum size={14} className="text-indigo-600" />
                      {marketplace.amount} ETH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="text-xs text-purple-600 mb-1 font-medium">Share</div>
                <div className="text-2xl font-bold text-gray-900">{marketplace.share}%</div>
                <div className="text-xs text-purple-600 mt-1">Full Property</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="text-xs text-purple-600 mb-1 font-medium">Price</div>
                <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  <FaEthereum size={18} className="text-purple-600" />
                  {marketplace.amount} ETH
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
            <FaClock size={12} />
            <span>{marketplace.timestamp ? new Date(marketplace.timestamp).toLocaleDateString() : "N/A"}</span>
          </div>

          {marketplace.description && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2">
                <FaTag className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
                <p className="text-sm text-gray-700 leading-relaxed">{marketplace.description}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleViewDeed}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              View Details
            </button>
            
            {isAvailable && !isOwnListing && (
              <button
                onClick={handleBuy}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                {isFractional ? "Buy FT Tokens" : "Buy Now"}
              </button>
            )}
            
            {isOwnListing && (
              <div className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg text-center font-semibold border-2 border-blue-300">
                Your Listing
              </div>
            )}

            {!isAvailable && !isOwnListing && (
              <div className="w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-semibold border-2 border-gray-300">
                Sold
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <span className="font-medium">Token ID:</span>
                <span className="font-mono">{marketplace.tokenId}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span className="font-medium">Listing:</span>
                <span className="font-mono">{marketplace.marketPlaceId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBuyPopup && (
        <BuyMarketplacePopup
          marketplace={marketplace}
          deed={deed}
          isOpen={showBuyPopup}
          onClose={() => setShowBuyPopup(false)}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};

export default MarketplaceCard;
