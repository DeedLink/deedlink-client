import { useState, useEffect } from "react";
import { FaUserShield } from "react-icons/fa";
import type { IDeed } from "../../../types/responseDeed";
import { calculateOwnershipFromEvents } from "../../../web3.0/eventService";
import { getTransactionsByDeedId } from "../../../api/api";
import VerificationBadge from "./VerificationBadge";

interface OwnerInformationProps {
  deed: IDeed;
}

const OwnerInformation = ({ deed }: OwnerInformationProps) => {
  const [onChainOwners, setOnChainOwners] = useState<Array<{ address: string; share: number }> | null>(null);
  const [offChainOwners, setOffChainOwners] = useState<Array<{ address: string; share: number }> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!deed.tokenId) {
        setOnChainOwners(null);
        setOffChainOwners(null);
        return;
      }

      try {
        console.log(`[ON-CHAIN] OwnerInformation: Fetching ownership from events for tokenId ${deed.tokenId}...`);
        const eventsOwners = await calculateOwnershipFromEvents(Number(deed.tokenId));
        console.log(`[ON-CHAIN] OwnerInformation: Successfully fetched on-chain owners:`, eventsOwners);
        setOnChainOwners(eventsOwners);
      } catch (error) {
        console.error("[ON-CHAIN] OwnerInformation: Error fetching on-chain owners from events:", error);
        setOnChainOwners(null);
      }

      try {
        console.log(`[OFF-CHAIN] OwnerInformation: Fetching transactions for deedId ${deed._id}...`);
        const transactions = await getTransactionsByDeedId(deed._id);
        console.log(`[OFF-CHAIN] OwnerInformation: Fetched ${transactions.length} transactions:`, transactions);
        
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
              console.log(`[OFF-CHAIN] OwnerInformation: Init transaction - setting ${to} to 100%`);
            } else if (tx.to && tx.share && tx.share > 0) {
              const to = tx.to.toLowerCase();
              const from = tx.from ? tx.from.toLowerCase() : null;
              
              if (from && from !== "0x0000000000000000000000000000000000000000") {
                const fromShare = ownersMap.get(from) || 0;
                const newFromShare = Math.max(0, fromShare - tx.share);
                ownersMap.set(from, newFromShare);
                console.log(`[OFF-CHAIN] OwnerInformation: Transfer ${tx.share}% from ${from} (new balance: ${newFromShare}%)`);
              }
              
              const currentShare = ownersMap.get(to) || 0;
              const newShare = currentShare + tx.share;
              ownersMap.set(to, newShare);
              console.log(`[OFF-CHAIN] OwnerInformation: Transfer ${tx.share}% to ${to} (new balance: ${newShare}%)`);
            }
          }
        }
        
        if (!hasInit && ownersMap.size === 0 && deed.owners && deed.owners.length > 0) {
          deed.owners.forEach(o => {
            ownersMap.set(o.address.toLowerCase(), o.share);
          });
          console.log(`[OFF-CHAIN] OwnerInformation: No init transaction found, using deed owners as initial state`);
        }

        const calculatedOwners = Array.from(ownersMap.entries())
          .filter(([_, share]) => share > 0)
          .map(([address, share]) => ({ address, share }))
          .sort((a, b) => b.share - a.share);

        console.log(`[OFF-CHAIN] OwnerInformation: Calculated owners from transactions:`, calculatedOwners);

        if (calculatedOwners.length > 0) {
          setOffChainOwners(calculatedOwners);
        } else if (deed.owners && deed.owners.length > 0) {
          const fallbackOwners = deed.owners.map(o => ({
            address: o.address.toLowerCase(),
            share: o.share
          }));
          console.log(`[OFF-CHAIN] OwnerInformation: Using fallback owners from deed:`, fallbackOwners);
          setOffChainOwners(fallbackOwners);
        } else {
          console.log(`[OFF-CHAIN] OwnerInformation: No owners found, setting empty array`);
          setOffChainOwners([]);
        }
      } catch (error) {
        console.error("[OFF-CHAIN] OwnerInformation: Error calculating off-chain owners from transactions:", error);
        if (deed.owners && deed.owners.length > 0) {
          const fallbackOwners = deed.owners.map(o => ({
            address: o.address.toLowerCase(),
            share: o.share
          }));
          console.log(`[OFF-CHAIN] OwnerInformation: Using fallback owners after error:`, fallbackOwners);
          setOffChainOwners(fallbackOwners);
        } else {
          setOffChainOwners([]);
        }
      }
    };

    fetchData();
  }, [deed.tokenId, deed._id, deed.owners]);

  const compareOwners = (
    onChain: Array<{ address: string; share: number }> | null,
    offChain: Array<{ address: string; share: number }> | null
  ) => {
    if (!onChain || !offChain) {
      console.log(`[VERIFICATION] OwnerInformation: Missing data - onChain: ${!!onChain}, offChain: ${!!offChain}`);
      return false;
    }
    
    if (onChain.length === 0 && offChain.length === 0) {
      console.log(`[VERIFICATION] OwnerInformation: Both empty arrays - verified`);
      return true;
    }
    
    if (onChain.length !== offChain.length) {
      console.log(`[VERIFICATION] OwnerInformation: Length mismatch - onChain: ${onChain.length}, offChain: ${offChain.length}`);
      return false;
    }

    const onChainMap = new Map(onChain.map(o => [o.address.toLowerCase(), o.share]));
    const offChainMap = new Map(offChain.map(o => [o.address.toLowerCase(), o.share]));

    if (onChainMap.size !== offChainMap.size) {
      console.log(`[VERIFICATION] OwnerInformation: Map size mismatch - onChain: ${onChainMap.size}, offChain: ${offChainMap.size}`);
      return false;
    }

    let totalOnChain = 0;
    let totalOffChain = 0;
    
    for (const [address, share] of onChainMap) {
      totalOnChain += share;
      const offChainShare = offChainMap.get(address);
      if (offChainShare === undefined) {
        console.log(`[VERIFICATION] OwnerInformation: Address ${address} not found in offChain`);
        return false;
      }
      totalOffChain += offChainShare;
      const diff = Math.abs(share - offChainShare);
      if (diff > 0.1) {
        console.log(`[VERIFICATION] OwnerInformation: Share mismatch for ${address} - onChain: ${share}%, offChain: ${offChainShare}%, diff: ${diff}%`);
        return false;
      }
    }

    const totalDiff = Math.abs(totalOnChain - totalOffChain);
    if (totalDiff > 0.1) {
      console.log(`[VERIFICATION] OwnerInformation: Total share mismatch - onChain: ${totalOnChain}%, offChain: ${totalOffChain}%, diff: ${totalDiff}%`);
      return false;
    }

    console.log(`[VERIFICATION] OwnerInformation: All owners match! Total: ${totalOnChain.toFixed(2)}%`);
    return true;
  };

  return (
    <section className="rounded-xl border border-gray-200 p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaUserShield className="text-emerald-700" size={20} />
          <h2 className="text-lg font-bold text-gray-900">Owner Information</h2>
        </div>
        {deed.tokenId && (
          <VerificationBadge
            onChainData={onChainOwners}
            offChainData={offChainOwners}
            compareFn={compareOwners}
            label="Owner Verification"
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Full Name</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerFullName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">NIC</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerNIC}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Phone</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerPhone}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Address</div>
          <div className="font-medium text-gray-800 mt-1">{deed.ownerAddress}</div>
        </div>
      </div>
    </section>
  );
};

export default OwnerInformation;