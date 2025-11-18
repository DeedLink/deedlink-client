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
        const eventsOwners = await calculateOwnershipFromEvents(Number(deed.tokenId));
        setOnChainOwners(eventsOwners);
      } catch (error) {
        console.error("Error fetching on-chain owners from events:", error);
        setOnChainOwners(null);
      }

      try {
        const transactions = await getTransactionsByDeedId(deed._id);
        const ownersMap = new Map<string, number>();
        
        for (const tx of transactions) {
          if (tx.status === "completed" && tx.to && tx.share) {
            const to = tx.to.toLowerCase();
            const currentShare = ownersMap.get(to) || 0;
            ownersMap.set(to, currentShare + tx.share);
            
            if (tx.from && tx.from.toLowerCase() !== "0x0000000000000000000000000000000000000000") {
              const from = tx.from.toLowerCase();
              const fromShare = ownersMap.get(from) || 0;
              ownersMap.set(from, Math.max(0, fromShare - tx.share));
            }
          }
        }

        const calculatedOwners = Array.from(ownersMap.entries())
          .filter(([_, share]) => share > 0)
          .map(([address, share]) => ({ address, share }))
          .sort((a, b) => b.share - a.share);

        if (calculatedOwners.length > 0) {
          setOffChainOwners(calculatedOwners);
        } else if (deed.owners && deed.owners.length > 0) {
          setOffChainOwners(deed.owners.map(o => ({
            address: o.address.toLowerCase(),
            share: o.share
          })));
        } else {
          setOffChainOwners([]);
        }
      } catch (error) {
        console.error("Error calculating off-chain owners from transactions:", error);
        if (deed.owners && deed.owners.length > 0) {
          setOffChainOwners(deed.owners.map(o => ({
            address: o.address.toLowerCase(),
            share: o.share
          })));
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
    if (!onChain || !offChain) return false;
    if (onChain.length !== offChain.length) return false;

    const onChainMap = new Map(onChain.map(o => [o.address, o.share]));
    const offChainMap = new Map(offChain.map(o => [o.address, o.share]));

    if (onChainMap.size !== offChainMap.size) return false;

    for (const [address, share] of onChainMap) {
      const offChainShare = offChainMap.get(address);
      if (offChainShare === undefined || Math.abs(share - offChainShare) > 0.01) {
        return false;
      }
    }

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