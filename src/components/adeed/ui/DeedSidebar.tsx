import { useState } from "react";
import { FaCalendarAlt, FaMapMarkedAlt, FaExpand } from "react-icons/fa";
import DeedStats from "./DeedStats";
import SignaturesCard from "./SignaturesCard";
import type { IDeed } from "../../../types/responseDeed";
import type { Plan } from "../../../types/plan";
import { getCenterOfLocations } from "../../../utils/functions";
import { timeAgo } from "../../../utils/format";
import MapPreview from "../../deeds/MapPreview";
import MapPopup from "../../deeds/MapPopup";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

interface DeedSidebarProps {
  deed: IDeed;
  plan: Plan;
  signatures: ISignatures | null;
}

const DeedSidebar = ({ deed, plan, signatures }: DeedSidebarProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const centerLocation = getCenterOfLocations(deed.location);

  const formatDate = (date: Date | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <aside className="space-y-6">
        <DeedStats deed={deed} />

        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <FaCalendarAlt className="text-emerald-700" />
            <h3 className="font-bold text-gray-900">Registered</h3>
          </div>
          <div className="text-gray-700 font-medium">
            {formatDate(deed.registrationDate)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {timeAgo(deed.timestamp)}
          </div>
        </div>

        {signatures && <SignaturesCard signatures={signatures} deed={deed} />}

        {deed.tokenId !== undefined && (
          <div className="rounded-xl border border-gray-200 p-5 bg-white">
            <div className="text-xs text-gray-600 uppercase font-semibold">Token ID</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">#{deed.tokenId}</div>
          </div>
        )}

        {((deed.location && deed.location.length > 0) || (plan?.coordinates && plan.coordinates.length > 0)) && (
          <section className="rounded-xl border border-gray-200 p-5 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <FaMapMarkedAlt className="text-emerald-700" size={20} />
              <h3 className="font-bold text-gray-900">Map View</h3>
            </div>
            <div className="relative group h-fit w-full rounded-lg border border-gray-200 overflow-hidden">
              <MapPreview points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location} />
              <button
                onClick={() => setIsMapOpen(true)}
                className="absolute top-3 right-3 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2 border border-gray-200"
              >
                <FaExpand size={14} className="text-emerald-700" />
                <span className="text-sm font-semibold text-emerald-700">Expand</span>
              </button>
            </div>
          </section>
        )}

        {centerLocation && (
          <div className="rounded-xl border border-gray-200 p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <FaMapMarkedAlt className="text-emerald-700" />
              <h3 className="font-bold text-gray-900">Center Location</h3>
            </div>
            <div className="text-gray-700 font-mono text-sm bg-gray-50 rounded-lg p-3">
              <div>Lat: {centerLocation.latitude.toFixed(6)}</div>
              <div className="mt-1">Lng: {centerLocation.longitude.toFixed(6)}</div>
            </div>
          </div>
        )}
      </aside>

      <MapPopup
        points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
    </>
  );
};

export default DeedSidebar;