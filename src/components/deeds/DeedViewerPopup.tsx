import { IoClose } from "react-icons/io5";
import { FaFileSignature, FaUserShield, FaMapMarkedAlt, FaRoute, FaLayerGroup } from "react-icons/fa";
import { formatCurrency, formatNumber, shortAddress, timeAgo } from "../../utils/format";
import type { Deed } from "../../types/types";

interface Props {
  deed: Deed | null;
  onClose: () => void;
  currency?: string;
  areaUnit?: "m²" | "perch" | "acre";
}

const DeedViewerPopup = ({ deed, onClose, currency = "USD", areaUnit = "m²" }: Props) => {
  if (!deed) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-black/5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaFileSignature className="text-green-700" />
              <h3 className="text-xl font-bold text-[#00420A]">Deed #{deed.deedNumber}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Signed by {shortAddress(deed.signedby)} • {timeAgo(deed.timestamp)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2">
            <IoClose size={20} />
          </button>
        </div>

        <div className="p-5 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-xl border border-black/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaUserShield className="text-green-700" />
                <h4 className="font-semibold">Owners</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {deed.owners.map((o) => (
                  <div key={o.address} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                    {shortAddress(o.address)} • {o.share}%
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-black/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaLayerGroup className="text-green-700" />
                <h4 className="font-semibold">Title History</h4>
              </div>
              <div className="space-y-3 max-h-56 overflow-auto pr-1">
                {deed.title.length === 0 && <p className="text-gray-500 text-sm">No transfers recorded.</p>}
                {deed.title.map((t) => (
                  <div key={t._id} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{shortAddress(t.from)} → {shortAddress(t.to)}</div>
                      <div className="text-gray-500 text-xs">{new Date(t.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-700">{t.share}% share</div>
                      {t.amount > 0 && <div className="text-gray-500 text-xs">{formatCurrency(t.amount)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-black/5 p-4">
              <div className="text-xs text-gray-500">Estimated Value</div>
              <div className="text-lg font-semibold">{formatCurrency(deed.value, currency)}</div>

              <div className="mt-4 text-xs text-gray-500">Area</div>
              <div className="text-lg font-semibold">{formatNumber(deed.area)} {areaUnit}</div>
            </div>

            <div className="rounded-xl border border-black/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaMapMarkedAlt className="text-green-700" />
                <h4 className="font-semibold">Location</h4>
              </div>
              <div className="text-sm text-gray-700">
                Lat {deed.location.latitude.toFixed(6)} <br />
                Lng {deed.location.longitude.toFixed(6)}
              </div>
              <div className="mt-3 h-28 w-full rounded-lg bg-gradient-to-tr from-green-100 to-emerald-50 border border-black/5 flex items-center justify-center text-xs text-emerald-700">
                Map preview
              </div>
            </div>

            <div className="rounded-xl border border-black/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaRoute className="text-green-700" />
                <h4 className="font-semibold">Boundaries</h4>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                {deed.sides.map((s, i) => (
                  <li key={`${s.direction}-${i}`} className="flex items-center justify-between">
                    <span className="font-medium">{s.direction}</span>
                    <span className="text-gray-500">Deed #{s.deedNumber}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
      </div>
    </div>
  );
};

export default DeedViewerPopup;
