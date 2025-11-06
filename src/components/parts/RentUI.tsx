import { useEffect, useState } from "react";
import type { Rent } from "../../types/rent";
import { getRentDetails } from "../../web3.0/rentIntegration";
import { shortAddress } from "../../utils/format";
import { FaEthereum, FaClock, FaMoneyBillWave, FaUserAlt } from "react-icons/fa";

const RentUI = ({ tokenId }: { tokenId: number }) => {
  const [rentDetails, setRentDetails] = useState<Rent>();

  const fetchRentDetails = async (): Promise<void> => {
    if (!tokenId) return;
    try {
      const rent = await getRentDetails(tokenId);
      console.log("Rent: ", rent);
      if (rent) setRentDetails(rent);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRentDetails();
  }, [tokenId]);

  if (!rentDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 animate-pulse">
        <FaClock className="text-2xl mb-2" />
        <p>Loading rent details...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center flex items-center justify-center gap-2">
        <FaMoneyBillWave className="text-green-600 dark:text-green-400" />
        Rent Overview
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
            <FaEthereum className="text-indigo-500" /> Amount
          </span>
          <span className="text-gray-900 dark:text-gray-100 font-semibold">
            {rentDetails.rentAmount} ETH
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
            <FaClock className="text-yellow-500" /> Period
          </span>
          <span className="text-gray-900 dark:text-gray-100 font-semibold">
            {Number(rentDetails.rentPeriodDays)} Months
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
            <FaClock className="text-blue-500" /> Last Paid
          </span>
          <span className="text-gray-900 dark:text-gray-100 text-sm">
            {new Date(Number(rentDetails.lastPaid) * 1000).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
            <FaUserAlt className="text-purple-500" /> Receiver
          </span>
          <span className="text-gray-900 dark:text-gray-100 font-semibold">
            {shortAddress(rentDetails.receiver)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RentUI;
