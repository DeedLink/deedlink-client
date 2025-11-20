import type { IDeed } from "../../types/responseDeed";
import DeedCard from "./DeedCard";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

interface Props {
  deeds: IDeed[];
  currentUser: string;
  onOpen: (d: IDeed) => void;
  deedSignatures: Map<string, ISignatures>;
}

const DeedGrid = ({ deeds, currentUser, onOpen, deedSignatures }: Props) => {
  if (deeds.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
        <p className="text-2xl font-semibold text-gray-700">No deeds found</p>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {deeds.map((d) => (
        <DeedCard 
          key={d._id} 
          deed={d} 
          currentUser={currentUser} 
          currency="ETH" 
          onOpen={onOpen}
          signatures={deedSignatures.get(d._id)}
        />
      ))}
    </div>
  );
};

export default DeedGrid;