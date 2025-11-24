import { useEffect, useState } from "react";
import type { Rent } from "../../types/rent";
import { getRentDetails, endRent } from "../../web3.0/rentIntegration";
import { shortAddress } from "../../utils/format";
import { FaEthereum, FaClock, FaMoneyBillWave, FaUserAlt, FaTimesCircle } from "react-icons/fa";
import { useWallet } from "../../contexts/WalletContext";
import { useToast } from "../../contexts/ToastContext";
import { useLoader } from "../../contexts/LoaderContext";
import { hasFullOwnership, isPropertyFractionalized } from "../../web3.0/contractService";

const RentUI = ({ tokenId }: { tokenId: number }) => {
  const [rentDetails, setRentDetails] = useState<any>(null);
  const [isEnding, setIsEnding] = useState(false);
  const { account } = useWallet();
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  const fetchRentDetails = async (): Promise<void> => {
    if (!tokenId) return;
    try {
      const rent = await getRentDetails(tokenId);
      setRentDetails(rent);
    } catch (error) {
      console.error(error);
      setRentDetails(null);
    }
  };

  useEffect(() => {
    fetchRentDetails();
    const interval = setInterval(fetchRentDetails, 10000);
    return () => clearInterval(interval);
  }, [tokenId]);

  const handleEndRent = async () => {
    if (!tokenId || !account) return;
    
    try {
      setIsEnding(true);
      showLoader();
      
      const isFractionalized = await isPropertyFractionalized(tokenId);
      if (isFractionalized) {
        const hasFull = await hasFullOwnership(tokenId, account);
        if (!hasFull) {
          showToast("You must own 100% of the fractional tokens to end rent", "error");
          return;
        }
      }
      
      const res = await endRent(tokenId);
      showToast(res?.message || "Rent ended successfully", "success");
      await fetchRentDetails();
    } catch (error: any) {
      showToast(error.message || "Failed to end rent", "error");
    } finally {
      setIsEnding(false);
      hideLoader();
    }
  };

  if (rentDetails === null || rentDetails?.receiver === "0x0000000000000000000000000000000000000000" || rentDetails?.rentAmount === "0.0") {
    return null;
  }

  if (!rentDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
        <FaClock className="text-lg mb-1" />
        <p>Loading rent details...</p>
      </div>
    );
  }

  const isOwner = account && tokenId;
  const canEndRent = isOwner && rentDetails.rentAmount !== "0.0";

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaMoneyBillWave className="text-green-600" />
          Rent Overview
        </h3>
        {canEndRent && (
          <button
            onClick={handleEndRent}
            disabled={isEnding}
            className="text-xs px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition flex items-center gap-1 disabled:opacity-50"
          >
            <FaTimesCircle size={12} />
            {isEnding ? "Ending..." : "End Rent"}
          </button>
        )}
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600 font-medium">
            <FaEthereum className="text-indigo-500" /> Amount
          </span>
          <span className="text-gray-900 font-semibold">
            {rentDetails.rentAmount} ETH
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600 font-medium">
            <FaClock className="text-yellow-500" /> Period
          </span>
          <span className="text-gray-900 font-semibold">
            {rentDetails.rentPeriodMonths?.toFixed(1) || (Number(rentDetails.rentPeriodDays) / 30).toFixed(1)} Months
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600 font-medium">
            <FaClock className="text-blue-500" /> Last Paid
          </span>
          <span className="text-gray-900">
            {new Date(Number(rentDetails.lastPaid) * 1000).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {rentDetails.nextPaymentDue && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600 font-medium">
              <FaClock className="text-orange-500" /> Next Due
            </span>
            <span className="text-gray-900">
              {new Date(Number(rentDetails.nextPaymentDue) * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600 font-medium">
            <FaUserAlt className="text-purple-500" /> Receiver
          </span>
          <span className="text-gray-900 font-semibold">
            {shortAddress(rentDetails.receiver)}
          </span>
        </div>

        {rentDetails.isActive !== undefined && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Status</span>
              <span className={`text-xs font-semibold ${rentDetails.isActive ? 'text-green-600' : 'text-yellow-600'}`}>
                {rentDetails.isActive ? 'Active' : 'Expired'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentUI;
