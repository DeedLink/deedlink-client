import { useState, useEffect } from "react";
import { useWallet } from "../../../contexts/WalletContext";
import { getFractionalTokenInfo, isPropertyFractionalized } from "../../../web3.0/contractService";
import { FaCoins, FaPercentage, FaInfoCircle } from "react-icons/fa";

interface FractionalOwnershipCardProps {
  tokenId: number;
  onTransfer?: () => void;
  refreshTrigger?: number;
}

const FractionalOwnershipCard: React.FC<FractionalOwnershipCardProps> = ({
  tokenId,
  onTransfer,
  refreshTrigger
}) => {
  const { account } = useWallet();
  const [ownershipInfo, setOwnershipInfo] = useState<{
    isFractionalized: boolean;
    userBalance: number;
    totalSupply: number;
    userPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOwnership = async () => {
      if (!account || !tokenId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const isFractionalized = await isPropertyFractionalized(tokenId);
        
        if (isFractionalized) {
          const info = await getFractionalTokenInfo(tokenId);
          setOwnershipInfo({
            isFractionalized: true,
            userBalance: info.userBalance,
            totalSupply: info.totalSupply,
            userPercentage: info.userPercentage
          });
        } else {
          setOwnershipInfo({
            isFractionalized: false,
            userBalance: 0,
            totalSupply: 0,
            userPercentage: 0
          });
        }
      } catch (error) {
        console.error("Error loading ownership:", error);
        setOwnershipInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadOwnership();
  }, [account, tokenId, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!ownershipInfo || !ownershipInfo.isFractionalized) {
    return null;
  }

  const actualPercentage = ownershipInfo.userPercentage;
  const displayedPercentage = parseFloat(actualPercentage.toFixed(2));
  const tolerance = 0.1;
  const hasFullOwnership = actualPercentage >= (100 - tolerance);
  const hasPartialOwnership = actualPercentage > 0 && actualPercentage < (100 - tolerance);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaCoins className="text-purple-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Fractional Ownership</h3>
        </div>
        {hasFullOwnership && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            100% Owned
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <FaPercentage className="text-purple-600" />
              Your Ownership
            </span>
            <span className="text-2xl font-bold text-purple-700">
              {displayedPercentage.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(actualPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{ownershipInfo.userBalance.toLocaleString()} tokens</span>
            <span>{ownershipInfo.totalSupply.toLocaleString()} total</span>
          </div>
        </div>

        {hasPartialOwnership && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold mb-1">Partial Ownership Notice</p>
                <p>
                  You own {displayedPercentage.toFixed(2)}% of this property. 
                  Some actions like setting rent or granting Power of Attorney require 100% ownership.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasFullOwnership && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaInfoCircle className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-green-800">
                <p className="font-semibold mb-1">Full Ownership</p>
                <p>
                  You own 100% of the fractional tokens. You can perform all property actions including setting rent and granting Power of Attorney.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasPartialOwnership && onTransfer && (
          <button
            onClick={onTransfer}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            Transfer Fractional Tokens
          </button>
        )}
      </div>
    </div>
  );
};

export default FractionalOwnershipCard;

