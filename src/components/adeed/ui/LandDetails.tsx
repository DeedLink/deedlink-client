import { FaMapMarkedAlt } from "react-icons/fa";
import type { IDeed } from "../../../types/responseDeed";

interface LandDetailsProps {
  deed: IDeed;
}

const LandDetails = ({ deed }: LandDetailsProps) => {
  return (
    <section className="rounded-xl border border-gray-200 p-5 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <FaMapMarkedAlt className="text-emerald-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Land Details</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Title Number</div>
          <div className="font-medium text-gray-800 mt-1">{deed.landTitleNumber}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Land Address</div>
          <div className="font-medium text-gray-800 mt-1">{deed.landAddress}</div>
        </div>
        {deed.surveyPlanNumber && (
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500 uppercase font-semibold">Survey Plan Number</div>
            <div className="font-medium text-gray-800 mt-1">{deed.surveyPlanNumber}</div>
          </div>
        )}
        {deed.boundaries && (
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500 uppercase font-semibold">Boundaries</div>
            <div className="font-medium text-gray-800 mt-1">{deed.boundaries}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LandDetails;