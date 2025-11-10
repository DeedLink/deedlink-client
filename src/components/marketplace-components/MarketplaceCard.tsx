import React, { useState, useEffect } from "react";
import type { Marketplace } from "../../types/marketplace";
import { FaMapMarkerAlt, FaPercentage, FaEthereum, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getDeedById } from "../../api/api";
import type { IDeed } from "../../types/responseDeed";
import { useToast } from "../../contexts/ToastContext";
import BuyMarketplacePopup from "./BuyMarketplacePopup";

interface MarketplaceCardProps {
  marketplace: Marketplace;
  onUpdate: () => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ marketplace, onUpdate }) => {
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
    setShowBuyPopup(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
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
      <div className={`bg-white rounded-2xl shadow-lg border transition-all hover:shadow-xl ${
        isAvailable ? 'border-green-200' : 'border-gray-200 opacity-75'
      }`}>
        <div className={`p-6 rounded-t-2xl ${
          isAvailable ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gray-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">Deed #{deed.deedNumber}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isAvailable ? 'bg-white text-green-700' : 'bg-gray-700 text-white'
            }`}>
              {isAvailable ? 'Available' : 'Sold'}
            </span>
          </div>
          <p className="text-green-100 text-sm">{deed.deedType.deedType}</p>
        </div>

        <div className="p-6">
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <FaMapMarkerAlt className="text-green-600" />
              <span className="text-sm">{deed.district}, {deed.division}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <FaPercentage className="text-green-600" />
              <span className="text-sm font-semibold">Share: {marketplace.share}%</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <FaEthereum className="text-green-600" />
              <span className="text-lg font-bold text-green-900">{marketplace.amount} ETH</span>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <FaClock />
              <span className="text-xs">Listed on {marketplace.timestamp ? new Date(marketplace.timestamp).toLocaleString() : "N/A"}</span>
            </div>
          </div>

          {marketplace.description && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{marketplace.description}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleViewDeed}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-green-600 text-green-600 font-semibold hover:bg-green-50 transition"
            >
              View Deed
            </button>
            {isAvailable && (
              <button
                onClick={handleBuy}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg transition"
              >
                Buy Now
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p><span className="font-semibold">Token ID:</span> {marketplace.tokenId}</p>
              <p><span className="font-semibold">Market ID:</span> {marketplace.marketPlaceId}</p>
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