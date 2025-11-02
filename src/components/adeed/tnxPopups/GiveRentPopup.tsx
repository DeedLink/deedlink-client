import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useToast } from "../../../contexts/ToastContext";
import { useWallet } from "../../../contexts/WalletContext";
import { setRent } from "../../../web3.0/rentIntegration";

interface GiveRentPopupProps {
  isOpen: boolean;
  tokenId: number;
  onClose: () => void;
}

const GiveRentPopup = ({ isOpen, tokenId, onClose }: GiveRentPopupProps) => {
  const { account } = useWallet();
  const { showToast } = useToast();

  const [rentAmount, setRentAmountValue] = useState("");
  const [rentPeriod, setRentPeriod] = useState("");
  const [receiver, setReceiver] = useState(account || "");
  const [loading, setLoading] = useState(false);

  const handleSetRent = async () => {
    if (!rentAmount || !rentPeriod || !receiver)
      return showToast("Please fill all fields", "info");

    try {
      setLoading(true);
      const result = await setRent(tokenId, rentAmount, Number(rentPeriod), receiver);
      showToast(result.message, "success");
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to set rent", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">Set Rent Details</h2>
          <button onClick={onClose}>
            <IoClose size={24} className="text-gray-600 hover:text-black" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rent Amount (ETH)
            </label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmountValue(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="0.05"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rent Period (Days)
            </label>
            <input
              type="number"
              value={rentPeriod}
              onChange={(e) => setRentPeriod(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rent Receiver Address
            </label>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="0x..."
            />
          </div>
        </div>

        <button
          onClick={handleSetRent}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-yellow-600 to-amber-600 hover:shadow-lg"
          }`}
        >
          {loading ? "Setting Rent..." : "Set Rent"}
        </button>
      </div>
    </div>
  );
};

export default GiveRentPopup;
