import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTransactionsByTypeAndStatus, getDeedById } from "../api/api";
import MarketPropertyGrid, { type MarketProperty } from "../components/market/MarketPropertyGrid";
import MarketplaceBuyPopup from "../components/market/MarketplaceBuyPopup";
import { useLoader } from "../contexts/LoaderContext";
import { useWallet } from "../contexts/WalletContext";
import { useAlert } from "../contexts/AlertContext";
import type { Title } from "../types/title";
import type { IDeed } from "../types/responseDeed";

const MarketPage: React.FC = () => {
  const [properties, setProperties] = useState<MarketProperty[]>([]);
  const [filter, setFilter] = useState<"ALL" | "NFT" | "FT">("ALL");
  const [loading, setLoading] = useState(true);
  const [buyPopupData, setBuyPopupData] = useState<{ deed: IDeed; transaction: Title } | null>(null);
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketProperties();
  }, [account]);

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchMarketProperties = async () => {
    try {
      setLoading(true);
      // Fetch all open_market pending transactions
      const transactions = await getTransactionsByTypeAndStatus("open_market", "pending");
      
      if (!transactions || transactions.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      // Fetch deed details for each transaction
      const propertiesData: MarketProperty[] = [];
      
      for (const transaction of transactions) {
        try {
          const deed = await getDeedById(transaction.deedId);
          if (deed) {
            const isMine = account ? transaction.from.toLowerCase() === account.toLowerCase() : false;
            propertiesData.push({
              deed,
              transaction: transaction as Title,
              isMine,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch deed ${transaction.deedId}:`, error);
        }
      }

      setProperties(propertiesData);
    } catch (error) {
      console.error("Failed to fetch market properties:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to load market properties. Please try again later.",
        confirmText: "OK",
      });
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = filter === "ALL" 
    ? properties 
    : properties.filter(p => {
        if (filter === "NFT") return p.transaction.share === 100;
        if (filter === "FT") return p.transaction.share < 100;
        return true;
      });

  const myProperties = filteredProperties.filter(p => p.isMine);
  const otherProperties = filteredProperties.filter(p => !p.isMine);

  const handleBuy = (transactionId: string, deedId: string) => {
    if (!account) {
      showAlert({
        type: "warning",
        title: "Wallet Required",
        message: "Please connect your wallet to purchase properties.",
        confirmText: "OK",
      });
      return;
    }

    const property = properties.find(p => p.transaction._id === transactionId && p.deed._id === deedId);
    if (property) {
      setBuyPopupData({ deed: property.deed, transaction: property.transaction });
    } else {
      showAlert({
        type: "error",
        title: "Error",
        message: "Property not found. Please refresh the page.",
        confirmText: "OK",
      });
    }
  };

  const handlePurchaseComplete = () => {
    // Refresh properties after purchase
    fetchMarketProperties();
  };

  const handleViewDetails = (deedNumber: string) => {
    navigate(`/market/${deedNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-20 flex items-center justify-center">
        <p className="text-indigo-700 text-lg font-medium">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-indigo-200/50 shadow-sm pt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Property Marketplace
            </h1>
            <div className="h-2 w-40 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            {["ALL", "NFT", "FT"].map((f) => (
              <button
                key={f}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filter === f
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                }`}
                onClick={() => setFilter(f as any)}
              >
                {f}
              </button>
            ))}
            <div className="ml-auto text-sm text-indigo-600">
              <span className="font-semibold">{filteredProperties.length}</span> properties
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!account ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-200/50 shadow-lg">
            <p className="text-2xl font-semibold text-indigo-700">Connect Your Wallet</p>
            <p className="text-indigo-500 mt-2">Please connect your wallet to view the marketplace.</p>
          </div>
        ) : (
          <>
            {myProperties.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-indigo-700 mb-4">My Listings</h2>
                <MarketPropertyGrid 
                  properties={myProperties} 
                  onViewDetails={handleViewDetails}
                />
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold text-indigo-700 mb-4">
                Available Properties
                {otherProperties.length > 0 && (
                  <span className="ml-2 text-base font-normal text-indigo-500">
                    ({otherProperties.length})
                  </span>
                )}
              </h2>
              <MarketPropertyGrid 
                properties={otherProperties} 
                onBuy={handleBuy}
                onViewDetails={handleViewDetails}
              />
            </section>
          </>
        )}
      </main>

      {buyPopupData && (
        <MarketplaceBuyPopup
          isOpen={!!buyPopupData}
          deed={buyPopupData.deed}
          marketTransaction={buyPopupData.transaction}
          onClose={() => setBuyPopupData(null)}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </div>
  );
};

export default MarketPage;
