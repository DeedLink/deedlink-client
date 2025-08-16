import { FaFileSignature, FaMapMarkerAlt, FaRegClock, FaCoins, FaExpand } from "react-icons/fa";
import { formatCurrency, formatNumber, shortAddress, timeAgo } from "../../utils/format";
import ShareBadge from "./ShareBadge";
import OwnerChips from "./OwnerChips";
import type { Deed } from "../../types/types";

export interface DeedCardProps {
  deed: Deed;
  currentUser: string;
  onOpen: (deed: Deed) => void;
  currency?: string;
  areaUnit?: "m²" | "perch" | "acre";
}

const DeedCard = ({ deed, currentUser, onOpen, currency = "USD", areaUnit = "m²" }: DeedCardProps) => {
  const myShare = deed.owners.find((o) => o.address.toLowerCase() === currentUser.toLowerCase())?.share ?? 0;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-black/5 hover:shadow-xl transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FaFileSignature className="text-green-700" />
              <h3 className="font-semibold text-[#00420A]">
                Deed #{deed.deedNumber}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Signed by {shortAddress(deed.signedby)}</p>
          </div>
          <button
            onClick={() => onOpen(deed)}
            className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
            title="Open details"
          >
            <FaExpand /> View
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-xs text-gray-500">Estimated Value</div>
            <div className="font-semibold">{formatCurrency(deed.value, currency)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Area</div>
            <div className="font-semibold">{formatNumber(deed.area)} {areaUnit}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500">Owners</div>
            <OwnerChips owners={deed.owners} />
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {deed.location.latitude.toFixed(4)}, {deed.location.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaRegClock className="text-gray-500" />
            <span className="text-sm text-gray-700">{timeAgo(deed.timestamp)}</span>
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
