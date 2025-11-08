import { FaFileSignature } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";
import type { IDeed } from "../../types/responseDeed";
import type { Title } from "../../types/title";

interface MarketDeedHeaderProps {
  deed: IDeed;
  marketTransaction: Title | null;
  isNFT: boolean;
}

const MarketDeedHeader: React.FC<MarketDeedHeaderProps> = ({
  deed,
  marketTransaction,
  isNFT,
}) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
      <div className="flex items-center gap-3 text-white">
        <FaFileSignature size={32} />
        <div>
          <h1 className="text-3xl font-bold">Deed #{deed.deedNumber}</h1>
          <p className="text-indigo-100 mt-1">
            {deed.deedType.deedType} • {deed.district}, {deed.division}
          </p>
        </div>
      </div>
      {marketTransaction && (
        <div className="text-white text-right">
          <div className="text-sm text-indigo-100">Sale Price</div>
          <div className="text-2xl font-bold">{formatCurrency(marketTransaction.amount, "USD")}</div>
          {!isNFT && (
            <div className="text-sm text-indigo-100 mt-1">Share: {marketTransaction.share}%</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketDeedHeader;

