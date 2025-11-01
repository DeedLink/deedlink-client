import {
  FaFileSignature,
  FaMapMarkerAlt,
  FaRegClock,
  FaCoins,
  FaExpand,
  FaCheckCircle,
} from "react-icons/fa";
import {
  formatCurrency,
  formatNumber,
  timeAgo,
} from "../../utils/format";
import ShareBadge from "./ShareBadge";
import OwnerChips from "./OwnerChips";
import type { IDeed } from "../../types/responseDeed";
import { getCenterOfLocations } from "../../utils/functions";
import { useEffect, useState } from "react";
import { getTransactionsByDeedId } from "../../api/api";
import type { Title } from "../../types/title";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

export interface DeedCardProps {
  deed: IDeed;
  currentUser: string;
  onOpen: (deed: IDeed) => void;
  currency?: string;
  areaUnit?: "m²" | "perch" | "acre";
  signatures?: ISignatures;
}

const DeedCard = ({
  deed,
  currentUser,
  onOpen,
  currency = "USD",
  areaUnit = "m²",
  signatures,
}: DeedCardProps) => {
  const myShare =
    deed.owners.find(
      (o) => o.address.toLowerCase() === currentUser.toLowerCase()
    )?.share ?? 0;
  
  const [state, setState] = useState<"pending" | "completed" | "failed">("completed");
  const [titles, setTitles] = useState<Title[]>([]);

  const getTransactions = async () => {
      if (deed._id) {
        const tnx = await getTransactionsByDeedId(deed._id);
        if (tnx && tnx.length) {
          const sortedTnx = tnx.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
  
          setTitles(sortedTnx);
          console.log(sortedTnx);
        }
      } else {
        console.log("Deed ID not found", "error");
      }
    };
  
  useEffect(()=>{
    getTransactions();
  },[deed]);

  useEffect(()=>{
    if(titles[0]){
      console.log(titles[0].status);
      setState(titles[0].status);
    }
  },[titles])

  const centerLocation = getCenterOfLocations(deed.location);

  const latestValue = deed.valuation && deed.valuation.length > 0
    ? deed.valuation.slice().sort((a, b) => b.timestamp - a.timestamp)[0]?.estimatedValue || 0
    : 0;

  const getLandTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("paddy")) return "🌾";
    if (lowerType.includes("highland")) return "🌲";
    if (lowerType.includes("residential")) return "🏘️";
    return "🏞️";
  };

  return (
    <div className="group rounded-2xl shadow border border-black/5 hover:shadow-xl transition overflow-hidden flex flex-col justify-between" style={{backgroundColor: `${state==="pending" ? "#FFCFE5": "white"}`}}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FaFileSignature className="text-green-700 flex-shrink-0" />
              <h3 className="font-semibold text-[#00420A] truncate">
                Deed #{deed.deedNumber}
              </h3>
              {
                state==="pending" && (
                  <div className="text-white bg-blue-500 px-2 rounded-md">Sale Pending</div>
                )
              }
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {deed.deedType.deedType}
            </p>
            {signatures?.fully && (
              <div className="flex items-center gap-1 mt-1">
                <FaCheckCircle className="text-green-600" size={12} />
                <span className="text-xs text-green-600 font-medium">Fully Signed</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onOpen(deed)}
            className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2 cursor-pointer flex-shrink-0"
            title="Open details"
          >
            <FaExpand /> View
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-black">
          <div>
            <div className="text-xs text-gray-500">Estimated Value</div>
            <div className="font-semibold">
              {formatCurrency(latestValue, currency)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Area</div>
            <div className="font-semibold">
              {formatNumber(deed.landArea)} {deed.landSizeUnit || areaUnit}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Land Type</div>
            <div className="font-semibold capitalize flex items-center gap-1">
              <span>{getLandTypeIcon(deed.landType)}</span>
              <span className="truncate">{deed.landType ?? "Unknown"}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="font-semibold text-sm truncate">
              {deed.district}, {deed.division}
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-xs text-gray-500">Owners</div>
            <OwnerChips owners={deed.owners} />
          </div>

          {centerLocation && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">
                {centerLocation.longitude.toFixed(4)}, {centerLocation.latitude.toFixed(4)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <FaRegClock className="text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {timeAgo(deed.timestamp)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCoins className="text-yellow-600" />
            <span className="text-sm text-gray-700">My Share</span>
          </div>
          <ShareBadge share={myShare} />
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
    </div>
  );
};

export default DeedCard;