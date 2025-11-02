import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaFileSignature, FaUserShield, FaMapMarkedAlt, FaRoute, FaLayerGroup, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaArrowLeft, FaExpand } from "react-icons/fa";
import { formatCurrency, formatNumber, shortAddress, timeAgo } from "../utils/format";
import type { IDeed } from "../types/responseDeed";
import MapPreview from "../components/deeds/MapPreview";
import MapPopup from "../components/deeds/MapPopup";
import { getCenterOfLocations } from "../utils/functions";
import { getPlanByPlanNumber, getDeedByDeedNumber, getTransactionsByDeedId } from "../api/api";
import { useToast } from "../contexts/ToastContext";
import { defaultPlan, type Plan } from "../types/plan";
import { useLoader } from "../contexts/LoaderContext";
import { createFractionalToken, getFractionalTokenAddress, getFTBalance, getSignatures } from "../web3.0/contractService";
import DeedActionBar from "../components/adeed/deedActionBar";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";
import TransactPopup from "../components/adeed/transactPopup";
import { DirectTransferPopup } from "../components/adeed/tnxPopups/DirectTransferPopup";
import SaleEscrowPopup from "../components/adeed/tnxPopups/SaleEscrowPopup";
import GiveRentPopup from "../components/adeed/tnxPopups/GiveRentPopup";
import GetRentPopup from "../components/adeed/tnxPopups/GetRentPopup";
import { getRentDetails } from "../web3.0/rentIntegration";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

const ADeedPage = () => {
  const { deedNumber } = useParams();
  const navigate = useNavigate();
  const [deed, setDeed] = useState<IDeed | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [signatures, setSignatures] = useState<ISignatures | null>(null);
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const [numberOfFT, setNumberOfFT] = useState(0);
  const [openTransact, setOpenTransact] = useState(false);
  const [tnx, setTnx] = useState<any[]>([]);
  const [openDirectTransfer, setOpenDirectTransfer] = useState(false);
  const [openSaleEscrow, setOpenSaleEscrow] = useState(false);
  const [openGiveRent, setOpenGiveRent] = useState(false);
  const [openGetRent, setOpenGetRent] = useState(false);


  const centerLocation = deed ? getCenterOfLocations(deed.location) : null;

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

  const formatDateWithTime = (date: Date | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  useEffect(() => {
    if (openTransact) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [openTransact]);

  const getNumberOfFT = async () => {
    try {
      if (!deed?.tokenId || !account) return;

      const tokenAddress = await getFractionalTokenAddress(deed.tokenId);
      if (!ethers.isAddress(tokenAddress)) {
        console.error("Invalid token address:", tokenAddress);
        return;
      }

      const balance = await getFTBalance(tokenAddress, account);

      const formattedBalance = ethers.formatUnits(balance, 0);

      console.log("Fractional Tokens:", formattedBalance);
      setNumberOfFT(parseInt(formattedBalance));
    } catch (err) {
      console.error("Failed to get fractional token balance:", err);
    }
  };

  const handleEdit = async() => {
    showToast("Edit functionality coming soon", "info");
  };

  const handleFractioning = async() =>{
    if(deed?.tokenId){
      const res = await createFractionalToken(deed?.tokenId, deed?.deedNumber, deed?.deedNumber, 1000000);
      console.log(res);
      showToast("Fractioning success", "success");
    }
    else{
      showToast("Fractioning failed!", "error");
    }
  };

  const handleTransfer = () => {
    setOpenTransact(true);
  };

  const handleSaleEscrow = () => {
    setOpenSaleEscrow(true);
  };

  const handleDirectTransfer = () => {
    setOpenDirectTransfer(true);
  };

  const handleDownload = () => {
    showToast("Download functionality coming soon", "info");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Deed #${deed?.deedNumber}`,
        text: `Check out this property deed`,
        url: window.location.href,
      }).catch(() => {
        showToast("Sharing cancelled", "info");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard", "success");
    }
  };

  const handleViewBlockchain = () => {
    showToast("Blockchain explorer coming soon", "info");
  };

  const fetchDeed = async () => {
    if (!deedNumber) return;
    
    showLoader();
    try {
      const res = await getDeedByDeedNumber(deedNumber);
      if (res) {
        setDeed(res);
        
        if (res.tokenId !== undefined) {
          try {
            const sigs = await getSignatures(res.tokenId);
            setSignatures(sigs);
          } catch (error) {
            console.error("Failed to fetch signatures:", error);
          }
        }

        if (res.surveyPlanNumber) {
          try {
            const plan_res = await getPlanByPlanNumber(res.surveyPlanNumber);
            if (plan_res.data) {
              setPlan(plan_res.data);
            }
          } catch (error) {
            console.error("Failed to fetch survey plan:", error);
          }
        }
      } else {
        showToast("Deed not found", "error");
      }
    } catch (error) {
      console.error("Failed to fetch deed:", error);
      showToast("Failed to load deed", "error");
    } finally {
      hideLoader();
    }
  };


  const getTransactions = async () => {
    if (deed && deed._id) {
      const tnx = await getTransactionsByDeedId(deed._id);
      if (tnx && tnx.length) {
        const sortedTnx = tnx.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTnx(sortedTnx);
        console.log(sortedTnx);
      }
    } else {
      showToast("Deed ID not found", "error");
    }
  };
  
  useEffect(()=>{
    getTransactions();
  },[deed]);

  useEffect(() => {
    fetchDeed();
  }, [deedNumber]);

  useEffect(()=>{
    getNumberOfFT();
  },[deedNumber]);

  getNumberOfFT();

  const getTheRentDetails =async()=>{
    if(deed?.tokenId){
      const res = await getRentDetails(deed?.tokenId);
      console.log("Rent Details: ", res);
    }
  }

  useEffect(()=>{
    getTheRentDetails();
  },[deed]);

  if (!deed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-700">Loading deed information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pt-20">
      <div className="flex max-w-boundary mx-auto w-full h-full">
        <div className="max-w-7xl mx-auto px-4 py-8 h-full w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-6 transition"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="lg:hidden mb-6">
            <DeedActionBar
              onFractioning={handleFractioning}
              deedNumber={deed.deedNumber}
              deedId={deed._id}
              tokenId={deed.tokenId}
              actionHappened={openDirectTransfer || openSaleEscrow || openTransact}
              onEdit={handleEdit}
              onTransfer={handleTransfer}
              onDirectTransfer={handleDirectTransfer}
              onSaleEscrow={handleSaleEscrow}
              onDownload={handleDownload}
              onShare={handleShare}
              onViewBlockchain={handleViewBlockchain}
              numberOfFT={numberOfFT}
              onRent={() => setOpenGiveRent(true)}
              onPowerOfAttorney={() => {}}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <FaFileSignature size={32} />
                <div>
                  <h1 className="text-3xl font-bold">Deed #{deed.deedNumber}</h1>
                  <p className="text-green-100 mt-1">
                    {deed.deedType.deedType} • {deed.district}, {deed.division}
                  </p>
                </div>
              </div>
              <div className="text-white">
                Number of fractional tokens: {numberOfFT}
              </div>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <section className="rounded-xl border border-black/5 p-5 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <FaUserShield className="text-green-700" size={20} />
                      <h2 className="text-lg font-bold text-gray-900">Owner Information</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-lg p-4">
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Full Name</div>
                        <div className="font-medium text-gray-800 mt-1">{deed.ownerFullName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">NIC</div>
                        <div className="font-medium text-gray-800 mt-1">{deed.ownerNIC}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Phone</div>
                        <div className="font-medium text-gray-800 mt-1">{deed.ownerPhone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Address</div>
                        <div className="font-medium text-gray-800 mt-1">{deed.ownerAddress}</div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-black/5 p-5 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <FaUserShield className="text-green-700" size={20} />
                      <h2 className="text-lg font-bold text-gray-900">Blockchain Owners</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {deed.owners.map((o, idx) => (
                        <div key={idx} className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-200 font-semibold">
                          {shortAddress(o.address)} • {o.share}%
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-black/5 p-5 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <FaMapMarkedAlt className="text-green-700" size={20} />
                      <h2 className="text-lg font-bold text-gray-900">Land Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-lg p-4">
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

                  {plan?.sides && Object.keys(plan.sides).length > 0 && (
                    <section className="rounded-xl border border-black/5 p-5 bg-gray-50">
                      <div className="flex items-center gap-2 mb-4">
                        <FaRoute className="text-green-700" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">Boundary Deeds</h2>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <ul className="space-y-3">
                          {Object.entries(plan.sides).map(([direction, deedNum]) => (
                            <li key={direction} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                              <span className="font-semibold text-gray-800">{direction}</span>
                              <span className="text-gray-600">{deedNum || 'N/A'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}

                  <section className="rounded-xl border border-black/5 p-5 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <FaLayerGroup className="text-green-700" size={20} />
                      <h2 className="text-lg font-bold text-gray-900">Title History</h2>
                    </div>
                    <div className="bg-white rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                      {(!tnx || tnx.length === 0) && <p className="text-gray-500">No transfers recorded.</p>}
                      {tnx?.map((t, idx) => (
                        <div key={t._id || idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{shortAddress(t.from)} → {shortAddress(t.to)}</div>
                            <div className="text-gray-500 text-sm mt-1">{formatDateWithTime(new Date(t.date).getTime())}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-800 font-semibold">{t.share}%</div>
                            {t.amount > 0 && <div className="text-gray-500 text-sm">{formatCurrency(t.amount, "LKR")}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-xl border border-black/5 p-5 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="text-xs text-gray-600 uppercase font-semibold">Estimated Value</div>
                    <div className="text-3xl font-bold text-green-900 mt-2">
                      {formatCurrency(latestValue, "LKR")}
                    </div>
                    
                    <div className="mt-5 text-xs text-gray-600 uppercase font-semibold">Area</div>
                    <div className="text-3xl font-bold text-green-900 mt-2">
                      {formatNumber(deed.landArea)} {deed.landSizeUnit || "m²"}
                    </div>
                    
                    <div className="mt-5 text-xs text-gray-600 uppercase font-semibold">Land Type</div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs 3xl:text-base mt-2 ${getLandTypeColor(deed.landType)}`}>
                      <span className="text-xl">{getLandTypeIcon(deed.landType)}</span>
                      <span className="capitalize">{deed.landType}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/5 p-5 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <FaCalendarAlt className="text-green-700" />
                      <h3 className="font-bold text-gray-900">Registered</h3>
                    </div>
                    <div className="text-gray-700 font-medium">
                      {formatDate(deed.registrationDate)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {timeAgo(deed.timestamp)}
                    </div>
                  </div>

                  {signatures && (
                    <div className="rounded-xl border border-black/5 p-5 bg-gray-50">
                      <h3 className="font-bold text-gray-900 mb-4">Signatures</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Surveyor", value: signatures.surveyor, assigned: deed.surveyAssigned },
                          { label: "Notary", value: signatures.notary, assigned: deed.notaryAssigned },
                          { label: "IVSL", value: signatures.ivsl, assigned: deed.ivslAssigned },
                        ].map((sig) => (
                          <div key={sig.label} className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800">{sig.label}</span>
                              {sig.value ? (
                                <FaCheckCircle className="text-green-600" size={20} />
                              ) : (
                                <FaTimesCircle className="text-gray-400" size={20} />
                              )}
                            </div>
                            {sig.assigned && (
                              <div className="text-xs text-gray-500 mt-2">{shortAddress(sig.assigned)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deed.tokenId !== undefined && (
                    <div className="rounded-xl border border-black/5 p-5 bg-gradient-to-br from-emerald-50 to-green-50">
                      <div className="text-xs text-gray-600 uppercase font-semibold">Token ID</div>
                      <div className="text-2xl font-bold text-green-900 mt-2">#{deed.tokenId}</div>
                    </div>
                  )}

                  {((deed.location && deed.location.length > 0) || (plan?.coordinates && plan.coordinates.length > 0)) && (
                    <section className="rounded-xl border border-black/5 p-5 bg-gray-50">
                      <div className="flex items-center gap-2 mb-4">
                        <FaMapMarkedAlt className="text-green-700" size={20} />
                        <h3 className="font-bold text-gray-900">Map View</h3>
                      </div>
                      <div className="relative group h-fit w-full rounded-lg border border-black/5 overflow-hidden">
                        <MapPreview points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location} />
                        <button
                          onClick={() => setIsMapOpen(true)}
                          className="absolute top-3 right-3 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2"
                        >
                          <FaExpand size={14} className="text-green-700" />
                          <span className="text-sm font-semibold text-green-700">Expand</span>
                        </button>
                      </div>
                    </section>
                  )}

                  {centerLocation && (
                    <div className="rounded-xl border border-black/5 p-5 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <FaMapMarkedAlt className="text-green-700" />
                        <h3 className="font-bold text-gray-900">Center Location</h3>
                      </div>
                      <div className="text-gray-700 font-mono text-sm bg-white rounded-lg p-3">
                        <div>Lat: {centerLocation.latitude.toFixed(6)}</div>
                        <div className="mt-1">Lng: {centerLocation.longitude.toFixed(6)}</div>
                      </div>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block py-14 min-h-full pt-20 max-w-full mx-auto">
          <DeedActionBar
            onFractioning={handleFractioning}
            deedNumber={deed.deedNumber}
            deedId={deed._id}
            actionHappened={openDirectTransfer || openSaleEscrow || openTransact}
            tokenId={deed.tokenId}
            onEdit={handleEdit}
            onTransfer={handleTransfer}
            onDirectTransfer={handleDirectTransfer}
            onSaleEscrow={handleSaleEscrow}
            onDownload={handleDownload}
            onShare={handleShare}
            onViewBlockchain={handleViewBlockchain}
            numberOfFT={numberOfFT}
            onRent={() => setOpenGiveRent(true)}
            onPowerOfAttorney={() => {}}
          />
        </div>
      </div>

      <MapPopup
        points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      {
        openTransact && deed.tokenId && (
          <TransactPopup deedId={deed._id} tokenId={deed.tokenId} isOpen={openTransact} onClose={() => setOpenTransact(false)}>
          </TransactPopup>
        )
      }
      { 
        openDirectTransfer && deed.tokenId && (
        <DirectTransferPopup deedId={deed._id} tokenId={deed.tokenId} isOpen={openDirectTransfer} onClose={() => setOpenDirectTransfer(false)}>
        </DirectTransferPopup>
      )
      }
      { 
        openSaleEscrow && deed.tokenId && (    
        <SaleEscrowPopup deedId={deed._id} tokenId={deed.tokenId} isOpen={openSaleEscrow} onClose={() => setOpenSaleEscrow(false)}>
        </SaleEscrowPopup>
      )
      }
      {openGiveRent && deed.tokenId && (
        <GiveRentPopup
          isOpen={openGiveRent}
          tokenId={deed.tokenId}
          onClose={() => setOpenGiveRent(false)}
        />
      )}

      {openGetRent && deed.tokenId && (
        <GetRentPopup
          isOpen={openGetRent}
          tokenId={deed.tokenId}
          onClose={() => setOpenGetRent(false)}
        />
      )}
    </div>
  );
};

export default ADeedPage;