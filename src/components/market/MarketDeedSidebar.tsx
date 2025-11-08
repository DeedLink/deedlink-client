import { FaCalendarAlt, FaMapMarkedAlt, FaExpand } from "react-icons/fa";
import { formatCurrency, formatNumber, timeAgo } from "../../utils/format";
import type { IDeed } from "../../types/responseDeed";
import type { Plan } from "../../types/plan";
import MapPreview from "../deeds/MapPreview";
import { getCenterOfLocations } from "../../utils/functions";

interface MarketDeedSidebarProps {
  deed: IDeed;
  plan: Plan;
  latestValue: number;
  onMapExpand: () => void;
}

const MarketDeedSidebar: React.FC<MarketDeedSidebarProps> = ({
  deed,
  plan,
  latestValue,
  onMapExpand,
}) => {
  const centerLocation = getCenterOfLocations(deed.location);

  const getLandTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("paddy")) return "🌾";
    if (lowerType.includes("highland")) return "🌲";
    if (lowerType.includes("residential")) return "🏘️";
    return "🏞️";
  };

  const getLandTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("paddy")) return "bg-green-100 text-green-800";
    if (lowerType.includes("highland")) return "bg-yellow-100 text-yellow-800";
    if (lowerType.includes("residential")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasMap = (deed.location && deed.location.length > 0) || (plan?.coordinates && plan.coordinates.length > 0);

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-indigo-200/50 p-5 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-xs text-indigo-600 uppercase font-semibold">Estimated Value</div>
        <div className="text-3xl font-bold text-indigo-900 mt-2">
          {formatCurrency(latestValue, "USD")}
        </div>
        
        <div className="mt-5 text-xs text-indigo-600 uppercase font-semibold">Area</div>
        <div className="text-3xl font-bold text-indigo-900 mt-2">
          {formatNumber(deed.landArea)} {deed.landSizeUnit || "m²"}
        </div>
        
        <div className="mt-5 text-xs text-indigo-600 uppercase font-semibold">Land Type</div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs 3xl:text-base mt-2 ${getLandTypeColor(deed.landType)}`}>
          <span className="text-xl">{getLandTypeIcon(deed.landType)}</span>
          <span className="capitalize">{deed.landType}</span>
        </div>
      </div>

      <div className="rounded-xl border border-indigo-200/50 p-5 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <FaCalendarAlt className="text-indigo-700" />
          <h3 className="font-bold text-gray-900">Registered</h3>
        </div>
        <div className="text-gray-700 font-medium">
          {formatDate(deed.registrationDate)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {timeAgo(deed.timestamp)}
        </div>
      </div>

      {deed.tokenId !== undefined && (
        <div className="rounded-xl border border-indigo-200/50 p-5 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="text-xs text-indigo-600 uppercase font-semibold">Token ID</div>
          <div className="text-2xl font-bold text-indigo-900 mt-2">#{deed.tokenId}</div>
        </div>
      )}

      {hasMap && (
        <section className="rounded-xl border border-indigo-200/50 p-5 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <FaMapMarkedAlt className="text-indigo-700" size={20} />
            <h3 className="font-bold text-gray-900">Map View</h3>
          </div>
          <div className="relative group h-fit w-full rounded-lg border border-indigo-200 overflow-hidden">
            <MapPreview points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location} />
            <button
              onClick={onMapExpand}
              className="absolute top-3 right-3 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              <FaExpand size={14} className="text-indigo-700" />
              <span className="text-sm font-semibold text-indigo-700">Expand</span>
            </button>
          </div>
        </section>
      )}

      {centerLocation && (
        <div className="rounded-xl border border-indigo-200/50 p-5 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <FaMapMarkedAlt className="text-indigo-700" />
            <h3 className="font-bold text-gray-900">Center Location</h3>
          </div>
          <div className="text-gray-700 font-mono text-sm bg-white rounded-lg p-3">
            <div>Lat: {centerLocation.latitude.toFixed(6)}</div>
            <div className="mt-1">Lng: {centerLocation.longitude.toFixed(6)}</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default MarketDeedSidebar;

