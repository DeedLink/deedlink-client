import { useEffect, useState } from "react";
import DeedRegistrationPopup from "../components/deed-registration/DeedRegistrationPopup";
import DeedDetailsPopup from "../components/deed-registration/DeedDetailsPopup";
import DeedTable from "../components/deed-registration/DeedTable";
import { useLoader } from "../contexts/LoaderContext";
import { type Deed } from "../types/types";
import { getDeedsByOwner } from "../api/api";
import { useWallet } from "../contexts/WalletContext";

const DeedRegistrationPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [selectedDeed, setSelectedDeed] = useState<Deed | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const [deeds, setDeeds] = useState<Deed[]>();

  const getDeeds = async()=>{
    const res = await getDeedsByOwner(account || "");
    console.log(res);
    setDeeds(res);
  }

  useEffect(()=>{
    getDeeds();
  },[account]);

  const handleViewDeed = (deed: Deed) => {
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

  return (
    <div className="w-full min-h-screen text-white flex flex-col items-center px-4 sm:px-8 py-8 bg-gradient-to-b from-emerald-50 to-white">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-center">
        Deed Registration
      </h1>

      <button
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg transition w-full sm:w-auto"
        onClick={() => setIsOpen(true)}
      >
        + Register New Deed
      </button>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        {["Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`px-4 sm:px-6 py-2 rounded-full font-semibold transition ${
              activeTab === tab
                ? "bg-white text-green-700 shadow-md"
                : "bg-green-800 hover:bg-green-600"
            }`}
            onClick={() =>
              setActiveTab(tab as "Pending" | "Approved" | "Rejected")
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 w-full max-w-5xl overflow-x-auto">
        <DeedTable deeds={deeds} activeTab={activeTab} onView={handleViewDeed} />
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
