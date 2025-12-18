import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useToast } from "../../../contexts/ToastContext";
import { useLoader } from "../../../contexts/LoaderContext";
import { useWallet } from "../../../contexts/WalletContext";
import { defractionalizeProperty, hasFullOwnership, hasFullOwnershipFallback, isPropertyFractionalized } from "../../../web3.0/contractService";
import { createTransaction, updateFullOwnerAddress, updateDeedOwners } from "../../../api/api";
import { calculateOwnershipFromEvents } from "../../../web3.0/eventService";

interface DefractionalizePopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  deedId: string;
  onSuccess?: () => void;
}

const DefractionalizePopup: React.FC<DefractionalizePopupProps> = ({
  isOpen,
  onClose,
  tokenId,
  deedId,
  onSuccess
}) => {
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canDefractionalize, setCanDefractionalize] = useState(false);
  const [checking, setChecking] = useState(true);
  const [blockingReason, setBlockingReason] = useState<string | null>(null);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!isOpen || !account || !tokenId) {
        setChecking(false);
        return;
      }

      try {
        setChecking(true);
        setBlockingReason(null);
        
        const isFractionalized = await isPropertyFractionalized(tokenId);
        if (!isFractionalized) {
          setCanDefractionalize(false);
          setBlockingReason("Property is not fractionalized");
          setChecking(false);
          return;
        }

        const { getActiveListingsForToken } = await import("../../../web3.0/contractService");
        const activeListings = await getActiveListingsForToken(tokenId);
        
        if (activeListings.length > 0) {
          setCanDefractionalize(false);
          setBlockingReason(`There are ${activeListings.length} active marketplace listing(s). Please cancel them first.`);
          setChecking(false);
          return;
        }

        // use factory check first, then fallback to token-level exact check
        const hasFullFactory = await hasFullOwnership(tokenId, account);
        const hasFull = hasFullFactory || (await hasFullOwnershipFallback(tokenId, account));
        if (!hasFull) {
          setCanDefractionalize(false);
          setBlockingReason("You must own 100% of the fractional tokens to defractionalize this property.");
          setChecking(false);
          return;
        }

        setCanDefractionalize(true);
        setBlockingReason(null);
      } catch (error) {
        console.error("Error checking defractionalization eligibility:", error);
        setCanDefractionalize(false);
        setBlockingReason("Failed to verify eligibility. Please try again.");
      } finally {
        setChecking(false);
      }
    };

    checkEligibility();
  }, [isOpen, account, tokenId]);

  if (!isOpen) return null;

  const handleDefractionalize = async () => {
    if (!account) {
      showToast("Wallet not connected", "error");
      return;
    }

    // Re-check eligibility right before attempting defractionalization
    try {
      const isFractionalized = await isPropertyFractionalized(tokenId);
      if (!isFractionalized) {
        showToast("Property is not fractionalized", "error");
        return;
      }

      const { getFractionalTokenInfo, getActiveListingsForToken, getFractionalTokenAddress, getFTBalance, getTotalSupply, getTokensInMarketplace, getAllTokenHolders } = await import("../../../web3.0/contractService");
      
      const activeListings = await getActiveListingsForToken(tokenId);
      if (activeListings.length > 0) {
        showToast(`Cannot defractionalize: There are ${activeListings.length} active marketplace listing(s). Please cancel them first.`, "error");
        setCanDefractionalize(false);
        return;
      }
      
      const tokenAddress = await getFractionalTokenAddress(tokenId);
      if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
        showToast("Property is not fractionalized", "error");
        return;
      }
      
      const [userBalanceFromToken, info, tokensInMarketplace, allHolders] = await Promise.all([
        getFTBalance(tokenAddress, account),
        getFractionalTokenInfo(tokenId),
        getTokensInMarketplace(tokenId),
        getAllTokenHolders(tokenId)
      ]);

      if (!info.isFractionalized) {
        showToast("Property is not fractionalized", "error");
        return;
      }

      // Prefer token-formatted balances (userBalanceFromToken) and factory totals (info.totalSupply)
      const factoryTotal = Number(info.totalSupply || 0);
      const tokenOwnerBalance = Number(userBalanceFromToken || 0);
      const factoryOwnerBalance = Number(info.userBalance || 0);

      // If marketplace shows tokens, block
      if (Number(tokensInMarketplace || 0) > 0) {
        showToast(`Cannot defractionalize: ${Number(tokensInMarketplace).toLocaleString()} tokens are in the marketplace contract. Please cancel all listings first.`, "error");
        setCanDefractionalize(false);
        return;
      }

      // Sum other holders balances (note: allHolders balances may be raw units; attempt best-effort normalization)
      const totalInOtherAddresses = allHolders
        .filter(h => h.address.toLowerCase() !== account.toLowerCase())
        .reduce((sum, h) => sum + (Number(h.balance) || 0), 0);

      if (totalInOtherAddresses > 0) {
        showToast(`Cannot defractionalize: ${totalInOtherAddresses.toLocaleString()} tokens are held by other addresses. You must own all tokens.`, "error");
        setCanDefractionalize(false);
        return;
      }

      // Determine authoritative owner balance (prefer token-formatted value if available)
      const ownerBalance = tokenOwnerBalance > 0 ? tokenOwnerBalance : factoryOwnerBalance;
      const totalSupplyForComparison = factoryTotal > 0 ? factoryTotal : Number(await getTotalSupply(tokenId) || 0);

      // Use a small tolerance to account for formatting/decimals differences
      const TOL = 1e-6;
      if (Math.abs(ownerBalance - totalSupplyForComparison) > TOL) {
        const percentage = totalSupplyForComparison > 0 ? (ownerBalance / totalSupplyForComparison) * 100 : 0;
        const missing = totalSupplyForComparison - ownerBalance;
        showToast(`You must own 100% of the fractional tokens to defractionalize. You currently own ${ownerBalance.toLocaleString()}/${totalSupplyForComparison.toLocaleString()} tokens (${percentage.toFixed(2)}%). Missing ${missing.toLocaleString()} tokens.`, "error");
        setCanDefractionalize(false);
        return;
      }
      
      // First try the factory-level check, then fallback to token exact equality
      const hasFullFactory = await hasFullOwnership(tokenId, account);
      const hasFullCombined = hasFullFactory || (await hasFullOwnershipFallback(tokenId, account));
      
      if (!hasFullCombined) {
        const holdersInfo = allHolders.length > 0 
          ? ` Found ${allHolders.length} token holder(s).`
          : "";
        showToast(`Ownership verification failed. You own ${ownerBalance.toLocaleString()}/${totalSupplyForComparison.toLocaleString()} tokens but contract reports you don't have full ownership.${holdersInfo} Check console for details.`, "error");
        console.error(`[DEFRACTIONALIZE] hasFullOwnership returned false. Balance: ${ownerBalance}/${totalSupplyForComparison}, Holders:`, allHolders);
        setCanDefractionalize(false);
        return;
      }
    } catch {
      showToast("Failed to verify eligibility. Please try again.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      showLoader();

      const res = await defractionalizeProperty(tokenId);

      if (res.success && res.txHash) {
        try {
          await createTransaction({
            deedId,
            from: account,
            to: account,
            amount: 0,
            share: 100,
            type: "defractionalize",
            blockchain_identification: res.txHash,
            hash: res.txHash,
            description: `Property defractionalized. NFT returned to owner.`,
            status: "completed"
          });

          await updateFullOwnerAddress(tokenId, account);
          
          // Wait for blockchain to update
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Update owners array based on on-chain data
          try {
            const owners = await calculateOwnershipFromEvents(tokenId);
            if (owners.length > 0) {
              await updateDeedOwners(deedId, owners);
            }
          } catch (ownershipError) {
            console.error("Failed to calculate and update ownership after defractionalization:", ownershipError);
          }
        } catch (updateError) {
          console.error("Failed to update full owner address after defractionalization:", updateError);
        }
      }

      showToast("Property defractionalized successfully!", "success");
      onSuccess?.();
      onClose();
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      const errorMessage = error.message || error.reason || "Defractionalization failed!";
      showToast(errorMessage, "error");
      
      if (errorMessage.includes("marketplace listing")) {
        setBlockingReason(errorMessage.replace("Cannot defractionalize: ", ""));
        setCanDefractionalize(false);
      } else {
        try {
          const isFractionalized = await isPropertyFractionalized(tokenId);
          const { getActiveListingsForToken } = await import("../../../web3.0/contractService");
          const activeListings = await getActiveListingsForToken(tokenId);
          
          if (activeListings.length > 0) {
            setBlockingReason(`There are ${activeListings.length} active marketplace listing(s). Please cancel them first.`);
            setCanDefractionalize(false);
          } else {
            const hasFull = await hasFullOwnership(tokenId, account);
            setCanDefractionalize(hasFull && isFractionalized);
            if (!hasFull) {
              setBlockingReason("You must own 100% of the fractional tokens to defractionalize this property.");
            }
          }
        } catch {}
      }
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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Defractionalize Property</h2>

        {checking ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking eligibility...</p>
          </div>
        ) : !canDefractionalize ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Cannot Defractionalize:</strong> {blockingReason || "You must own 100% of the fractional tokens to defractionalize this property."}
              </p>
            </div>
            {blockingReason && blockingReason.includes("marketplace listing") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Go to the marketplace section above to cancel your active listings, then try defractionalizing again.
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Defractionalization:</strong> This will convert all fractional tokens back into a single NFT. 
                The NFT will be transferred back to your wallet, and fractional token functionality will be disabled.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. Make sure you want to defractionalize before proceeding.
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
                onClick={handleDefractionalize}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Defractionalizing..." : "Defractionalize"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefractionalizePopup;

