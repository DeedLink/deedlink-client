import { FaTag } from "react-icons/fa";
import { formatCurrency, shortAddress, timeAgo } from "../../utils/format";
import type { Title } from "../../types/title";

interface MarketListingSectionProps {
  marketTransaction: Title;
  account: string | null;
  onBuy: () => void;
}

const MarketListingSection: React.FC<MarketListingSectionProps> = ({
  marketTransaction,
  account,
  onBuy,
}) => {
  const isNFT = marketTransaction.share === 100;
  const isFT = marketTransaction.share < 100;

  const formatDate = (date: Date | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOwner = account && account.toLowerCase() === marketTransaction.from.toLowerCase();

  return (
    <section className="rounded-xl border border-indigo-200/50 p-5 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center gap-2 mb-4">
        <FaTag className="text-indigo-700" size={20} />
        <h2 className="text-lg font-bold text-indigo-900">Market Listing</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-lg p-4">
        <div>
          <div className="text-xs text-indigo-500 uppercase font-semibold">Sale Price</div>
          <div className="font-bold text-indigo-700 mt-1 text-xl">
            {formatCurrency(marketTransaction.amount, "USD")}
          </div>
        </div>
        <div>
          <div className="text-xs text-indigo-500 uppercase font-semibold">Type</div>
          <div className="font-medium text-indigo-700 mt-1">
            {isNFT ? "Full Property (NFT)" : `Fractional Share (FT) - ${marketTransaction.share}%`}
          </div>
        </div>
        <div>
          <div className="text-xs text-indigo-500 uppercase font-semibold">Seller</div>
          <div className="font-medium text-indigo-700 mt-1 font-mono text-sm">
            {shortAddress(marketTransaction.from)}
          </div>
        </div>
        {marketTransaction.date && (
          <div>
            <div className="text-xs text-indigo-500 uppercase font-semibold">Listed</div>
            <div className="font-medium text-indigo-700 mt-1">
              {formatDate(marketTransaction.date)} • {timeAgo(new Date(marketTransaction.date).getTime())}
            </div>
          </div>
        )}
        {marketTransaction.description && (
          <div className="sm:col-span-2">
            <div className="text-xs text-indigo-500 uppercase font-semibold">Description</div>
            <div className="font-medium text-indigo-700 mt-1">{marketTransaction.description}</div>
          </div>
        )}
      </div>
      {!isOwner ? (
        <button
          onClick={onBuy}
          className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg py-3 font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md shadow-indigo-200"
        >
          Buy Now
        </button>
      ) : (
        <div className="mt-4 w-full bg-indigo-100 text-indigo-600 rounded-lg py-3 font-semibold text-center border border-indigo-200">
          Your Listing
        </div>
      )}
    </section>
  );
};

export default MarketListingSection;

