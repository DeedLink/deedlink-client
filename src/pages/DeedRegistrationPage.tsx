import { useEffect, useState } from "react";
import DeedRegistrationPopup from "../components/deed-registration/DeedRegistrationPopup";
import DeedDetailsPopup from "../components/deed-registration/DeedDetailsPopup";
import DeedTable from "../components/deed-registration/DeedTable";
import { useLoader } from "../contexts/LoaderContext";
import { getDeedsByOwner } from "../api/api";
import { useWallet } from "../contexts/WalletContext";
import type { IDeed } from "../types/responseDeed";
import { FaPlus, FaFileAlt, FaChartLine } from "react-icons/fa";
import { getSignatures } from "../web3.0/contractService";
import { useLanguage } from "../contexts/LanguageContext";

const DeedRegistrationPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [selectedDeed, setSelectedDeed] = useState<IDeed | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const { t } = useLanguage();
  const [deeds, setDeeds] = useState<IDeed[]>();
  const [statusCounts, setStatusCounts] = useState({ Pending: 0, Approved: 0, Rejected: 0 });

  const getDeeds = async () => {
    const res = await getDeedsByOwner(account || "");
    console.log(res);
    setDeeds(res);
  };

  useEffect(() => {
    getDeeds();
  }, [account]);

  const handleViewDeed = (deed: IDeed) => {
    setSelectedDeed(deed);
    setIsDetailsOpen(true);
  };

  useEffect(() => {
    if (isOpen || isDetailsOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [isOpen, isDetailsOpen]);

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      if (!deeds) {
        setStatusCounts({ Pending: 0, Approved: 0, Rejected: 0 });
        return;
      }
      let pending = 0;
      let approved = 0;
      for (const d of deeds) {
        const sigs = await getSignatures(d.tokenId!);
        if (sigs.fully) {
          approved++;
        } else {
          pending++;
        }
      }
      setStatusCounts({ Pending: pending, Approved: approved, Rejected: 0 });
    };
    fetchStatusCounts();
  }, [deeds]);

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-10 pt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-6 md:py-10 md:px-20">
        <div className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {t("deedRegistration.title")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("deedRegistration.subtitle")}
              </p>
            </div>
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-md transition flex items-center justify-center gap-2"
              onClick={() => setIsOpen(true)}
            >
              <FaPlus />
              <span>{t("deedRegistration.registerNew")}</span>
            </button>
          </div>

          <div className="grid-cols-1 md:grid-cols-3 gap-6 mb-8 hidden">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("deedRegistration.pending")}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-2">
                    {statusCounts.Pending}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaFileAlt className="text-yellow-600 text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("deedRegistration.approved")}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">
                    {statusCounts.Approved}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaChartLine className="text-green-600 text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("deedRegistration.rejected")}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600 mt-2">
                    {statusCounts.Rejected}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FaFileAlt className="text-red-600 text-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-wrap gap-3">
              {(["Pending", "Approved"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`px-5 py-2 rounded-md font-semibold transition text-sm ${
                    activeTab === tab
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab === "Pending" ? t("deedRegistration.pending") : t("deedRegistration.approved")}</span>
                  <span className="ml-2 text-xs opacity-75">({statusCounts[tab]})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex items-center justify-center w-full">
            <DeedTable deeds={deeds} activeTab={activeTab} onView={handleViewDeed} />
          </div>
        </div>

        {deeds && deeds.length === 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFileAlt className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deeds Found</h3>
              <p className="text-gray-600 mb-6">
                Get started by registering your first property deed
              </p>
              <button
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-md transition inline-flex items-center gap-2"
                onClick={() => setIsOpen(true)}
              >
                <FaPlus />
                <span>Register Your First Deed</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <DeedRegistrationPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <DeedDetailsPopup
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        deed={selectedDeed}
      />
    </div>
  );
};

export default DeedRegistrationPage;