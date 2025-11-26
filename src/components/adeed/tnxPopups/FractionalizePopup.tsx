import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useToast } from "../../../contexts/ToastContext";
import { useLoader } from "../../../contexts/LoaderContext";
import { useWallet } from "../../../contexts/WalletContext";
import { createFractionalToken } from "../../../web3.0/contractService";
import { createTransaction, updateDeedOwners } from "../../../api/api";
import { calculateOwnershipFromEvents } from "../../../web3.0/eventService";
import { getTotalSupply } from "../../../web3.0/contractService";

interface FractionalizePopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  deedId: string;
  deedNumber: string;
  onSuccess?: () => void;
}

const FractionalizePopup: React.FC<FractionalizePopupProps> = ({
  isOpen,
  onClose,
  tokenId,
  deedId,
  deedNumber,
  onSuccess
}) => {
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const [tokenSupply, setTokenSupply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTokenSupply("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFractionalize = async () => {
    if (!tokenSupply || !account) {
      showToast("Please enter the number of fractional tokens", "error");
      return;
    }

    const supplyNum = parseInt(tokenSupply, 10);
    if (isNaN(supplyNum) || supplyNum <= 0) {
      showToast("Please enter a valid number greater than 0", "error");
      return;
    }

    if (supplyNum > 1000000000) {
      showToast("Token supply cannot exceed 1,000,000,000", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      showLoader();

      const res = await createFractionalToken(
        tokenId,
        `Property ${deedNumber}`,
        `PROP${tokenId}`,
        supplyNum
      );

      if (res.success && res.txHash) {
        try {
          await createTransaction({
            deedId,
            from: account,
            to: account,
            amount: 0,
            share: 100,
            type: "init",
            blockchain_identification: res.txHash,
            hash: res.txHash,
            description: `Property fractionalized into ${supplyNum.toLocaleString()} tokens. Token address: ${res.tokenAddress}`,
            status: "completed"
          });

          await new Promise(resolve => setTimeout(resolve, 3000));

          const totalSupply = await getTotalSupply(tokenId);
          const owners = await calculateOwnershipFromEvents(tokenId, totalSupply);

          if (owners.length > 0) {
            await updateDeedOwners(deedId, owners);
          }
        } catch {}
      }

      showToast("Property fractionalized successfully!", "success");
      onSuccess?.();
      onClose();
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error("Fractionalization error:", error);
      showToast(error.message || "Fractionalization failed!", "error");
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50 text-black">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          disabled={isSubmitting}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fractionalize Property</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Fractional Tokens
            </label>
            <input
              type="number"
              value={tokenSupply}
              onChange={(e) => setTokenSupply(e.target.value)}
              placeholder="e.g., 1000000"
              min="1"
              max="1000000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the total number of fractional tokens to create. This determines how the property ownership will be divided.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Once fractionalized, the property NFT will be transferred to the factory contract. 
              You will receive all fractional tokens initially. Some actions (like direct transfer or escrow sale) will be disabled 
              until the property is defractionalized.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleFractionalize}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !tokenSupply}
            >
              {isSubmitting ? "Fractionalizing..." : "Fractionalize"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FractionalizePopup;

