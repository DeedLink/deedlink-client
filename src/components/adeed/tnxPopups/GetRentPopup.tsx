import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useToast } from "../../../contexts/ToastContext";
import { getRentDetails, payRent } from "../../../web3.0/rentIntegration";

interface GetRentPopupProps {
  isOpen: boolean;
  tokenId: number;
  onClose: () => void;
}

const GetRentPopup = ({ isOpen, tokenId, onClose }: GetRentPopupProps) => {
  const { showToast } = useToast();

  const [rentDetails, setRentDetails] = useState<{
    rentAmount: string;
    rentPeriodDays: number;
    receiver: string;
    lastPaid: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const data = await getRentDetails(tokenId);
        setRentDetails(data);
      } catch (err: any) {
        showToast("Failed to fetch rent details", "error");
      }
    })();
  }, [isOpen, tokenId]);

  const handlePayRent = async () => {
    if (!rentDetails) return;
    setLoading(true);
    try {
      const res = await payRent(tokenId, rentDetails.rentAmount);
      showToast(res.message, "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Rent payment failed", "error");
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
          <h2 className="text-xl font-bold text-gray-800">Pay Rent</h2>
          <button onClick={onClose}>
            <IoClose size={24} className="text-gray-600 hover:text-black" />
          </button>
        </div>

        {rentDetails ? (
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>Rent Amount:</strong> {rentDetails.rentAmount} ETH
            </div>
            <div>
              <strong>Rent Period:</strong> {rentDetails.rentPeriodDays} days
            </div>
            <div>
              <strong>Receiver:</strong> {rentDetails.receiver.slice(0, 6)}...
              {rentDetails.receiver.slice(-4)}
            </div>
            <div>
              <strong>Last Paid:</strong>{" "}
              {Number(rentDetails.lastPaid) > 0
                ? new Date(Number(rentDetails.lastPaid) * 1000).toLocaleString()
                : "Never"}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            No rent details found for this property.
          </p>
        )}

        <button
          onClick={handlePayRent}
          disabled={loading || !rentDetails}
          className={`w-full py-3 rounded-xl font-semibold text-white ${
            loading || !rentDetails
              ? "bg-gray-400"
              : "bg-gradient-to-r from-yellow-600 to-amber-600 hover:shadow-lg"
          }`}
        >
          {loading ? "Processing..." : "Pay Rent"}
        </button>
      </div>
    </div>
  );
};

export default GetRentPopup;
