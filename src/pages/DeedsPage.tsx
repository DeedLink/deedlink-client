import { useEffect, useMemo, useState } from "react";
import DeedsToolbar from "../components/deeds/DeedsToolbar";
import DeedGrid from "../components/deeds/DeedGrid";
import DeedViewerPopup from "../components/deeds/DeedViewerPopup";
import type { IDeed } from "../types/responseDeed";
import { useLoader } from "../contexts/LoaderContext";
import { useWallet } from "../contexts/WalletContext";
import { getDeedsByOwner } from "../api/api";
import { getSignatures } from "../web3.0/contractService";
import PurchancePanel from "../components/notifications/Purchasing";

type SortKey = "newest" | "value" | "area" | "share";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

const DeedsPage = () => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [viewer, setViewer] = useState<IDeed | null>(null);
  const [deeds, setDeeds] = useState<IDeed[]>([]);
  const [deedSignatures, setDeedSignatures] = useState<Map<string, ISignatures>>(new Map());
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();

  useEffect(() => {
    if (viewer) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [viewer]);

  const fetchDeeds = async () => {
    if (!account) return;
    
    showLoader();
    try {
      const res = await getDeedsByOwner(account);
      
      if (res && res.length > 0) {
        const signaturesMap = new Map<string, ISignatures>();
        const fullySignedDeeds: IDeed[] = [];
        
        // Process all deeds - getDeedsByOwner already returns deeds where user is an owner (any share)
        for (const deed of res) {
          // Only process deeds with tokenId (they can have signatures)
          if (deed.tokenId !== undefined) {
            try {
              const sigs = await getSignatures(deed.tokenId);
              signaturesMap.set(deed._id, sigs);
              
              // Only show fully signed deeds
              if (sigs.fully) {
                fullySignedDeeds.push(deed);
              }
            } catch (error) {
              console.error(`Failed to fetch signatures for deed ${deed._id}:`, error);
            }
          }
        }
        
        setDeeds(fullySignedDeeds);
        setDeedSignatures(signaturesMap);
      } else {
        setDeeds([]);
      }
    } catch (error) {
      console.error("Failed to fetch deeds:", error);
      setDeeds([]);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchDeeds();
  }, [account]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = deeds.filter((d) => {
      const inOwners = d.owners.some((o) => o.address.toLowerCase().includes(q));
      return (
        !q ||
        d.deedNumber.toLowerCase().includes(q) ||
        d.ownerFullName.toLowerCase().includes(q) ||
        d.landTitleNumber.toLowerCase().includes(q) ||
        inOwners
      );
    });

    const withMyShare = filtered.map((d) => ({
      deed: d,
      myShare: d.owners.find((o) => o.address.toLowerCase() === account?.toLowerCase())?.share ?? 0,
    }));

    withMyShare.sort((a, b) => {
      switch (sortBy) {
        case "value":
          const valueA = a.deed.valuation && a.deed.valuation.length > 0
            ? a.deed.valuation.slice().sort((x, y) => y.timestamp - x.timestamp)[0]?.estimatedValue || 0
            : 0;
          const valueB = b.deed.valuation && b.deed.valuation.length > 0
            ? b.deed.valuation.slice().sort((x, y) => y.timestamp - x.timestamp)[0]?.estimatedValue || 0
            : 0;
          return valueB - valueA;
        case "area":
          return b.deed.landArea - a.deed.landArea;
        case "share":
          return b.myShare - a.myShare;
        default:
          return b.deed.timestamp - a.deed.timestamp;
      }
    });

    return withMyShare.map((r) => r.deed);
  }, [query, sortBy, deeds, account]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-black/5 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-[#00420A]">My Deeds</h1>
            <div className="h-2 w-40 rounded-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
          </div>
          <div className="mt-4">
            <DeedsToolbar
              query={query}
              setQuery={setQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={() => { setQuery(""); setSortBy("newest"); }}
              total={results.length}
            />
            <PurchancePanel/>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!account ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
            <p className="text-2xl font-semibold text-gray-700">Connect Your Wallet</p>
            <p className="text-gray-500 mt-2">Please connect your wallet to view your deeds.</p>
          </div>
        ) : (
          <DeedGrid 
            deeds={results} 
            currentUser={account} 
            onOpen={setViewer} 
            deedSignatures={deedSignatures}
          />
        )}
      </main>

      <DeedViewerPopup 
        currency="ETH" 
        deed={viewer} 
        onClose={() => setViewer(null)}
        signatures={viewer ? deedSignatures.get(viewer._id) : undefined}
      />
    </div>
  );
};

export default DeedsPage;