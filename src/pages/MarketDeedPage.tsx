import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import type { IDeed } from "../types/responseDeed";
import MapPopup from "../components/deeds/MapPopup";
import { getPlanByPlanNumber, getDeedByDeedNumber, getTransactionsByDeedId, getTransactionsByTypeAndStatus } from "../api/api";
import { useToast } from "../contexts/ToastContext";
import { defaultPlan, type Plan } from "../types/plan";
import { useLoader } from "../contexts/LoaderContext";
import { useWallet } from "../contexts/WalletContext";
import { useAlert } from "../contexts/AlertContext";
import TitleHistory from "../components/parts/TitleHistory";
import type { Title } from "../types/title";
import MarketDeedHeader from "../components/market/MarketDeedHeader";
import MarketListingSection from "../components/market/MarketListingSection";
import OwnerInformationSection from "../components/market/OwnerInformationSection";
import BlockchainOwnersSection from "../components/market/BlockchainOwnersSection";
import LandDetailsSection from "../components/market/LandDetailsSection";
import BoundaryDeedsSection from "../components/market/BoundaryDeedsSection";
import MarketDeedSidebar from "../components/market/MarketDeedSidebar";
import MarketplaceBuyPopup from "../components/market/MarketplaceBuyPopup";

const MarketDeedPage = () => {
  const { deedNumber } = useParams();
  const navigate = useNavigate();
  const [deed, setDeed] = useState<IDeed | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const { showAlert } = useAlert();
  const [tnx, setTnx] = useState<any[]>([]);
  const [marketTransaction, setMarketTransaction] = useState<Title | null>(null);
  const [isBuyPopupOpen, setIsBuyPopupOpen] = useState(false);

  const latestValue = deed?.valuation && deed.valuation.length > 0
    ? deed.valuation.slice().sort((a, b) => b.timestamp - a.timestamp)[0]?.estimatedValue || 0
    : 0;

  const fetchDeed = async () => {
    if (!deedNumber) return;
    
    showLoader();
    try {
      const res = await getDeedByDeedNumber(deedNumber);
      if (res) {
        setDeed(res);
      } else {
        showToast("Deed not found", "error");
        navigate("/market");
      }
    } catch (error) {
      console.error("Failed to fetch deed:", error);
      showToast("Failed to load deed information", "error");
      navigate("/market");
    } finally {
      hideLoader();
    }
  };

  const fetchMarketTransaction = async () => {
    if (!deed?._id) return;
    
    try {
      const transactions = await getTransactionsByTypeAndStatus("open_market", "pending");
      const marketTxn = transactions.find((t: any) => t.deedId === deed._id);
      if (marketTxn) {
        setMarketTransaction(marketTxn as Title);
      }
    } catch (error) {
      console.error("Failed to fetch market transaction:", error);
    }
  };

  const getTransactions = async () => {
    if (deed?._id) {
      try {
        const tnx = await getTransactionsByDeedId(deed._id);
        if (tnx && tnx.length) {
          const sortedTnx = tnx.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setTnx(sortedTnx);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    }
  };

  const getSurveyPlan = async () => {
    if (deed?.surveyPlanNumber) {
      try {
        const plan_res = await getPlanByPlanNumber(deed.surveyPlanNumber);
        if (plan_res.data) {
          setPlan(plan_res.data);
        }
      } catch (error) {
        console.error("Failed to fetch survey plan:", error);
      }
    }
  };

  useEffect(() => {
    fetchDeed();
  }, [deedNumber]);

  useEffect(() => {
    if (deed) {
      fetchMarketTransaction();
      getTransactions();
      getSurveyPlan();
    }
  }, [deed]);

  const handleBuy = () => {
    if (!account) {
      showAlert({
        type: "warning",
        title: "Wallet Required",
        message: "Please connect your wallet to purchase properties.",
        confirmText: "OK",
      });
      return;
    }
    setIsBuyPopupOpen(true);
  };

  const handlePurchaseComplete = () => {
    // Refresh market transaction and transactions
    fetchMarketTransaction();
    getTransactions();
  };

  if (!deed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-indigo-700">Loading deed information...</p>
        </div>
      </div>
    );
  }

  const isNFT = marketTransaction?.share === 100;
  const isFT = marketTransaction && marketTransaction.share < 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/market")}
          className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 font-medium mb-6 transition"
        >
          <FaArrowLeft />
          <span>Back to Marketplace</span>
        </button>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-200/50 overflow-hidden mb-6">
          <MarketDeedHeader 
            deed={deed} 
            marketTransaction={marketTransaction} 
            isNFT={isNFT} 
          />

          <div className="p-6">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                {marketTransaction && (
                  <MarketListingSection
                    deed={deed}
                    marketTransaction={marketTransaction}
                    account={account}
                    onBuy={handleBuy}
                  />
                )}

                <OwnerInformationSection deed={deed} />
                <BlockchainOwnersSection deed={deed} />
                <LandDetailsSection deed={deed} />
                <BoundaryDeedsSection plan={plan} />
                <TitleHistory tnx={tnx} />
              </div>

              <MarketDeedSidebar
                deed={deed}
                plan={plan}
                latestValue={latestValue}
                onMapExpand={() => setIsMapOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <MapPopup
        points={plan?.coordinates && plan.coordinates.length > 0 ? plan.coordinates : deed.location}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      {marketTransaction && (
        <MarketplaceBuyPopup
          isOpen={isBuyPopupOpen}
          deed={deed}
          marketTransaction={marketTransaction}
          onClose={() => setIsBuyPopupOpen(false)}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
};

export default MarketDeedPage;

