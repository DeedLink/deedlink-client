import { useState } from "react";
import { FaTimes } from "react-icons/fa";
//import { useWallet } from "../../../contexts/WalletContext";
import { useToast } from "../../../contexts/ToastContext";
import { setRent } from "../../../web3.0/rentIntegration";

interface GiveRentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
}

const GiveRentPopup: React.FC<GiveRentPopupProps> = ({ isOpen, onClose, tokenId }) => {
  //const { account } = useWallet();
  const { showToast } = useToast();

  const [tenantAddress, setTenantAddress] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSetRent = async () => {
    if (!tenantAddress || !rentAmount || !duration) {
      showToast("Please fill all fields", "error");
      return;
    }

    setIsSubmitting(true);
    console.log({        tokenId,
        tenantAddress,
        rentAmount,
        duration});
    try {
      const res = await setRent(
        tokenId,
        rentAmount,
        parseInt(duration),
        tenantAddress
      );
      showToast(res?.message || "Rent successfully set!", "success");
      onClose();
    } catch (error: any) {
      console.log(error.message)
      showToast(error.message || "Failed to set rent", "error");
    } finally {
      setIsSubmitting(false);
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
          Set Rent for Property
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Tenant Address</label>
            <input
              type="text"
              value={tenantAddress}
              onChange={(e) => setTenantAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0x1234..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Rent Amount (LKR)</label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 25000"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Duration (Months)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 12"
            />
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleSetRent}
            className={`w-full mt-4 py-2 rounded-lg text-white font-semibold transition ${
              isSubmitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Setting..." : "Set Rent"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveRentPopup;
