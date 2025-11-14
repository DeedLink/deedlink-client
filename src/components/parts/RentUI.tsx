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
      if (rent) setRentDetails(rent);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRentDetails();
  }, [tokenId]);

  if(rentDetails === null || rentDetails?.receiver === "0x0000000000000000000000000000000000000000") {
    return;
  }

  if (!rentDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
        <FaClock className="text-lg mb-1" />
        <p>Loading rent details...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FaMoneyBillWave className="text-green-600" />
        Rent Overview
      </h3>

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
            {Number(rentDetails.rentPeriodDays)} Months
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

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-600 font-medium">
            <FaUserAlt className="text-purple-500" /> Receiver
          </span>
          <span className="text-gray-900 font-semibold">
            {shortAddress(rentDetails.receiver)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RentUI;
