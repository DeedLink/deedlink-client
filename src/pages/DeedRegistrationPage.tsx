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

const DeedRegistrationPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [selectedDeed, setSelectedDeed] = useState<IDeed | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const [deeds, setDeeds] = useState<IDeed[]>();
  const [statusCounts, setStatusCounts] = useState({ Pending: 0, Approved: 0, Rejected: 0 });

  const getDeeds = async () => {
    const res = await getDeedsByOwner(account || "");
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
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white pb-10 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                Deed Registry
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage and track all your property deeds in one place
              </p>
            </div>
            <button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
              onClick={() => setIsOpen(true)}
            >
              <FaPlus className="group-hover:rotate-90 transition-transform duration-200" />
              <span>Register New Deed</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1">{statusCounts.Pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FaFileAlt className="text-yellow-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Approved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{statusCounts.Approved}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FaChartLine className="text-green-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Rejected</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">{statusCounts.Rejected}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <FaFileAlt className="text-red-600" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(["Pending", "Approved", "Rejected"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
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
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFileAlt className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deeds Found</h3>
              <p className="text-gray-600 mb-6">
                Get started by registering your first property deed
              </p>
              <button
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
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
