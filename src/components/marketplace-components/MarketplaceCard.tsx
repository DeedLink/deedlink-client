import React, { useState, useEffect } from "react";
import type { Marketplace } from "../../types/marketplace";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
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
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
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

  return (
    <>
      <div className={`bg-white rounded-lg border transition hover:shadow-md ${
        isOwnListing 
          ? 'border-blue-300' 
          : isAvailable 
            ? 'border-green-300' 
            : 'border-gray-300 opacity-75'
      }`}>
        <div className={`p-4 rounded-t-lg ${
          isOwnListing 
            ? 'bg-blue-600' 
            : isAvailable 
              ? 'bg-green-600' 
              : 'bg-gray-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Deed #{deed.deedNumber}</h3>
              <p className="text-white/90 text-sm">{deed.deedType.deedType}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isOwnListing 
                ? 'bg-white text-blue-700'
                : isAvailable 
                  ? 'bg-white text-green-700' 
                  : 'bg-gray-700 text-white'
            }`}>
              {isOwnListing ? 'Your Listing' : isAvailable ? 'Available' : 'Sold'}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <FaMapMarkerAlt className="text-gray-400" />
            <span className="text-sm">{deed.district}, {deed.division}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Share</div>
              <div className="text-lg font-bold text-gray-900">{marketplace.share}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Price</div>
              <div className="text-lg font-bold text-gray-900">{marketplace.amount} ETH</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
            <FaClock />
            <span>{marketplace.timestamp ? new Date(marketplace.timestamp).toLocaleDateString() : "N/A"}</span>
          </div>

          {marketplace.description && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">{marketplace.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleViewDeed}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              View Details
            </button>
            
            {isAvailable && !isOwnListing && (
              <button
                onClick={handleBuy}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
              >
                Buy Now
              </button>
            )}
            
            {isOwnListing && (
              <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center font-medium">
                Your Listing
              </div>
            )}

            {!isAvailable && !isOwnListing && (
              <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center font-medium">
                Sold
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Token: {marketplace.tokenId}</span>
              <span>Market: {marketplace.marketPlaceId}</span>
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