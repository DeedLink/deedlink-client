import React, { useEffect, useState } from "react";
import { sampleTokens } from "../constants/const";
import type { Token } from "../types/types";
import TokenGrid from "../components/market/TokenGrid";
import { useLoader } from "../contexts/LoaderContext";
import { useAlert } from "../contexts/AlertContext";

const MarketPage: React.FC = () => {
  const [tokens, _setTokens] = useState<Token[]>(sampleTokens);
  const [filter, setFilter] = useState<"ALL" | "NFT" | "FT">("ALL");
  const { showLoader, hideLoader } = useLoader();
  const { showAlert } = useAlert();

  useEffect(()=>{
    showAlert({
      type: "warning",
      title: "⚠️ Under Development",
      message: "This marketplace feature is currently under development. Please check back soon!",
      confirmText: "OK",
    });
  },[]);

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);

    return () => clearTimeout(timer);
  },[]);

  const filteredTokens = filter === "ALL" ? tokens : tokens.filter(t => t.type === filter);
  const myTokens = filteredTokens.filter(t => t.isMine);
  const otherTokens = filteredTokens.filter(t => !t.isMine);

  const handleBuy = (id: string) => alert(`Buying token ${id}`);
  const handleSell = (id: string) => alert(`Selling token ${id}`);

  return (
    <div className="bg-[#1C1B1F] text-[#FEFBF6] min-h-screen pt-20">
      <section className="py-12 px-6 md:px-16">
        <h1 className="text-5xl font-bold text-[#A6D1E6] mb-6">Token Marketplace</h1>

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

        <h2 className="text-3xl font-bold text-[#7F5283] mb-4">My Tokens</h2>
        {myTokens.length > 0 ? <TokenGrid tokens={myTokens} onSell={handleSell} /> : <p className="text-[#FEFBF6]/70">You have no tokens for sale.</p>}
      </section>

      <section className="py-12 px-6 md:px-16 bg-[#2A292E] rounded-t-3xl">
        <h2 className="text-3xl font-bold text-[#7F5283] mb-4">Market Tokens</h2>
        {otherTokens.length > 0 ? <TokenGrid tokens={otherTokens} onBuy={handleBuy} /> : <p className="text-[#FEFBF6]/70">No tokens available in the market.</p>}
      </section>
    </div>
  );
};

export default MarketPage;
