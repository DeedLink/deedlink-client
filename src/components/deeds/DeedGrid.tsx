import type { Deed } from "../../types/types";
import DeedCard from "./DeedCard";

interface Props {
  deeds: Deed[];
  currentUser: string;
  onOpen: (d: Deed) => void;
}

const DeedGrid = ({ deeds, currentUser, onOpen }: Props) => {
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
        <DeedCard key={d._id} deed={d} currentUser={currentUser} onOpen={onOpen} />
      ))}
    </div>
  );
};

export default DeedGrid;
