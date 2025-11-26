import React, { useState } from "react";
import { FaStore, FaTimes, FaTrash, FaEthereum, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import type { Marketplace } from "../../../types/marketplace";

interface MarketplaceBannerProps {
  marketPlaceData?: Marketplace[];
  onRemoveListing: (marketId: string, listingId: string) => void;
}

const MarketplaceBanner: React.FC<MarketplaceBannerProps> = ({
  marketPlaceData,
  onRemoveListing,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const listingsArray = Array.isArray(marketPlaceData) ? marketPlaceData : [];
  const activeListings = listingsArray.filter(m => m.status === "open_to_sale");

  if (activeListings.length === 0) {
    return null;
  }

  const handleCancelClick = (marketId: string) => {
    setShowConfirm(marketId);
  };

  const handleConfirmCancel = async (marketId: string, listingId: string) => {
    setShowConfirm(null);
    setRemovingId(marketId);
    try {
      await onRemoveListing(marketId, listingId);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(null);
  };

  return (
    <div className="w-full mb-6">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <FaStore className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Active Marketplace Listings</h3>
                <p className="text-sm text-blue-100 mt-0.5">
                  {activeListings.length} {activeListings.length === 1 ? 'listing' : 'listings'} currently active
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-300/30">
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="text-green-200" size={14} />
                <span className="text-xs font-semibold text-green-100">Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {activeListings.map((listing) => {
              const isRemoving = removingId === listing._id;
              const isConfirming = showConfirm === listing._id;
              const listingType = listing.listingTypeOnChain || (listing.share === 100 ? "NFT" : "FRACTIONAL");
              const pricePerToken = listingType === "FRACTIONAL" && listing.amount && listing.share 
                ? (Number(listing.amount) / (listing.share / 100)).toFixed(6)
                : null;
              
              return (
                <div
                  key={listing._id}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                            listingType === "NFT" 
                              ? "bg-purple-100 text-purple-700 border border-purple-200" 
                              : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                          }`}>
                            {listingType}
                          </span>
                          {listing.share < 100 && (
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                              {listing.share}% Share
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">Active</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <FaEthereum className="text-blue-600" size={16} />
                              <span className="text-sm font-medium text-gray-700">Total Price</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{listing.amount} ETH</span>
                          </div>

                          {pricePerToken && (
                            <div className="flex items-center justify-between py-1.5 px-3 bg-indigo-50 rounded-lg border border-indigo-100">
                              <span className="text-xs text-indigo-600 font-medium">Price per Token</span>
                              <span className="text-sm font-semibold text-indigo-700">{pricePerToken} ETH</span>
                            </div>
                          )}

                          {listing.description && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start gap-2">
                                <FaInfoCircle className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
                                <p className="text-xs text-gray-600 leading-relaxed">{listing.description}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                        <p className="text-sm font-semibold text-yellow-800 mb-3">
                          Are you sure you want to cancel this listing?
                        </p>
                        <p className="text-xs text-yellow-700 mb-4">
                          This will remove the listing from the marketplace. This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmCancel(listing._id!, listing.marketPlaceId)}
                            disabled={isRemoving}
                            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                          >
                            {isRemoving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Cancelling...</span>
                              </>
                            ) : (
                              <>
                                <FaTrash size={12} />
                                <span>Yes, Cancel Listing</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancelConfirm}
                            disabled={isRemoving}
                            className="flex-1 py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                          >
                            No, Keep It
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCancelClick(listing._id!)}
                        disabled={isRemoving || isConfirming}
                        className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        <FaTimes size={14} />
                        <span>Cancel Listing</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={14} />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Your listings are live on the marketplace</p>
                <p className="text-blue-700">
                  Buyers can purchase your property shares. Cancel any listing to remove it from the marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceBanner;
