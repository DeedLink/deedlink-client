import { useEffect, useState } from "react";
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useWallet } from "../../../contexts/WalletContext";
import { useToast } from "../../../contexts/ToastContext";
import { getRentDetails, payRent } from "../../../web3.0/rentIntegration";
import { shortAddress } from "../../../utils/format";

interface GetRentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
}

const GetRentPopup: React.FC<GetRentPopupProps> = ({ isOpen, onClose, tokenId }) => {
  const { account } = useWallet();
  const { showToast } = useToast();
  const [rentDetails, setRentDetails] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRentDetails = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const res = await getRentDetails(tokenId);
        setRentDetails(res);
      } catch (error) {
        console.error("Error loading rent details:", error);
        setRentDetails(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadRentDetails();
    const interval = setInterval(loadRentDetails, 5000);
    return () => clearInterval(interval);
  }, [isOpen, tokenId]);

  if (!isOpen) return null;

  const handlePayRent = async () => {
    if (!rentDetails || !rentDetails.canPay) return;
    setIsPaying(true);
    try {
      const res = await payRent(tokenId, rentDetails.rentAmount);
      showToast(res?.message || "Rent payment successful", "success");
      const updated = await getRentDetails(tokenId);
      setRentDetails(updated);
    } catch (error: any) {
      showToast(error.message || "Payment failed", "error");
    } finally {
      setIsPaying(false);
    }
  };

  const isReceiver = account && rentDetails?.receiver?.toLowerCase() === account.toLowerCase();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50 text-black">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Rent Details
        </h2>

        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Loading rent details...</p>
        ) : !rentDetails || rentDetails.rentAmount === "0.0" ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No rent is currently set for this property.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Rent Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {rentDetails.rentAmount} ETH
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Payment Period</span>
                <span className="text-sm font-semibold text-gray-900">
                  {rentDetails.rentPeriodMonths?.toFixed(1) || (rentDetails.rentPeriodDays / 30).toFixed(1)} months
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Receiver (Landlord)</span>
                <span className="text-sm font-mono text-gray-900">
                  {shortAddress(rentDetails.receiver)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Last Paid</span>
                <span className="text-sm text-gray-900">
                  {new Date(Number(rentDetails.lastPaid) * 1000).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Next Payment Due</span>
                <span className="text-sm text-gray-900">
                  {new Date(Number(rentDetails.nextPaymentDue) * 1000).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <div className="flex items-center gap-2">
                  {rentDetails.isActive ? (
                    <>
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-sm font-semibold text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="text-yellow-500" />
                      <span className="text-sm font-semibold text-yellow-600">Expired</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isReceiver && rentDetails.canPay && (
              <button
                disabled={isPaying}
                onClick={handlePayRent}
                className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition ${
                  isPaying 
                    ? "bg-green-400 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isPaying ? "Processing Payment..." : `Pay ${rentDetails.rentAmount} ETH`}
              </button>
            )}

            {isReceiver && !rentDetails.canPay && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  Next payment is not due yet. Payment due: {new Date(Number(rentDetails.nextPaymentDue) * 1000).toLocaleDateString()}
                </p>
              </div>
            )}

            {!isReceiver && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  You are not the designated tenant. Only {shortAddress(rentDetails.receiver)} can pay rent.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetRentPopup;
