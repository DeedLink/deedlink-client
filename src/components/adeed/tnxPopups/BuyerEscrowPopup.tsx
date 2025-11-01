import { type FC, useState, useEffect } from "react";
import { IoClose, IoInformationCircle } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import { 
  buyerDepositPayment, 
  finalizeEscrow, 
  getEscrowDetails, 
  getEscrowStatus 
} from "../../../web3.0/escrowIntegration";
import { transactionStatus, updateFullOwnerAddress } from "../../../api/api";
import { useLogin } from "../../../contexts/LoginContext";
import { useAlert } from "../../../contexts/AlertContext";

interface BuyerEscrowPopupProps {
  isOpen: boolean;
  escrowAddress: string;
  onClose: () => void;
}

const BuyerEscrowPopup: FC<BuyerEscrowPopupProps> = ({ 
  isOpen, 
  escrowAddress, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const { user } = useLogin();
  const { showAlert } = useAlert();

  useEffect(()=>{
    const getDetailsAll = async() => {
        getEscrowDetails(escrowAddress);
        console.log(details);
    };
    getDetailsAll();
  },[]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !escrowAddress) return;
      
      try {
        const [detailsData, statusData] = await Promise.all([
          getEscrowDetails(escrowAddress),
          getEscrowStatus(escrowAddress)
        ]);
        setDetails(detailsData);
        setStatus(statusData);
      } catch (error) {
        console.error("Failed to fetch escrow data:", error);
      }
    };

    fetchData();
  }, [isOpen, escrowAddress]);

  function confirmDeposit(details: any): Promise<boolean> {
  return new Promise((resolve) => {
    showAlert({
      type: "warning",
      title: "Deposit Confirmation",
      htmlContent: (
        <div className="text-white space-y-2">
          <p>Deposit payment for this property?</p>
          <p>
            <strong>Amount:</strong> {details.price} ETH<br />
            <strong>Seller:</strong> {details.seller}
          </p>
          <p>This payment will be held in escrow until you finalize the transfer.</p>
        </div>
      ),
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

  const handleDepositPayment = async () => {
    if (!details) return alert("Loading escrow details...");

    const confirmed = confirmDeposit(details);
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await buyerDepositPayment(escrowAddress, details.price);
      console.log(result);
      
      if (result.success) {
        showAlert({
          type: "success",
          title: "Payment Deposited!",
          htmlContent: (
            <div className="text-white space-y-2">
              <p>
                <strong>Transaction:</strong> {result.txHash}
              </p>
              <p>Now you can finalize the transfer to receive the NFT.</p>
            </div>
          ),
          confirmText: "OK",
        });
        
        // Refresh status
        const newStatus = await getEscrowStatus(escrowAddress);
        setStatus(newStatus);
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

  const handleFinalize = async () => {
    const confirmed = confirm(
      `Finalize this purchase?\n\n` +
      `This will:\n` +
      `- Transfer ${details?.price} ETH to seller\n` +
      `- Transfer NFT to you\n\n` +
      `Continue?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await finalizeEscrow(escrowAddress);

      if (result.success) {
        await transactionStatus(
          escrowAddress,
          "completed"
        );

        try {
          const updateOwner = await updateFullOwnerAddress(
              details.tokenId,
              details.buyer.toLowerCase(),
              user?.name || "",
              user?.nic || ""
            );
          console.log("Owner address updated in DB:", updateOwner);
        } catch (err) {
          console.error("Failed to update owner address in DB:", err);
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
        onClose();
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

  const shortAddress = (addr: string) =>
    addr && addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  if (!isOpen) return null;

  return (
    <div
      className="z-[60] flex items-center justify-center w-full h-full"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaShoppingCart className="text-blue-700" size={18} />
            </div>
            <h2 className="text-xl font-bold text-[#00420A]">Purchase Property</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 transition">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Escrow Details */}
          {details && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-sm font-semibold text-gray-800 mb-3">Escrow Details</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Escrow Address:</span>
                  <span className="font-mono text-xs">{shortAddress(escrowAddress)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-mono text-xs">{shortAddress(details.seller)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-gray-900">{details.price} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID:</span>
                  <span className="font-semibold">#{details.tokenId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Progress */}
          {status && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-sm font-semibold text-blue-800 mb-3">Transaction Progress</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status.isSellerDeposited ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {status.isSellerDeposited && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${status.isSellerDeposited ? "text-green-700" : "text-gray-500"}`}>
                      Seller Deposited NFT
                    </div>
                    <div className="text-xs text-gray-500">
                      {status.isSellerDeposited ? "Completed" : "Waiting..."}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status.isBuyerDeposited ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {status.isBuyerDeposited && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${status.isBuyerDeposited ? "text-green-700" : "text-gray-900"}`}>
                      You Deposit Payment
                    </div>
                    <div className="text-xs text-gray-500">
                      {status.isBuyerDeposited ? "Completed" : "Your turn"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    status.isFinalized ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {status.isFinalized && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${status.isFinalized ? "text-green-700" : "text-gray-500"}`}>
                      Finalize Transfer
                    </div>
                    <div className="text-xs text-gray-500">
                      {status.isFinalized ? "Completed" : "After payment"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          {status && !status.isSellerDeposited && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <IoInformationCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-yellow-800">
                Waiting for seller to deposit the NFT. You can deposit payment once the seller completes their part.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Deposit Payment Button */}
            {status && !status.isBuyerDeposited && !status.isFinalized && (
              <button
                onClick={handleDepositPayment}
                disabled={loading || !status.isSellerDeposited}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  loading || !status.isSellerDeposited
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Depositing..." : `Deposit ${details?.price} ETH`}
              </button>
            )}

            {/* Finalize Button */}
            {status && status.isBuyerDeposited && status.isSellerDeposited && !status.isFinalized && (
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
            )}

            {status && status.isFinalized && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <div className="text-sm font-semibold text-green-800">Purchase Complete!</div>
                <div className="text-xs text-gray-600 mt-1">You now own this property</div>
              </div>
            )}
          </div>

          {status && !status.isFinalized && (
            <div className="text-xs text-gray-500 text-center">
              Need help? Contact support or check the transaction on block explorer
            </div>
          )}
        </div>

        <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700" />
      </div>
    </div>
  );
};

export default BuyerEscrowPopup;