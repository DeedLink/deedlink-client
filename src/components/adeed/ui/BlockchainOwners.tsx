import { FaUserShield } from "react-icons/fa";
import type { IDeed } from "../../../types/responseDeed";
import { shortAddress } from "../../../utils/format";

interface BlockchainOwnersProps {
  deed: IDeed;
}

const BlockchainOwners = ({ deed }: BlockchainOwnersProps) => {
  return (
    <section className="rounded-xl border border-gray-200 p-5 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <FaUserShield className="text-emerald-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Blockchain Owners</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {deed.owners.map((o, idx) => (
          <div key={idx} className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-200 font-semibold">
            {shortAddress(o.address)} • {o.share}%
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlockchainOwners;