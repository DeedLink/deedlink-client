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
    const fetchData = async () => {
      if (!deed.tokenId) {
        setOnChainOwners(null);
        if (!deed._id) {
          if (deed.owners && deed.owners.length > 0) {
            setOffChainOwners(deed.owners.map(o => ({
              address: o.address.toLowerCase(),
              share: o.share
            })));
          } else {
            setOffChainOwners([]);
          }
        }
        return;
      }

      // Fetch on-chain and off-chain data simultaneously
      const [onChainResult, offChainResult] = await Promise.allSettled([
        (async () => {
          console.log(`[ON-CHAIN] BlockchainOwners: Fetching ownership from events for tokenId ${deed.tokenId}...`);
          const owners = await calculateOwnershipFromEvents(Number(deed.tokenId));
          console.log(`[ON-CHAIN] BlockchainOwners: Successfully fetched on-chain owners:`, owners);
          return owners;
        })(),
        (async () => {
          if (!deed._id) {
            if (deed.owners && deed.owners.length > 0) {
              return deed.owners.map(o => ({
                address: o.address.toLowerCase(),
                share: o.share
              }));
            }
            return [];
          }
          console.log(`[OFF-CHAIN] BlockchainOwners: Fetching transactions for deedId ${deed._id}...`);
          const transactions = await getTransactionsByDeedId(deed._id);
          console.log(`[OFF-CHAIN] BlockchainOwners: Fetched ${transactions.length} transactions:`, transactions);
          return transactions;
        })()
      ]);

      // Process on-chain result
      if (onChainResult.status === 'fulfilled') {
        setOnChainOwners(onChainResult.value);
      } else {
        console.error("[ON-CHAIN] BlockchainOwners: Error fetching on-chain owners from events:", onChainResult.reason);
        setOnChainOwners(null);
      }

      // Process off-chain result
      if (offChainResult.status === 'fulfilled') {
        const result = offChainResult.value;
        
        // If result is already an array of owners (from deed.owners fallback)
        if (Array.isArray(result) && result.length > 0 && 'address' in result[0] && 'share' in result[0]) {
          setOffChainOwners(result);
          return;
        }

        // Otherwise, process transactions
        const transactions = result as any[];
        
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
              console.log(`[OFF-CHAIN] BlockchainOwners: ${tx.type === "defractionalize" ? "Defractionalization" : "Init"} transaction - setting ${to} to 100%`);
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
                console.log(`[OFF-CHAIN] BlockchainOwners: Full ownership transfer to ${to} (100%)`);
              } else {
                // Partial/fractional transfer
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
      } else {
        console.error("[OFF-CHAIN] BlockchainOwners: Error fetching off-chain data:", offChainResult.reason);
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

    fetchData();
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
      console.log(`[VERIFICATION] BlockchainOwners: On-chain owners:`, onChain);
      console.log(`[VERIFICATION] BlockchainOwners: Off-chain owners:`, offChain);
      
      const onChainAddresses = new Set(onChain.map(o => o.address.toLowerCase()));
      const offChainAddresses = new Set(offChain.map(o => o.address.toLowerCase()));
      
      const onlyOnChain = onChain.filter(o => !offChainAddresses.has(o.address.toLowerCase()));
      const onlyOffChain = offChain.filter(o => !onChainAddresses.has(o.address.toLowerCase()));
      
      if (onlyOnChain.length > 0 || onlyOffChain.length > 0) {
        console.log(`[VERIFICATION] BlockchainOwners: Addresses only in on-chain:`, onlyOnChain);
        console.log(`[VERIFICATION] BlockchainOwners: Addresses only in off-chain:`, onlyOffChain);
        return false;
      }
      
      const onChainTotal = onChain.reduce((sum, o) => sum + o.share, 0);
      const offChainTotal = offChain.reduce((sum, o) => sum + o.share, 0);
      const totalDiff = Math.abs(onChainTotal - offChainTotal);
      
      if (totalDiff > 0.1) {
        console.log(`[VERIFICATION] BlockchainOwners: Total ownership mismatch - onChain: ${onChainTotal}%, offChain: ${offChainTotal}%`);
        return false;
      }
      
      console.log(`[VERIFICATION] BlockchainOwners: Length differs but totals match - considering verified`);
      return true;
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
        const missingShare = share;
        if (missingShare > 0.1) {
          return false;
        }
        continue;
      }
      totalOffChain += offChainShare;
      const diff = Math.abs(share - offChainShare);
      const roundedDiff = Math.abs(parseFloat(share.toFixed(4)) - parseFloat(offChainShare.toFixed(4)));
      if (diff > 0.1 && roundedDiff > 0.01) {
        console.log(`[VERIFICATION] BlockchainOwners: Share mismatch for ${address} - onChain: ${share.toFixed(4)}%, offChain: ${offChainShare.toFixed(4)}%, diff: ${diff.toFixed(4)}%`);
        return false;
      }
    }
    
    for (const [address, share] of offChainMap) {
      if (!onChainMap.has(address)) {
        console.log(`[VERIFICATION] BlockchainOwners: Address ${address} only in offChain with ${share.toFixed(4)}%`);
        if (share > 0.1) {
          return false;
        }
      }
    }

    const totalDiff = Math.abs(totalOnChain - totalOffChain);
    const roundedTotalDiff = Math.abs(parseFloat(totalOnChain.toFixed(2)) - parseFloat(totalOffChain.toFixed(2)));
    if (totalDiff > 0.1 && roundedTotalDiff > 0.01) {
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
      <div className="space-y-3">
        {onChainOwners && onChainOwners.length > 0 ? (
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold mb-2">On-Chain Ownership</div>
            <div className="flex flex-wrap gap-2">
              {onChainOwners.map((o, idx) => (
                <div key={idx} className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 border-2 border-blue-200 font-semibold">
                  {shortAddress(o.address)} • {o.share.toFixed(4)}%
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {offChainOwners && offChainOwners.length > 0 ? (
          <div>
            <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Off-Chain Ownership</div>
            <div className="flex flex-wrap gap-2">
              {offChainOwners.map((o, idx) => (
                <div key={idx} className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-200 font-semibold">
                  {shortAddress(o.address)} • {o.share.toFixed(4)}%
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {(!onChainOwners || onChainOwners.length === 0) && (!offChainOwners || offChainOwners.length === 0) && (
          <div className="text-sm text-gray-500">No ownership data available</div>
        )}
      </div>
    </section>
  );
};

export default BlockchainOwners;