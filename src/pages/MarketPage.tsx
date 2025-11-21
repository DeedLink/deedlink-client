import React, { useEffect, useState } from "react";
import { useLoader } from "../contexts/LoaderContext";
import { useAlert } from "../contexts/AlertContext";
import { useWallet } from "../contexts/WalletContext";
import { getMarketPlaces } from "../api/api";
import type { Marketplace } from "../types/marketplace";
import MarketplaceGrid from "../components/marketplace-components/MarketplaceGrid";
import { FaSearch } from "react-icons/fa";

const MarketPage: React.FC = () => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [filter, setFilter] = useState<"ALL" | "AVAILABLE" | "SOLD">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "date_desc" | "date_asc">("date_desc");
  const { showLoader, hideLoader } = useLoader();
  const { showAlert } = useAlert();
  const { account } = useWallet();

  const fetchMarketplaces = async () => {
    showLoader();
    try {
      const data = await getMarketPlaces();
      setMarketplaces(Array.isArray(data) ? data : []);
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
  }).filter(m => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.tokenId?.toString().includes(query) ||
      m.marketPlaceId?.toString().includes(query) ||
      m.amount?.toString().includes(query) ||
      m.share?.toString().includes(query)
    );
  }).sort((a, b) => {
    if (sortBy === "price_asc") return (a.amount || 0) - (b.amount || 0);
    if (sortBy === "price_desc") return (b.amount || 0) - (a.amount || 0);
    if (sortBy === "date_desc") {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === "date_asc") {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateA - dateB;
    }
    return 0;
  });

  const availableCount = marketplaces.filter(m => m.status === "open_to_sale").length;
  const soldCount = marketplaces.filter(m => m.status === "sale_completed").length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Browse and purchase property listings</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400 bg-white"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-900"
            >
              <option value="date_desc">Newest</option>
              <option value="date_asc">Oldest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {userListings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Listings</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                {userListings.length}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {userListings.length > 0 ? 'All Listings' : 'Listings'}
            </h2>
            <span className="text-sm text-gray-600">
              {filteredOtherListings.length} found
            </span>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { key: "ALL", label: "All", count: marketplaces.length },
              { key: "AVAILABLE", label: "Available", count: availableCount },
              { key: "SOLD", label: "Sold", count: soldCount }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f.key 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>

          {filteredOtherListings.length > 0 ? (
            <MarketplaceGrid 
              marketplaces={filteredOtherListings} 
              onUpdate={fetchMarketplaces}
              isOwnListings={false}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                {searchQuery ? "No listings match your search" : "No listings available"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MarketPage;