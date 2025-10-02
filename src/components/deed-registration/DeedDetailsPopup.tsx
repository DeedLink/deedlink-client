import { IoClose } from "react-icons/io5";
import { FaFileSignature, FaUserShield, FaMapMarkedAlt, FaLayerGroup, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaIdCard, FaPhone, FaHome, FaRoute } from "react-icons/fa";
import type { IDeed } from "../../types/responseDeed";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

const DeedDetailsPopup = ({
  isOpen,
  onClose,
  deed,
}: {
  isOpen: boolean;
  onClose: () => void;
  deed: (IDeed & { signatures?: ISignatures }) | null;
}) => {
  if (!isOpen || !deed) return null;

  const shortAddress = (addr: string) => {
    if (!addr || addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] px-4 text-black" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[calc(100%-100px)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-y-auto p-6 flex-1">
          <div className="border-b border-black/5 flex items-start justify-between pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FaFileSignature className="text-green-700" size={22} />
                <h3 className="text-2xl font-bold text-[#00420A]">Deed #{deed.deedNumber}</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {deed.deedType.deedType} • {deed.district}, {deed.division}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer transition">
              <IoClose size={24} />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <section className="rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaIdCard className="text-green-700" size={18} />
                  <h4 className="font-semibold text-lg">Owner Information</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Full Name</div>
                    <div className="text-sm font-medium text-gray-800 mt-1">{deed.ownerFullName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">NIC Number</div>
                    <div className="text-sm font-medium text-gray-800 mt-1">{deed.ownerNIC}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <FaPhone size={10} /> Phone
                    </div>
                    <div className="text-sm font-medium text-gray-800 mt-1">{deed.ownerPhone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <FaHome size={10} /> Address
                    </div>
                    <div className="text-sm font-medium text-gray-800 mt-1">{deed.ownerAddress}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaUserShield className="text-green-700" size={18} />
                  <h4 className="font-semibold text-lg">Ownership Distribution</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deed.owners.map((o, idx) => (
                    <div key={idx} className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
                      {shortAddress(o.address)} • {o.share}%
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaMapMarkedAlt className="text-green-700" size={18} />
                  <h4 className="font-semibold text-lg">Land Details</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Title Number</div>
                    <div className="text-sm font-medium text-gray-800 mt-1">{deed.landTitleNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Land Address</div>
                    <div className="text-sm font-medium text-gray-800 mt-1">{deed.landAddress}</div>
                  </div>
                  {deed.surveyPlanNumber && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Survey Plan Number</div>
                      <div className="text-sm font-medium text-gray-800 mt-1">{deed.surveyPlanNumber}</div>
                    </div>
                  )}
                  {deed.boundaries && (
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Boundaries Description</div>
                      <div className="text-sm font-medium text-gray-800 mt-1">{deed.boundaries}</div>
                    </div>
                  )}
                </div>
              </section>

              {deed.sides && Object.keys(deed.sides).length > 0 && (
                <section className="rounded-xl border border-black/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FaRoute className="text-green-700" size={18} />
                    <h4 className="font-semibold text-lg">Boundary Deeds</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {Object.entries(deed.sides).map(([direction, deedNum]) => (
                      <li key={direction} className="flex items-center justify-between">
                        <span className="font-medium">{direction}</span>
                        <span className="text-gray-500">{deedNum || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaLayerGroup className="text-green-700" size={18} />
                  <h4 className="font-semibold text-lg">Title History</h4>
                </div>
                {deed.title && deed.title.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {deed.title.map((t, idx) => (
                      <div key={t._id || idx} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{shortAddress(t.from)} → {shortAddress(t.to)}</div>
                          <div className="text-gray-500 text-xs">{formatDate(t.timestamp)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-700">{t.share}% share</div>
                          {t.amount > 0 && <div className="text-gray-500 text-xs">{formatCurrency(t.amount)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No transfers recorded.</p>
                )}
              </section>

              <section className="rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaMapMarkedAlt className="text-green-700" size={18} />
                  <h4 className="font-semibold text-lg">Location Coordinates</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {deed.location.map((loc, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 text-xs">
                      <div className="text-gray-500">Point {idx + 1}</div>
                      <div className="font-mono text-gray-700 mt-1">
                        {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-xl border border-black/5 p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Estimated Value</div>
                <div className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(deed.value)}</div>
                
                <div className="mt-5 text-xs text-gray-500 uppercase tracking-wide">Land Area</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {deed.landArea.toLocaleString()} {deed.landSizeUnit || 'Sqm'}
                </div>
                
                <div className="mt-5 text-xs text-gray-500 uppercase tracking-wide">Land Type</div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm mt-2 ${getLandTypeColor(deed.landType)}`}>
                  <span>{getLandTypeIcon(deed.landType)}</span>
                  <span className="capitalize">{deed.landType}</span>
                </div>
              </div>

              <div className="rounded-xl border border-black/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaCalendarAlt className="text-green-700" size={16} />
                  <h4 className="font-semibold">Registration Date</h4>
                </div>
                <div className="text-sm text-gray-700">
                  {formatDate(deed.registrationDate)}
                </div>
              </div>

              {deed.signatures && (
                <div className="rounded-xl border border-black/5 p-5">
                  <h4 className="font-semibold text-lg mb-4">Signatures</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Surveyor", value: deed.signatures.surveyor, assigned: deed.surveyAssigned },
                      { label: "Notary", value: deed.signatures.notary, assigned: deed.notaryAssigned },
                      { label: "IVSL", value: deed.signatures.ivsl },
                      { label: "Fully Signed", value: deed.signatures.fully },
                    ].map((sig) => (
                      <div key={sig.label}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{sig.label}</span>
                          {sig.value ? (
                            <FaCheckCircle className="text-green-600" size={18} />
                          ) : (
                            <FaTimesCircle className="text-gray-400" size={18} />
                          )}
                        </div>
                        {sig.assigned && (
                          <div className="text-xs text-gray-500 mt-1">{shortAddress(sig.assigned)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {deed.tokenId !== undefined && (
                <div className="rounded-xl border border-black/5 p-5">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Token ID</div>
                  <div className="text-lg font-bold text-green-900 mt-1">#{deed.tokenId}</div>
                </div>
              )}

              <div className="rounded-xl border border-black/5 p-5">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Created</div>
                <div className="text-sm text-gray-700 mt-2">
                  {formatDate(deed.timestamp)}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
      </div>
    </div>
  );
};

export default DeedDetailsPopup;