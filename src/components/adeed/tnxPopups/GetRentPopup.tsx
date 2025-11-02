import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
//import { useWallet } from "../../../contexts/WalletContext";
import { useToast } from "../../../contexts/ToastContext";
import { getRentDetails, payRent } from "../../../web3.0/rentIntegration";
import { ethers } from "ethers";

interface GetRentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
}

const GetRentPopup: React.FC<GetRentPopupProps> = ({ isOpen, onClose, tokenId }) => {
  //const { account } = useWallet();
  const { showToast } = useToast();
  const [rentDetails, setRentDetails] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const loadRentDetails = async () => {
      try {
        const res = await getRentDetails(tokenId);
        setRentDetails(res);
      } catch (error) {
        console.error("Error loading rent details:", error);
      }
    };
    if (isOpen) loadRentDetails();
  }, [isOpen, tokenId]);

  if (!isOpen) return null;

  const handlePayRent = async () => {
    if (!rentDetails) return;
    setIsPaying(true);
    try {
      const res = await payRent(tokenId, rentDetails.amount);
      showToast(res?.message || "Rent payment successful", "success");
      onClose();
    } catch (error: any) {
      showToast(error.message || "Payment failed", "error");
    } finally {
      setIsPaying(false);
    }
  };

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

        {rentDetails ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              <strong>Landlord:</strong> {rentDetails.owner}
            </div>
            <div className="text-sm text-gray-700">
              <strong>Tenant:</strong> {rentDetails.tenant}
            </div>
            <div className="text-sm text-gray-700">
              <strong>Amount:</strong> {ethers.formatEther(rentDetails.amount)} LKR
            </div>
            <div className="text-sm text-gray-700">
              <strong>Duration:</strong> {rentDetails.duration} months
            </div>
            <button
              disabled={isPaying}
              onClick={handlePayRent}
              className={`w-full mt-5 py-2 rounded-lg text-white font-semibold transition ${
                isPaying ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isPaying ? "Processing..." : "Pay Rent"}
            </button>
          </div>
        ) : (
          <p className="text-gray-500 text-center">Loading rent details...</p>
        )}
      </div>
    </div>
  );
};

export default GetRentPopup;
