import type { IDeed } from "../../../types/responseDeed";
import { formatCurrency, formatNumber } from "../../../utils/format";

interface DeedStatsProps {
  deed: IDeed;
}

const DeedStats = ({ deed }: DeedStatsProps) => {
  const latestValue = deed?.valuation && deed.valuation.length > 0
    ? deed.valuation.slice().sort((a, b) => b.timestamp - a.timestamp)[0]?.estimatedValue || 0
    : 0;

  const getLandTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("paddy")) return "🌾";
    if (lowerType.includes("highland")) return "🌲";
    if (lowerType.includes("residential")) return "🏘️";
    return "🏞️";
  };

  const getLandTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("paddy")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (lowerType.includes("highland")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (lowerType.includes("residential")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="rounded-xl border border-gray-200 p-5 bg-white">
      <div className="text-xs text-gray-600 uppercase font-semibold">Estimated Value</div>
      <div className="text-3xl font-bold text-gray-900 mt-2">
        {formatCurrency(latestValue, "ETH")}
      </div>
      
      <div className="mt-5 text-xs text-gray-600 uppercase font-semibold">Area</div>
      <div className="text-3xl font-bold text-gray-900 mt-2">
        {formatNumber(deed.landArea)} {deed.landSizeUnit || "m²"}
      </div>
      
      <div className="mt-5 text-xs text-gray-600 uppercase font-semibold">Land Type</div>
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs mt-2 border-2 ${getLandTypeColor(deed.landType)}`}>
        <span className="text-xl">{getLandTypeIcon(deed.landType)}</span>
        <span className="capitalize">{deed.landType}</span>
      </div>
    </div>
  );
};

export default DeedStats;