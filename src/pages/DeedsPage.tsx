import { useEffect, useMemo, useState } from "react";
import DeedsToolbar from "../components/deeds/DeedsToolbar";
import DeedGrid from "../components/deeds/DeedGrid";
import DeedViewerPopup from "../components/deeds/DeedViewerPopup";
import type { IDeed } from "../types/responseDeed";
import { useLoader } from "../contexts/LoaderContext";
import { useWallet } from "../contexts/WalletContext";
import { getDeedsByOwner, getTransactionsByDeedId } from "../api/api";
import { getSignatures, isPropertyFractionalized, getTotalSupply } from "../web3.0/contractService";
import { calculateOwnershipFromEvents } from "../web3.0/eventService";
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

  const calculateActualOwnership = async (deed: IDeed, userAddress: string): Promise<number> => {
    try {
      // First, try to get ownership from on-chain data (most accurate)
      if (deed.tokenId !== undefined) {
        try {
          const isFractionalized = await isPropertyFractionalized(Number(deed.tokenId));
          if (isFractionalized) {
            const totalSupply = await getTotalSupply(Number(deed.tokenId));
            const owners = await calculateOwnershipFromEvents(Number(deed.tokenId), totalSupply);
            const userOwner = owners.find(o => o.address.toLowerCase() === userAddress.toLowerCase());
            if (userOwner && userOwner.share > 0) {
              console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber}: On-chain ownership for ${userAddress}: ${userOwner.share}%`);
              return userOwner.share;
            }
          } else {
            const owners = await calculateOwnershipFromEvents(Number(deed.tokenId));
            const userOwner = owners.find(o => o.address.toLowerCase() === userAddress.toLowerCase());
            if (userOwner && userOwner.share > 0) {
              console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber}: On-chain ownership for ${userAddress}: ${userOwner.share}%`);
              return userOwner.share;
            }
          }
        } catch (onChainError) {
          console.warn(`[DEEDS-PAGE] Failed to get on-chain ownership for deed ${deed.deedNumber}, falling back to transactions:`, onChainError);
        }
      }

      // Fallback: Calculate from transactions
      if (deed._id) {
        const transactions = await getTransactionsByDeedId(deed._id);
        const ownersMap = new Map<string, number>();
        let hasInit = false;
        
        const sortedTxs = [...transactions].sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0).getTime();
          const dateB = new Date(b.date || b.createdAt || 0).getTime();
          return dateA - dateB;
        });
        
        for (const tx of sortedTxs) {
          if (tx.status === "completed") {
            if ((tx.type === "init" || tx.type === "defractionalize") && tx.to) {
              const to = tx.to.toLowerCase();
              ownersMap.clear();
              ownersMap.set(to, 100);
              hasInit = true;
              console.log(`[DEEDS-PAGE] ${tx.type === "defractionalize" ? "Defractionalization" : "Initialization"}: ${to} now owns 100%`);
            } else if (tx.to && tx.share && tx.share > 0 && tx.type !== "open_market") {
              // Skip "open_market" - it's just a listing, not an ownership transfer
              const to = tx.to.toLowerCase();
              const from = tx.from ? tx.from.toLowerCase() : null;
              
              // Check if this is a full ownership transfer
              const isFullOwnershipTransfer = tx.share >= 99.9 || 
                tx.type === "direct_transfer" || 
                tx.type === "gift" || 
                tx.type === "escrow_sale" ||
                (tx.type === "sale_transfer" && tx.share >= 99.9) ||
                (tx.type === "escrow" && tx.share >= 99.9);
              
              if (isFullOwnershipTransfer) {
                ownersMap.clear();
                ownersMap.set(to, 100);
                console.log(`[DEEDS-PAGE] Full ownership transfer: ${to} now owns 100%`);
              } else {
                // Partial/fractional transfer (including partial sale_transfer)
                if (from && from !== "0x0000000000000000000000000000000000000000") {
                  const fromShare = ownersMap.get(from) || 0;
                  ownersMap.set(from, Math.max(0, fromShare - tx.share));
                  console.log(`[DEEDS-PAGE] Transfer ${tx.share}% from ${from} (remaining: ${ownersMap.get(from)}%)`);
                }
                const currentShare = ownersMap.get(to) || 0;
                ownersMap.set(to, currentShare + tx.share);
                console.log(`[DEEDS-PAGE] Transfer ${tx.share}% to ${to} (total: ${ownersMap.get(to)}%)`);
              }
            }
          }
        }
        
        if (!hasInit && ownersMap.size === 0 && deed.owners && deed.owners.length > 0) {
          deed.owners.forEach(o => {
            ownersMap.set(o.address.toLowerCase(), o.share);
          });
        }

        const userShare = ownersMap.get(userAddress.toLowerCase()) || 0;
        console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber}: Calculated ownership from transactions for ${userAddress}: ${userShare}%`);
        return userShare;
      }

      // Last fallback: Check deed.owners array
      if (deed.owners && deed.owners.length > 0) {
        const userOwner = deed.owners.find(o => o.address.toLowerCase() === userAddress.toLowerCase());
        const share = userOwner?.share || 0;
        console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber}: Using deed.owners array for ${userAddress}: ${share}%`);
        return share;
      }

      return 0;
    } catch (error) {
      console.error(`[DEEDS-PAGE] Error calculating ownership for deed ${deed.deedNumber}:`, error);
      // Fallback to deed.owners array
      if (deed.owners && deed.owners.length > 0) {
        const userOwner = deed.owners.find(o => o.address.toLowerCase() === userAddress.toLowerCase());
        return userOwner?.share || 0;
      }
      return 0;
    }
  };

  const fetchDeeds = async () => {
    if (!account) return;
    
    showLoader();
    try {
      const res = await getDeedsByOwner(account);
      console.log(`[DEEDS-PAGE] Fetched ${res?.length || 0} deeds from API for account ${account}`);
      
      if (res && res.length > 0) {
        const signaturesMap = new Map<string, ISignatures>();
        const verifiedDeeds: Array<{ deed: IDeed; actualShare: number }> = [];
        
        // Verify actual ownership for each deed
        for (const deed of res) {
          try {
            // Calculate actual ownership from transactions/on-chain
            const actualShare = await calculateActualOwnership(deed, account);
            
            // Only include deeds where user actually has ownership > 0
            if (actualShare > 0) {
              console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber} verified: User has ${actualShare}% ownership`);
              
              // Only process deeds with tokenId (they can have signatures)
              if (deed.tokenId !== undefined) {
                try {
                  const sigs = await getSignatures(deed.tokenId);
                  signaturesMap.set(deed._id, sigs);
                  
                  // Only show fully signed deeds
                  if (sigs.fully) {
                    verifiedDeeds.push({ deed, actualShare });
                  } else {
                    console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber} skipped: Not fully signed`);
                  }
                } catch (error) {
                  console.error(`[DEEDS-PAGE] Failed to fetch signatures for deed ${deed._id}:`, error);
                  // Still include if we can't check signatures
                  verifiedDeeds.push({ deed, actualShare });
                }
              } else {
                // Deed without tokenId - include it
                verifiedDeeds.push({ deed, actualShare });
              }
            } else {
              console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber} filtered out: User has 0% ownership (actual calculation)`);
            }
          } catch (error) {
            console.error(`[DEEDS-PAGE] Error verifying ownership for deed ${deed.deedNumber}:`, error);
            // If verification fails, check if deed.owners array has the user
            const userOwner = deed.owners?.find(o => o.address.toLowerCase() === account.toLowerCase());
            if (userOwner && userOwner.share > 0) {
              console.log(`[DEEDS-PAGE] Deed ${deed.deedNumber} included via fallback (deed.owners array): ${userOwner.share}%`);
              if (deed.tokenId !== undefined) {
                try {
                  const sigs = await getSignatures(deed.tokenId);
                  signaturesMap.set(deed._id, sigs);
                  if (sigs.fully) {
                    verifiedDeeds.push({ deed, actualShare: userOwner.share });
                  }
                } catch {
                  verifiedDeeds.push({ deed, actualShare: userOwner.share });
                }
              } else {
                verifiedDeeds.push({ deed, actualShare: userOwner.share });
              }
            }
          }
        }
        
        console.log(`[DEEDS-PAGE] Final verified deeds count: ${verifiedDeeds.length}`);
        setDeeds(verifiedDeeds.map(v => v.deed));
        setDeedSignatures(signaturesMap);
      } else {
        setDeeds([]);
      }
    } catch (error) {
      console.error("[DEEDS-PAGE] Failed to fetch deeds:", error);
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