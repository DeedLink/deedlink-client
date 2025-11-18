import { useState, useEffect } from "react";
import { FaUserShield } from "react-icons/fa";
import type { IDeed } from "../../../types/responseDeed";
import { shortAddress } from "../../../utils/format";
import { calculateOwnershipFromEvents } from "../../../web3.0/eventService";
import { getTransactionsByDeedId } from "../../../api/api";
import VerificationBadge from "./VerificationBadge";

interface BlockchainOwnersProps {
  deed: IDeed;
}

interface OwnerData {
  address: string;
  share: number;
}

const BlockchainOwners = ({ deed }: BlockchainOwnersProps) => {
  const [onChainOwners, setOnChainOwners] = useState<OwnerData[] | null>(null);
  const [offChainOwners, setOffChainOwners] = useState<OwnerData[] | null>(null);

  useEffect(() => {
    const fetchOnChainData = async () => {
      if (!deed.tokenId) {
        setOnChainOwners(null);
        return;
      }

      try {
        console.log(`[ON-CHAIN] BlockchainOwners: Fetching ownership from events for tokenId ${deed.tokenId}...`);
        const owners = await calculateOwnershipFromEvents(Number(deed.tokenId));
        console.log(`[ON-CHAIN] BlockchainOwners: Successfully fetched on-chain owners:`, owners);
        setOnChainOwners(owners);
      } catch (error) {
        console.error("[ON-CHAIN] BlockchainOwners: Error fetching on-chain owners from events:", error);
        setOnChainOwners(null);
      }
    };

    const fetchOffChainData = async () => {
      if (!deed._id) {
        if (deed.owners && deed.owners.length > 0) {
          setOffChainOwners(deed.owners.map(o => ({
            address: o.address.toLowerCase(),
            share: o.share
          })));
        } else {
          setOffChainOwners([]);
        }
        return;
      }

      try {
        console.log(`[OFF-CHAIN] BlockchainOwners: Fetching transactions for deedId ${deed._id}...`);
        const transactions = await getTransactionsByDeedId(deed._id);
        console.log(`[OFF-CHAIN] BlockchainOwners: Fetched ${transactions.length} transactions:`, transactions);
        
        const ownersMap = new Map<string, number>();
        let hasInit = false;
        
        const sortedTxs = [...transactions].sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0).getTime();
          const dateB = new Date(b.date || b.createdAt || 0).getTime();
          return dateA - dateB;
        });
        
        for (const tx of sortedTxs) {
          if (tx.status === "completed") {
            if (tx.type === "init" && tx.to) {
              const to = tx.to.toLowerCase();
              ownersMap.set(to, 100);
              hasInit = true;
              console.log(`[OFF-CHAIN] BlockchainOwners: Init transaction - setting ${to} to 100%`);
            } else if (tx.to && tx.share && tx.share > 0) {
              const to = tx.to.toLowerCase();
              const from = tx.from ? tx.from.toLowerCase() : null;
              
              if (from && from !== "0x0000000000000000000000000000000000000000") {
                const fromShare = ownersMap.get(from) || 0;
                const newFromShare = Math.max(0, fromShare - tx.share);
                ownersMap.set(from, newFromShare);
                console.log(`[OFF-CHAIN] BlockchainOwners: Transfer ${tx.share}% from ${from} (new balance: ${newFromShare}%)`);
              }
              
              const currentShare = ownersMap.get(to) || 0;
              const newShare = currentShare + tx.share;
              ownersMap.set(to, newShare);
              console.log(`[OFF-CHAIN] BlockchainOwners: Transfer ${tx.share}% to ${to} (new balance: ${newShare}%)`);
            }
          }
        }
        
        if (!hasInit && ownersMap.size === 0 && deed.owners && deed.owners.length > 0) {
          deed.owners.forEach(o => {
            ownersMap.set(o.address.toLowerCase(), o.share);
          });
          console.log(`[OFF-CHAIN] BlockchainOwners: No init transaction found, using deed owners as initial state`);
        }

        const calculatedOwners = Array.from(ownersMap.entries())
          .filter(([_, share]) => share > 0)
          .map(([address, share]) => ({ address, share }))
          .sort((a, b) => b.share - a.share);

        console.log(`[OFF-CHAIN] BlockchainOwners: Calculated owners from transactions:`, calculatedOwners);

        if (calculatedOwners.length > 0) {
          setOffChainOwners(calculatedOwners);
        } else if (deed.owners && deed.owners.length > 0) {
          const fallbackOwners = deed.owners.map(o => ({
            address: o.address.toLowerCase(),
            share: o.share
          }));
          console.log(`[OFF-CHAIN] BlockchainOwners: Using fallback owners from deed:`, fallbackOwners);
          setOffChainOwners(fallbackOwners);
        } else {
          console.log(`[OFF-CHAIN] BlockchainOwners: No owners found, setting empty array`);
          setOffChainOwners([]);
        }
      } catch (error) {
        console.error("[OFF-CHAIN] BlockchainOwners: Error calculating off-chain owners from transactions:", error);
        if (deed.owners && deed.owners.length > 0) {
          const fallbackOwners = deed.owners.map(o => ({
            address: o.address.toLowerCase(),
            share: o.share
          }));
          console.log(`[OFF-CHAIN] BlockchainOwners: Using fallback owners after error:`, fallbackOwners);
          setOffChainOwners(fallbackOwners);
        } else {
          setOffChainOwners([]);
        }
      }
    };

    fetchOnChainData();
    fetchOffChainData();
  }, [deed.tokenId, deed._id, deed.owners]);

  const compareOwners = (onChain: OwnerData[], offChain: OwnerData[]) => {
    if (!onChain || !offChain) {
      console.log(`[VERIFICATION] BlockchainOwners: Missing data - onChain: ${!!onChain}, offChain: ${!!offChain}`);
      return false;
    }
    
    if (onChain.length === 0 && offChain.length === 0) {
      console.log(`[VERIFICATION] BlockchainOwners: Both empty arrays - verified`);
      return true;
    }
    
    if (onChain.length !== offChain.length) {
      console.log(`[VERIFICATION] BlockchainOwners: Length mismatch - onChain: ${onChain.length}, offChain: ${offChain.length}`);
      return false;
    }

    const onChainMap = new Map(
      onChain.map(o => [o.address.toLowerCase(), o.share])
    );
    const offChainMap = new Map(
      offChain.map(o => [o.address.toLowerCase(), o.share])
    );

    if (onChainMap.size !== offChainMap.size) {
      console.log(`[VERIFICATION] BlockchainOwners: Map size mismatch - onChain: ${onChainMap.size}, offChain: ${offChainMap.size}`);
      return false;
    }

    let totalOnChain = 0;
    let totalOffChain = 0;
    
    for (const [address, share] of onChainMap) {
      totalOnChain += share;
      const offChainShare = offChainMap.get(address);
      if (offChainShare === undefined) {
        console.log(`[VERIFICATION] BlockchainOwners: Address ${address} not found in offChain`);
        return false;
      }
      totalOffChain += offChainShare;
      const diff = Math.abs(share - offChainShare);
      if (diff > 0.1) {
        console.log(`[VERIFICATION] BlockchainOwners: Share mismatch for ${address} - onChain: ${share}%, offChain: ${offChainShare}%, diff: ${diff}%`);
        return false;
      }
    }

    const totalDiff = Math.abs(totalOnChain - totalOffChain);
    if (totalDiff > 0.1) {
      console.log(`[VERIFICATION] BlockchainOwners: Total share mismatch - onChain: ${totalOnChain}%, offChain: ${totalOffChain}%, diff: ${totalDiff}%`);
      return false;
    }

    console.log(`[VERIFICATION] BlockchainOwners: All owners match! Total: ${totalOnChain.toFixed(2)}%`);
    return true;
  };

  return (
    <section className="rounded-xl border border-gray-200 p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaUserShield className="text-emerald-700" size={20} />
          <h2 className="text-lg font-bold text-gray-900">Blockchain Owners</h2>
        </div>
        {deed.tokenId && (
          <VerificationBadge
            onChainData={onChainOwners}
            offChainData={offChainOwners}
            compareFn={compareOwners}
            label="Ownership Verification"
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {deed.owners.map((o, idx) => (
          <div key={idx} className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-200 font-semibold">
            {shortAddress(o.address)} • {o.share}%
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlockchainOwners;