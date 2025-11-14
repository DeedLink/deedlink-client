import { FaFileSignature } from "react-icons/fa";
import type { IDeed } from "../../../types/responseDeed";

interface DeedHeaderProps {
  deed: IDeed;
  numberOfFT: number;
}

const DeedHeader = ({ deed, numberOfFT }: DeedHeaderProps) => {
  return (
    <div className="bg-emerald-600 p-6 flex items-center justify-between">
      <div className="flex items-center gap-3 text-white">
        <FaFileSignature size={32} />
        <div>
          <h1 className="text-3xl font-bold">Deed #{deed.deedNumber}</h1>
          <p className="text-emerald-100 mt-1">
            {deed.deedType.deedType} • {deed.district}, {deed.division}
          </p>
        </div>
      </div>
      <div className="text-white">
        Fractional tokens: {numberOfFT}
      </div>
    </div>
  );
};

export default DeedHeader;