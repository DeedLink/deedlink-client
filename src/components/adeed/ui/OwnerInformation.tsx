import { FaUserShield } from "react-icons/fa";
import type { IDeed } from "../../../types/responseDeed";

interface OwnerInformationProps {
  deed: IDeed;
}

const OwnerInformation = ({ deed }: OwnerInformationProps) => {
  return (
    <section className="rounded-xl border border-gray-200 p-5 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <FaUserShield className="text-emerald-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Owner Information</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Full Name</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerFullName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">NIC</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerNIC}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Phone</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerPhone}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Address</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerAddress}</div>
        </div>
      </div>
    </section>
  );
};

export default OwnerInformation;