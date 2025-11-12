import React, { useEffect, useState } from "react";
import { useLoader } from "../contexts/LoaderContext";
import { useAlert } from "../contexts/AlertContext";
import { useWallet } from "../contexts/WalletContext";
import { getMarketPlaces } from "../api/api";
import type { Marketplace } from "../types/marketplace";
import MarketplaceGrid from "../components/marketplace-components/MarketplaceGrid";

const MarketPage: React.FC = () => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [filter, setFilter] = useState<"ALL" | "AVAILABLE" | "SOLD">("ALL");
  const { showLoader, hideLoader } = useLoader();
  const { showAlert } = useAlert();
  const { account } = useWallet();

  const fetchMarketplaces = async () => {
    showLoader();
    try {
      const data = await getMarketPlaces();
      setMarketplaces(data || []);
    } catch (error) {
      console.error("Failed to fetch marketplaces:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to load marketplace data. Please try again.",
        confirmText: "OK",
      });
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchMarketplaces();
  }, []);

  const userListings = account 
    ? marketplaces.filter(m => m.from?.toLowerCase() === account.toLowerCase())
    : [];

  const otherListings = account
    ? marketplaces.filter(m => m.from?.toLowerCase() !== account.toLowerCase())
    : marketplaces;

  const filteredOtherListings = otherListings.filter(m => {
    if (filter === "ALL") return true;
    if (filter === "AVAILABLE") return m.status === "open_to_sale";
    if (filter === "SOLD") return m.status === "sale_completed";
    return true;
  });

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-20">
      <section className="py-12 px-6 md:px-16 max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-green-900 mb-6">Deed Marketplace</h1>
        <p className="text-gray-600 mb-8 text-lg">Browse and purchase fractional ownership of property deeds</p>

        {userListings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold text-blue-900">Your Listings</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {userListings.length} {userListings.length === 1 ? 'listing' : 'listings'}
              </span>
            </div>
            <MarketplaceGrid 
              marketplaces={userListings} 
              onUpdate={fetchMarketplaces}
              isOwnListings={true}
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-green-900">
              {userListings.length > 0 ? 'Other Listings' : 'All Listings'}
            </h2>
          </div>

          <div className="flex gap-4 mb-8">
            {[
              { key: "ALL", label: "All Listings" },
              { key: "AVAILABLE", label: "Available" },
              { key: "SOLD", label: "Sold" }
            ].map((f) => (
              <button
                key={f.key}
                className={`px-6 py-2 rounded-full font-semibold transition cursor-pointer ${
                  filter === f.key 
                    ? "bg-green-600 text-white shadow-lg" 
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
                onClick={() => setFilter(f.key as any)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredOtherListings.length} {filteredOtherListings.length === 1 ? 'listing' : 'listings'}
          </div>

          {filteredOtherListings.length > 0 ? (
            <MarketplaceGrid 
              marketplaces={filteredOtherListings} 
              onUpdate={fetchMarketplaces}
              isOwnListings={false}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No listings available at the moment.</p>
              <p className="text-gray-400 mt-2">Check back later for new opportunities!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MarketPage;