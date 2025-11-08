import { FaUserShield } from "react-icons/fa";
import { shortAddress } from "../../utils/format";
import type { IDeed } from "../../types/responseDeed";

interface BlockchainOwnersSectionProps {
  deed: IDeed;
}

const BlockchainOwnersSection: React.FC<BlockchainOwnersSectionProps> = ({ deed }) => {
  return (
    <section className="rounded-xl border border-indigo-200/50 p-5 bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <FaUserShield className="text-indigo-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Blockchain Owners</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {deed.owners.map((o, idx) => (
          <div key={idx} className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 border-2 border-indigo-200 font-semibold">
            {shortAddress(o.address)} • {o.share}%
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlockchainOwnersSection;

