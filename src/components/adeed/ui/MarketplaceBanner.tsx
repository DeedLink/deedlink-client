import type { Marketplace } from "../../../types/marketplace";

interface MarketplaceBannerProps {
  marketPlaceData: Marketplace[] | undefined;
  onRemoveListing: (marketId: string) => void;
}

const MarketplaceBanner = ({ marketPlaceData, onRemoveListing }: MarketplaceBannerProps) => {
  if (!marketPlaceData || marketPlaceData.filter(m => m.status === "open_to_sale").length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-5 rounded-2xl shadow-sm flex-col">
      <span className="font-medium bg-white rounded-xl p-4 shadow-sm border border-emerald-100 w-full flex flex-col">
        This deed is currently listed on the open market.
      </span>
      {marketPlaceData
        .filter(m => m.status === "open_to_sale")
        .map((item) => (
          <div key={item._id} className="bg-white rounded-xl p-4 mt-2 shadow-sm border border-emerald-100 w-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><span className="font-semibold">Market ID:</span> {item.marketPlaceId}</p>
              <p><span className="font-semibold">Token ID:</span> {item.tokenId}</p>
              <p><span className="font-semibold">Share:</span> {item.share}%</p>
              <p><span className="font-semibold">Amount:</span> {item.amount} ETH</p>
              <p><span className="font-semibold">Description:</span> {item.description}</p>
            </div>
            <p className="text-md text-emerald-700 mt-2">
              Listed on: {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
            </p>
            {item._id && typeof item._id === 'string' && (
              <div className="w-full flex items-end justify-end mt-4">
                <button 
                  onClick={() => onRemoveListing(item._id ?? "")} 
                  className="py-2 px-4 rounded-md bg-red-600 cursor-pointer hover:bg-red-700 text-white transition-colors font-medium"
                >
                  Remove Selling Ad
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default MarketplaceBanner;