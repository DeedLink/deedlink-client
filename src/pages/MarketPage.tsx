import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTransactionsByTypeAndStatus, getDeedById } from "../api/api";
import MarketPropertyGrid, { type MarketProperty } from "../components/market/MarketPropertyGrid";
import { useLoader } from "../contexts/LoaderContext";
import { useWallet } from "../contexts/WalletContext";
import { useAlert } from "../contexts/AlertContext";
import type { Title } from "../types/title";

const MarketPage: React.FC = () => {
  const [properties, setProperties] = useState<MarketProperty[]>([]);
  const [filter, setFilter] = useState<"ALL" | "NFT" | "FT">("ALL");
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketProperties();
  }, []);

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

  const handleBuy = (_transactionId: string, _deedId: string) => {
    showAlert({
      type: "info",
      title: "Purchase Property",
      message: "This feature is coming soon! You will be able to purchase properties directly from the marketplace.",
      confirmText: "OK",
    });
    // TODO: Implement buy functionality
    // navigate(`/purchase/${_transactionId}`);
  };

  const handleViewDetails = (deedNumber: string) => {
    navigate(`/deed/${deedNumber}`);
  };

  if (loading) {
    return (
      <div className="bg-[#1C1B1F] text-[#FEFBF6] min-h-screen pt-20 flex items-center justify-center">
        <p className="text-[#FEFBF6]/70 text-lg">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1B1F] text-[#FEFBF6] min-h-screen pt-20">
      <section className="py-12 px-6 md:px-16">
        <h1 className="text-5xl font-bold text-[#A6D1E6] mb-6">Property Marketplace</h1>

        <div className="flex gap-4 mb-8">
          {["ALL", "NFT", "FT"].map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filter === f ? "bg-gradient-to-r from-green-400 to-emerald-400 text-black" : "bg-white/10 text-[#FEFBF6] hover:bg-white/20"
              }`}
              onClick={() => setFilter(f as any)}
            >
              {f}
            </button>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-[#7F5283] mb-4">My Listings</h2>
        {myProperties.length > 0 ? (
          <MarketPropertyGrid 
            properties={myProperties} 
            onViewDetails={handleViewDetails}
          />
        ) : (
          <p className="text-[#FEFBF6]/70">You have no properties listed for sale.</p>
        )}
      </section>

      <section className="py-12 px-6 md:px-16 bg-[#2A292E] rounded-t-3xl">
        <h2 className="text-3xl font-bold text-[#7F5283] mb-4">Available Properties</h2>
        {otherProperties.length > 0 ? (
          <MarketPropertyGrid 
            properties={otherProperties} 
            onBuy={handleBuy}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <p className="text-[#FEFBF6]/70">No properties available in the market.</p>
        )}
      </section>
    </div>
  );
};

export default MarketPage;
