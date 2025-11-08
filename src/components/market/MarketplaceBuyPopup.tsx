import { type FC, useState, useEffect } from "react";
import { IoClose, IoInformationCircle } from "react-icons/io5";
import { FaShoppingCart, FaSync, FaCheckCircle } from "react-icons/fa";
import { 
  buyerDepositPayment, 
  finalizeEscrow, 
  getEscrowDetails, 
  getEscrowStatus,
  getPaymentBreakdown
} from "../../web3.0/escrowIntegration";
import { 
  createTransaction, 
  transactionStatus, 
  updateFullOwnerAddress,
  getTransactionsByDeedId
} from "../../api/api";
import { useLogin } from "../../contexts/LoginContext";
import { useAlert } from "../../contexts/AlertContext";
import { useWallet } from "../../contexts/WalletContext";
import type { Title } from "../../types/title";
import type { IDeed } from "../../types/responseDeed";

interface MarketplaceBuyPopupProps {
  isOpen: boolean;
  deed: IDeed;
  marketTransaction: Title;
  onClose: () => void;
  onPurchaseComplete?: () => void;
}

type PurchaseStep = "checking" | "no_escrow" | "ready" | "deposit" | "finalize" | "complete";

const MarketplaceBuyPopup: FC<MarketplaceBuyPopupProps> = ({ 
  isOpen, 
  deed,
  marketTransaction,
  onClose,
  onPurchaseComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<PurchaseStep>("checking");
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [purchaseIntentCreated, setPurchaseIntentCreated] = useState(false);
  const { user } = useLogin();
  const { account } = useWallet();
  const { showAlert } = useAlert();

  const isNFT = marketTransaction.share === 100;
  const breakdown = getPaymentBreakdown(marketTransaction.amount.toString());

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }

    // Always check for existing escrow when popup opens
    checkForEscrow();
  }, [isOpen, marketTransaction, account]);

  const resetState = () => {
    setStep("checking");
    setEscrowAddress(null);
    setDetails(null);
    setStatus(null);
    setPurchaseIntentCreated(false);
  };

  const shortAddress = (addr: string) =>
    addr && addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  /**
   * Check if escrow already exists for this marketplace listing
   * Escrow is created by seller, so we look for escrow_sale transaction
   */
  const checkForEscrow = async () => {
    if (!account || !deed._id) return;

    try {
      setStep("checking");
      const transactions = await getTransactionsByDeedId(deed._id);
      
      // Find escrow_sale transaction: from=seller, to=buyer, has escrow address
      const escrowTxn = transactions.find(
        (t: any) => 
          t.type === "escrow_sale" && 
          t.status === "pending" &&
          t.from.toLowerCase() === marketTransaction.from.toLowerCase() && // Seller
          t.to.toLowerCase() === account.toLowerCase() && // Buyer
          t.blockchain_identification // Has escrow address
      );

      if (escrowTxn?.blockchain_identification) {
        // Escrow exists - load it and proceed
        setEscrowAddress(escrowTxn.blockchain_identification);
        await loadEscrowData(escrowTxn.blockchain_identification);
      } else {
        // No escrow yet - check if we already created a purchase intent
        const purchaseIntent = transactions.find(
          (t: any) =>
            t.type === "direct_transfer" &&
            t.status === "pending" &&
            t.from.toLowerCase() === account.toLowerCase() && // Buyer
            t.to.toLowerCase() === marketTransaction.from.toLowerCase() && // Seller
            t.amount === marketTransaction.amount
        );
        
        if (purchaseIntent) {
          setPurchaseIntentCreated(true);
          setStep("no_escrow");
        } else {
          setStep("no_escrow");
        }
      }
    } catch (error) {
      console.error("Failed to check for escrow:", error);
      setStep("no_escrow");
    }
  };

  /**
   * Load escrow details and status, then determine current step
   */
  const loadEscrowData = async (address: string) => {
    try {
      const [detailsData, statusData] = await Promise.all([
        getEscrowDetails(address),
        getEscrowStatus(address)
      ]);
      
      setDetails(detailsData);
      setStatus(statusData);

      // Determine step based on escrow status
      if (statusData.isFinalized) {
        setStep("complete");
      } else if (statusData.isBuyerDeposited && statusData.isSellerDeposited) {
        setStep("finalize");
      } else if (statusData.isSellerDeposited && !statusData.isBuyerDeposited) {
        setStep("deposit");
      } else {
        setStep("ready");
      }
    } catch (error) {
      console.error("Failed to load escrow data:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to load escrow information. Please try again.",
        confirmText: "OK",
      });
      setStep("no_escrow");
    }
  };

  /**
   * Create a simple purchase intent to notify seller
   * This is just a signal - seller will create the actual escrow
   */
  const createPurchaseIntent = async () => {
    if (!account || !deed.tokenId) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Wallet not connected or token ID missing",
        confirmText: "OK",
      });
      return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      showAlert({
        type: "warning",
        title: "Express Interest to Purchase",
        htmlContent: (
          <div className="text-white space-y-2">
            <p>Express your interest to purchase this property?</p>
            <p>
              <strong>Property:</strong> Deed #{deed.deedNumber}<br />
              <strong>Price:</strong> {marketTransaction.amount} ETH<br />
              <strong>Type:</strong> {isNFT ? "Full Property (NFT)" : `Fractional Share (${marketTransaction.share}%)`}
            </p>
            <p className="text-sm">
              The seller will be notified and will create an escrow. You'll be able to proceed once the escrow is ready.
            </p>
          </div>
        ),
        confirmText: "Express Interest",
        cancelText: "Cancel",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      // Create a simple purchase intent transaction
      await createTransaction({
        deedId: deed._id,
        from: account, // Buyer
        to: marketTransaction.from, // Seller
        amount: marketTransaction.amount,
        share: marketTransaction.share,
        type: "direct_transfer", // Simple purchase intent
        status: "pending",
        description: `Marketplace purchase interest: Buyer ${shortAddress(account)} wants to purchase Deed #${deed.deedNumber}`,
      });

      setPurchaseIntentCreated(true);
      setStep("no_escrow");
      
      showAlert({
        type: "success",
        title: "Interest Expressed",
        message: "The seller has been notified. They will create an escrow shortly. You can check back in a few moments.",
        confirmText: "OK",
      });
    } catch (error: any) {
      console.error("Failed to create purchase intent:", error);
      showAlert({
        type: "error",
        title: "Failed",
        message: error.message || "Unknown error occurred",
        confirmText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh escrow status
   */
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await checkForEscrow();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buyer deposits payment to escrow
   */
  const handleDepositPayment = async () => {
    if (!details || !escrowAddress) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      showAlert({
        type: "warning",
        title: "Deposit Payment",
        htmlContent: (
          <div className="text-white space-y-2">
            <p>Deposit payment to escrow?</p>
            <p>
              <strong>Amount:</strong> {details.price} ETH<br />
              <strong>Seller:</strong> {shortAddress(details.seller)}
            </p>
            <p className="text-sm">Payment will be held in escrow until you finalize the transfer.</p>
          </div>
        ),
        confirmText: "Deposit",
        cancelText: "Cancel",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await buyerDepositPayment(escrowAddress, details.price);
      
      if (result.success) {
        showAlert({
          type: "success",
          title: "Payment Deposited!",
          message: `Transaction: ${result.txHash}\n\nWaiting for seller to deposit NFT. You can finalize once both deposits are complete.`,
          confirmText: "OK",
        });
        
        // Refresh escrow status
        await loadEscrowData(escrowAddress);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Payment deposit failed:", error);
      showAlert({
        type: "error",
        title: "Failed to Deposit Payment",
        message: error.message,
        confirmText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buyer finalizes the purchase
   */
  const handleFinalize = async () => {
    if (!escrowAddress) return;

    const confirmed = await new Promise<boolean>((resolve) => {
      showAlert({
        type: "warning",
        title: "Finalize Purchase",
        htmlContent: (
          <div className="text-white space-y-2">
            <p>Finalize this purchase?</p>
            <p>
              This will:<br />
              - Transfer {details?.price} ETH to seller<br />
              - Transfer {isNFT ? "NFT" : "Fractional tokens"} to you
            </p>
            <p className="text-sm font-semibold">This action cannot be undone.</p>
          </div>
        ),
        confirmText: "Finalize",
        cancelText: "Cancel",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await finalizeEscrow(escrowAddress);

      if (result.success) {
        // Update transaction status
        await transactionStatus(escrowAddress, "completed");

        // Update owner address if NFT
        try {
          if (isNFT && deed.tokenId) {
            await updateFullOwnerAddress(
              deed.tokenId,
              account?.toLowerCase() || "",
              user?.name || "",
              user?.nic || ""
            );
          }
        } catch (err) {
          console.error("Failed to update owner address:", err);
        }

        showAlert({
          type: "success",
          title: "Purchase Complete!",
          htmlContent: (
            <div className="text-white space-y-2">
              <p>
                <strong>Transaction:</strong> {result.txHash}
              </p>
              <p>You now own the property!</p>
            </div>
          ),
          confirmText: "OK",
        });

        setStep("complete");
        onPurchaseComplete?.();
        
        // Close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Finalization failed:", error);
      showAlert({
        type: "error",
        title: "Failed to Finalize",
        message: error.message,
        confirmText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-100 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-full">
              <FaShoppingCart className="text-indigo-700" size={18} />
            </div>
            <h2 className="text-xl font-bold text-indigo-700">Purchase Property</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 transition">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Property Info */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="text-sm font-semibold text-indigo-800 mb-2">Property Details</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-600">Deed Number:</span>
                <span className="font-semibold">#{deed.deedNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">Price:</span>
                <span className="font-bold text-indigo-900">{marketTransaction.amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">Type:</span>
                <span className="font-semibold">{isNFT ? "Full Property (NFT)" : `Fractional Share (${marketTransaction.share}%)`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-600">Seller:</span>
                <span className="font-mono text-xs">{shortAddress(marketTransaction.from)}</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          {breakdown && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-sm font-semibold text-gray-800 mb-2">Payment Breakdown</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-semibold">{breakdown.totalPrice} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stamp Fee ({breakdown.stampFeePercentage}%):</span>
                  <span className="text-gray-700">{breakdown.stampFee} ETH</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-1 mt-1">
                  <span className="text-gray-600">Seller Receives:</span>
                  <span className="font-bold text-gray-900">{breakdown.sellerAmount} ETH</span>
                </div>
              </div>
            </div>
          )}

          {/* Step: Checking */}
          {step === "checking" && (
            <div className="text-center py-8">
              <FaSync className="animate-spin text-indigo-600 mx-auto mb-4" size={32} />
              <p className="text-indigo-700 font-medium">Checking for escrow...</p>
            </div>
          )}

          {/* Step: No Escrow Yet */}
          {step === "no_escrow" && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <IoInformationCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-800 mb-1">
                      {purchaseIntentCreated ? "Purchase Interest Expressed" : "Escrow Not Ready"}
                    </div>
                    <p className="text-sm text-yellow-700">
                      {purchaseIntentCreated
                        ? "The seller has been notified of your interest. They will create an escrow shortly. Please check back in a few moments."
                        : "The seller needs to create an escrow before you can proceed. Click below to express your interest to purchase."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  <FaSync className={loading ? "animate-spin" : ""} />
                  {loading ? "Checking..." : "Check Again"}
                </button>
              </div>

              {!purchaseIntentCreated && (
                <button
                  onClick={createPurchaseIntent}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? "Processing..." : "Express Interest to Purchase"}
                </button>
              )}
            </div>
          )}

          {/* Step: Ready (Escrow exists, waiting for seller to deposit) */}
          {step === "ready" && status && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <IoInformationCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <div className="font-semibold text-blue-800 mb-1">Escrow Ready</div>
                  <p className="text-sm text-blue-700">
                    The escrow has been created. Waiting for seller to deposit the {isNFT ? "NFT" : "tokens"}.
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                {loading ? "Checking..." : "Refresh Status"}
              </button>
            </div>
          )}

          {/* Step: Deposit (Seller deposited, buyer can deposit payment) */}
          {step === "deposit" && status && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-green-600" size={18} />
                  <div className="font-semibold text-green-800">Seller Deposited {isNFT ? "NFT" : "Tokens"}</div>
                </div>
                <p className="text-sm text-green-700">
                  The seller has deposited their asset. You can now deposit your payment.
                </p>
              </div>

              <button
                onClick={handleDepositPayment}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Depositing..." : `Deposit ${details?.price} ETH`}
              </button>
            </div>
          )}

          {/* Step: Finalize (Both deposited, buyer can finalize) */}
          {step === "finalize" && status && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheckCircle className="text-green-600" size={18} />
                  <div className="font-semibold text-green-800">Both Deposits Complete</div>
                </div>
                <p className="text-sm text-green-700">
                  Both you and the seller have deposited. You can now finalize the purchase.
                </p>
              </div>

              <button
                onClick={handleFinalize}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Finalizing..." : "Finalize Purchase"}
              </button>
            </div>
          )}

          {/* Step: Complete */}
          {step === "complete" && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <FaCheckCircle className="text-green-600 mx-auto mb-3" size={48} />
              <div className="text-lg font-semibold text-green-800 mb-1">Purchase Complete!</div>
              <div className="text-sm text-green-700">You now own this property</div>
            </div>
          )}

          {/* Transaction Progress (shown when escrow exists) */}
          {status && step !== "no_escrow" && step !== "checking" && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-sm font-semibold text-gray-800 mb-3">Transaction Progress</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status.isSellerDeposited ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {status.isSellerDeposited && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${status.isSellerDeposited ? "text-green-700" : "text-gray-500"}`}>
                      Seller Deposited {isNFT ? "NFT" : "Tokens"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status.isBuyerDeposited ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {status.isBuyerDeposited && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${status.isBuyerDeposited ? "text-green-700" : "text-gray-900"}`}>
                      You Deposited Payment
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status.isFinalized ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {status.isFinalized && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${status.isFinalized ? "text-green-700" : "text-gray-500"}`}>
                      Transfer Finalized
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500" />
      </div>
    </div>
  );
};

export default MarketplaceBuyPopup;
