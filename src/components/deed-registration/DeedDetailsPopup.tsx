import { IoClose } from "react-icons/io5";
import { FaFileSignature, FaUserShield, FaMapMarkedAlt, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaIdCard, FaPhone, FaHome, FaRoute } from "react-icons/fa";
import type { IDeed } from "../../types/responseDeed";
import { getPlanByPlanNumber, getTransactionsByDeedId } from "../../api/api";
import { useToast } from "../../contexts/ToastContext";
import { useEffect, useState } from "react";
import { defaultPlan, type Plan } from "../../types/plan";
import TitleHistory from "../parts/TitleHistory";

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
  const { showToast } = useToast();
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [tnx, setTnx] = useState<any[]>([]);

  const shortAddress = (addr: string) => {
    if (!addr || addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETH',
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getSurveyPlan=async()=>{
    if(deed.surveyPlanNumber){
      const plan_res = await getPlanByPlanNumber(deed.surveyPlanNumber);
      if(plan_res.data){
        setPlan(plan_res.data);
      }
    }
    else{
      showToast("Plan number not found", "error");
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
        console.log("Transactions:", sortedTnx);
      }
    } else {
      showToast("Deed ID not found", "error");
    }
  };

  useEffect(()=>{
    getSurveyPlan();
  },[deed]);

  useEffect(()=>{
    getTransactions();
  },[deed]);

  useEffect(() => {
    if (plan) {
      console.log("plan_res:", plan);
    }
  }, [plan]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4 text-black" onClick={onClose}>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[calc(100%-80px)] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-y-auto p-4 sm:p-5 flex-1">
          <div className="border-b border-black/5 flex items-start justify-between pb-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FaFileSignature className="text-green-700 flex-shrink-0" size={18} />
                <h3 className="text-lg sm:text-xl font-bold text-[#00420A] truncate">Deed #{deed.deedNumber}</h3>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate">
                {deed.deedType.deedType} • {deed.district}, {deed.division}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1.5 sm:p-2 cursor-pointer transition flex-shrink-0 ml-2">
              <IoClose size={20} />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <section className="rounded-lg border border-black/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaIdCard className="text-green-700" size={16} />
                  <h4 className="font-semibold text-sm sm:text-base">Owner Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Full Name</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">{deed.ownerFullName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">NIC Number</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{deed.ownerNIC}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <FaPhone size={9} /> Phone
                    </div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{deed.ownerPhone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <FaHome size={9} /> Address
                    </div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">{deed.ownerAddress}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-black/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaUserShield className="text-green-700" size={16} />
                  <h4 className="font-semibold text-sm sm:text-base">Ownership</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deed.owners.map((o, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                      {shortAddress(o.address)} • {o.share}%
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-black/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaMapMarkedAlt className="text-green-700" size={16} />
                  <h4 className="font-semibold text-sm sm:text-base">Land Details</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Title Number</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5">{deed.landTitleNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Land Address</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5 truncate">{deed.landAddress}</div>
                  </div>
                  {deed.surveyPlanNumber && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Survey Plan Number</div>
                      <div className="text-sm font-medium text-gray-800 mt-0.5">{deed.surveyPlanNumber}</div>
                    </div>
                  )}
                  {deed.boundaries && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Boundaries</div>
                      <div className="text-sm font-medium text-gray-800 mt-0.5">{deed.boundaries}</div>
                    </div>
                  )}
                </div>
              </section>

              {plan?.sides && Object.keys(plan?.sides).length > 0 && (
                <section className="rounded-lg border border-black/5 p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaRoute className="text-green-700" size={16} />
                    <h4 className="font-semibold text-sm sm:text-base">Boundary Deeds</h4>
                  </div>
                  <ul className="text-xs sm:text-sm text-gray-700 space-y-1.5">
                    {Object.entries(plan?.sides).map(([direction, deedNum]) => (
                      <li key={direction} className="flex items-center justify-between">
                        <span className="font-medium">{direction}</span>
                        <span className="text-gray-500 truncate ml-2">{deedNum || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <TitleHistory tnx={tnx}/>

              <section className="rounded-lg border border-black/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaMapMarkedAlt className="text-green-700" size={16} />
                  <h4 className="font-semibold text-sm sm:text-base">Coordinates</h4>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {plan?.coordinates?.length ? (
                    plan.coordinates.map((loc, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-2 text-xs">
                        <div className="text-gray-500">Point {idx + 1}</div>
                        <div className="font-mono text-gray-700 mt-0.5 text-xs">
                          {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-xs italic">No coordinates found</div>
                  )}

                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-black/5 p-3 sm:p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Value</div>
                <div className="text-xl sm:text-2xl font-bold text-green-900 mt-0.5">
                {deed.valuation && deed.valuation.length > 0
                  ? formatCurrency(
                      deed.valuation
                        .slice()
                        .sort((a, b) => b.timestamp - a.timestamp)[0]?.estimatedValue || 0
                    )
                  : formatCurrency(0)}
                </div>
                
                <div className="mt-4 text-xs text-gray-500 uppercase tracking-wide">Area</div>
                <div className="text-xl sm:text-2xl font-bold text-green-900 mt-0.5">
                  {deed.landArea.toLocaleString()} {deed.landSizeUnit || 'Sqm'}
                </div>
                
                <div className="mt-4 text-xs text-gray-500 uppercase tracking-wide">Type</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs mt-1.5 ${getLandTypeColor(deed.landType)}`}>
                  <span>{getLandTypeIcon(deed.landType)}</span>
                  <span className="capitalize">{deed.landType}</span>
                </div>
              </div>

              <div className="rounded-lg border border-black/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-green-700" size={14} />
                  <h4 className="font-semibold text-sm">Registered</h4>
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  {formatDate(deed.registrationDate)}
                </div>
              </div>

              {deed.signatures && (
                <div className="rounded-lg border border-black/5 p-3 sm:p-4">
                  <h4 className="font-semibold text-sm mb-3">Signatures</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Surveyor", value: deed.signatures.surveyor, assigned: deed.surveyAssigned },
                      { label: "Notary", value: deed.signatures.notary, assigned: deed.notaryAssigned },
                      { label: "IVSL", value: deed.signatures.ivsl, assigned: deed.ivslAssigned },
                    ].map((sig) => (
                      <div key={sig.label}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-700">{sig.label}</span>
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
                <div className="rounded-lg border border-black/5 p-3 sm:p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Token ID</div>
                  <div className="text-base sm:text-lg font-bold text-green-900 mt-0.5">#{deed.tokenId}</div>
                </div>
              )}

              <div className="rounded-lg border border-black/5 p-3 sm:p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Created</div>
                <div className="text-xs sm:text-sm text-gray-700 mt-1">
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