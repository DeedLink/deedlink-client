import { IoClose } from "react-icons/io5";
import { FaFileSignature, FaUserShield, FaMapMarkedAlt, FaRoute, FaExpand, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaExternalLinkAlt } from "react-icons/fa";
import { formatCurrency, formatNumber, shortAddress, timeAgo } from "../../utils/format";
import type { IDeed } from "../../types/responseDeed";
import MapPreview from "./MapPreview";
import MapPopup from "./MapPopup";
import { useEffect, useState } from "react";
import { getCenterOfLocations } from "../../utils/functions";
import { getPlanByPlanNumber, getTransactionsByDeedId } from "../../api/api";
import { useToast } from "../../contexts/ToastContext";
import { defaultPlan, type Plan } from "../../types/plan";
import { useNavigate } from "react-router-dom";
import TitleHistory from "../parts/TitleHistory";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

interface Props {
  deed: IDeed | null;
  onClose: () => void;
  currency?: string;
  areaUnit?: "m²" | "perch" | "acre";
  signatures?: ISignatures;
}

const DeedViewerPopup = ({ deed, onClose, currency = "ETH", areaUnit = "m²", signatures }: Props) => {
  if (!deed) return null;
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tnx, setTnx] = useState<any[]>([]);

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

  const getSurveyPlan = async () => {
    if (deed.surveyPlanNumber) {
      try {
        const plan_res = await getPlanByPlanNumber(deed.surveyPlanNumber);
        if (plan_res.data) {
          setPlan(plan_res.data);
        }
      } catch (error) {
        console.error("Failed to fetch survey plan:", error);
        showToast("Failed to load survey plan", "error");
      }
    }
  };

  const getTransactions = async () => {
      if (deed._id) {
        const tnx = await getTransactionsByDeedId(deed._id);
        if (tnx && tnx.length) {
          const sortedTnx = tnx.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
  
          setTnx(sortedTnx);
        }
      } else {
        showToast("Deed ID not found", "error");
      }
    };
  
  useEffect(()=>{
    getTransactions();
  },[deed]);

  const handleOpenPage = () => {
    navigate(`/deed/${deed.deedNumber}`);
    onClose();
  };

  useEffect(() => {
    getSurveyPlan();
  }, [deed]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] px-4 text-black" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[calc(100%-100px)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-y-auto p-5 flex-1">
          <div className="border-b border-black/5 flex items-start justify-between pb-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FaFileSignature className="text-green-700 flex-shrink-0" />
                <h3 className="text-xl font-bold text-[#00420A] truncate">Deed #{deed.deedNumber}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {deed.deedType.deedType} • {deed.district}, {deed.division} • {timeAgo(deed.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleOpenPage}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium cursor-pointer"
              >
                <FaExternalLinkAlt size={14} />
                <span>Open Page</span>
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 cursor-pointer flex-shrink-0">
                <IoClose size={20} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <section className="rounded-xl border border-black/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaUserShield className="text-green-700" />
                  <h4 className="font-semibold">Owner Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Full Name</div>
                    <div className="font-medium text-gray-800 mt-0.5">{deed.ownerFullName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">NIC</div>
                    <div className="font-medium text-gray-800 mt-0.5">{deed.ownerNIC}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Phone</div>
                    <div className="font-medium text-gray-800 mt-0.5">{deed.ownerPhone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Address</div>
                    <div className="font-medium text-gray-800 mt-0.5 truncate">{deed.ownerAddress}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-black/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaUserShield className="text-green-700" />
                  <h4 className="font-semibold">Blockchain Owners</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deed.owners.map((o, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                      {shortAddress(o.address)} • {o.share}%
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-black/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaMapMarkedAlt className="text-green-700" />
                  <h4 className="font-semibold">Land Details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Title Number</div>
                    <div className="font-medium text-gray-800 mt-0.5">{deed.landTitleNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Land Address</div>
                    <div className="font-medium text-gray-800 mt-0.5 truncate">{deed.landAddress}</div>
                  </div>
                  {deed.surveyPlanNumber && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500 uppercase">Survey Plan Number</div>
                      <div className="font-medium text-gray-800 mt-0.5">{deed.surveyPlanNumber}</div>
                    </div>
                  )}
                  {deed.boundaries && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500 uppercase">Boundaries</div>
                      <div className="font-medium text-gray-800 mt-0.5">{deed.boundaries}</div>
                    </div>
                  )}
                </div>
              </section>

              {plan?.sides && Object.keys(plan.sides).length > 0 && (
                <section className="rounded-xl border border-black/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaRoute className="text-green-700" />
                    <h4 className="font-semibold">Boundary Deeds</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {Object.entries(plan.sides).map(([direction, deedNum]) => (
                      <li key={direction} className="flex items-center justify-between">
                        <span className="font-medium">{direction}</span>
                        <span className="text-gray-500">{deedNum || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <TitleHistory tnx={tnx}/>

            </div>

            <aside className="space-y-5">
              <div className="rounded-xl border border-black/5 p-4">
                <div className="text-xs text-gray-500 uppercase">Estimated Value</div>
                <div className="text-2xl font-bold text-green-900 mt-0.5">
                  {formatCurrency(latestValue, currency)}
                </div>
                
                <div className="mt-4 text-xs text-gray-500 uppercase">Area</div>
                <div className="text-2xl font-bold text-green-900 mt-0.5">
                  {formatNumber(deed.landArea)} {deed.landSizeUnit || areaUnit}
                </div>
                
                <div className="mt-4 text-xs text-gray-500 uppercase">Land Type</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm mt-1.5 ${getLandTypeColor(deed.landType)}`}>
                  <span>{getLandTypeIcon(deed.landType)}</span>
                  <span className="capitalize">{deed.landType}</span>
                </div>
              </div>

              <div className="rounded-xl border border-black/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-green-700" />
                  <h4 className="font-semibold text-sm">Registered</h4>
                </div>
                <div className="text-sm text-gray-700">
                  {formatDate(deed.registrationDate)}
                </div>
              </div>

              {signatures && (
                <div className="rounded-xl border border-black/5 p-4">
                  <h4 className="font-semibold text-sm mb-3">Signatures</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Surveyor", value: signatures.surveyor, assigned: deed.surveyAssigned },
                      { label: "Notary", value: signatures.notary, assigned: deed.notaryAssigned },
                      { label: "IVSL", value: signatures.ivsl, assigned: deed.ivslAssigned },
                    ].map((sig) => (
                      <div key={sig.label}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{sig.label}</span>
                          {sig.value ? (
                            <FaCheckCircle className="text-green-600" size={16} />
                          ) : (
                            <FaTimesCircle className="text-gray-400" size={16} />
                          )}
                        </div>
                        {sig.assigned && (
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{shortAddress(sig.assigned)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {deed.tokenId !== undefined && (
                <div className="rounded-xl border border-black/5 p-4">
                  <div className="text-xs text-gray-500 uppercase">Token ID</div>
                  <div className="text-lg font-bold text-green-900 mt-0.5">#{deed.tokenId}</div>
                </div>
              )}

              {((deed.location && deed.location.length > 0) || (plan?.coordinates && plan.coordinates.length > 0)) && (
                <section className="rounded-xl border border-black/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaMapMarkedAlt className="text-green-700" />
                    <h4 className="font-semibold">Map View</h4>
                  </div>
                  <div className="relative group h-fit w-full rounded-lg border border-black/5 overflow-hidden">
                    <MapPreview points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location} />
                    <button
                      onClick={() => setIsMapOpen(true)}
                      className="absolute top-2 right-2 bg-white px-3 py-2 rounded-lg shadow hover:shadow-lg transition flex items-center gap-2 z-50"
                    >
                      <FaExpand size={14} className="text-green-700" />
                      <span className="text-sm font-medium text-green-700">View Full Map</span>
                    </button>
                  </div>
                </section>
              )}

              {centerLocation && (
                <div className="rounded-xl border border-black/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkedAlt className="text-green-700" />
                    <h4 className="font-semibold text-sm">Center Location</h4>
                  </div>
                  <div className="text-sm text-gray-700">
                    Lat {centerLocation.latitude.toFixed(6)} <br />
                    Lng {centerLocation.longitude.toFixed(6)}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
      </div>

      <MapPopup
        points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
    </div>
  );
};

export default DeedViewerPopup;