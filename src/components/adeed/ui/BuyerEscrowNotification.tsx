import React, { useState, useEffect } from "react";
import { FaBell, FaHandshake, FaEthereum, FaTimes } from "react-icons/fa";
import { useWallet } from "../../../contexts/WalletContext";
import { tnxApi } from "../../../api/api";
import { getEscrowStatus, getEscrowDetails, getUserEscrows } from "../../../web3.0/escrowIntegration";
import { shortAddress } from "../../../utils/format";
import BuyerEscrowPopup from "../tnxPopups/BuyerEscrowPopup";

interface BuyerEscrowNotificationProps {
  onDismiss?: () => void;
}

const BuyerEscrowNotification: React.FC<BuyerEscrowNotificationProps> = ({ onDismiss }) => {
  const { account } = useWallet();
  const [pendingEscrows, setPendingEscrows] = useState<Array<{
    escrowAddress: string;
    seller: string;
    price: string;
    tokenId: string;
    deedId: string;
    isSellerDeposited: boolean;
    isBuyerDeposited: boolean;
    isFinalized: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null);
  const [dismissedEscrows, setDismissedEscrows] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    
    const fetchBuyerEscrows = async () => {
      if (!account) {
        if (isMounted) {
          setPendingEscrows([]);
          setLoading(false);
        }
        return;
      }

      try {
        const buyerEscrowTxs: Array<{ tx: any; deedId: string }> = [];

        try {
          const escrowAddresses = await getUserEscrows(account);
          
          for (const escrowAddress of escrowAddresses) {
            try {
              const details = await getEscrowDetails(escrowAddress);
              
              if (details.buyer.toLowerCase() === account.toLowerCase()) {
                const status = await getEscrowStatus(escrowAddress);
                
                if (!status.isFinalized) {
                  buyerEscrowTxs.push({
                    tx: {
                      blockchain_identification: escrowAddress,
                      type: "escrow_sale",
                      to: details.buyer,
                      from: details.seller,
                      amount: parseFloat(details.price),
                      status: status.isFinalized ? "completed" : "pending"
                    },
                    deedId: "" 
                  });
                }
              }
            } catch (error) {
              console.error(`Failed to fetch escrow ${escrowAddress}:`, error);
            }
          }
          
          if (buyerEscrowTxs.length === 0) {
            const allTransactions = await tnxApi.get("/").then(res => res.data).catch(() => []);
            
            if (Array.isArray(allTransactions)) {
              const buyerTxs = allTransactions.filter((t: any) => 
                t.type === "escrow_sale" && 
                (t.to || "").toLowerCase() === account.toLowerCase() &&
                t.blockchain_identification &&
                t.status !== "completed" &&
                t.status !== "failed" &&
                t.deedId
              );
              
              buyerTxs.forEach(tx => buyerEscrowTxs.push({ tx, deedId: tx.deedId }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch escrows:", error);
        }

        const escrowPromises = buyerEscrowTxs
          .filter(({ tx }) => !dismissedEscrows.has(tx.blockchain_identification))
          .map(async ({ tx, deedId }) => {
            try {
              const [details, status] = await Promise.all([
                getEscrowDetails(tx.blockchain_identification),
                getEscrowStatus(tx.blockchain_identification)
              ]);

              if (status.isFinalized) {
                return null;
              }

              return {
                escrowAddress: tx.blockchain_identification,
                seller: details.seller,
                price: details.price,
                tokenId: details.tokenId,
                deedId: deedId,
                isSellerDeposited: status.isSellerDeposited,
                isBuyerDeposited: status.isBuyerDeposited,
                isFinalized: status.isFinalized
              };
            } catch (error) {
              console.error("Failed to fetch escrow details:", error);
              return null;
            }
          });

        const escrowResults = await Promise.allSettled(escrowPromises);
        const validEscrows = escrowResults
          .filter((result): result is PromiseFulfilledResult<any> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);

        if (!isMounted) return;

        setPendingEscrows(validEscrows || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch buyer escrows:", error);
        if (isMounted) {
          setPendingEscrows([]);
          setLoading(false);
        }
      }
    };

    fetchBuyerEscrows();
    const interval = setInterval(() => {
      if (isMounted) {
        fetchBuyerEscrows();
      }
    }, 15000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [account, dismissedEscrows]);

  const handleDismiss = (escrowAddress: string) => {
    setDismissedEscrows(prev => new Set([...prev, escrowAddress]));
    setPendingEscrows(prev => prev.filter(e => e.escrowAddress !== escrowAddress));
    if (onDismiss) {
      onDismiss();
    }
  };

  // Filter out escrows that are currently open in popup
  const visibleEscrows = pendingEscrows.filter(e => e.escrowAddress !== selectedEscrow);

  if (loading) {
    return null;
  }

  if (visibleEscrows.length === 0 && !selectedEscrow) {
    return null;
  }

  return (
    <>
      {visibleEscrows.length > 0 && (
        <div className="fixed top-20 right-4 z-50 max-w-md w-full space-y-3">
          {visibleEscrows.map((escrow) => (
          <div
            key={escrow.escrowAddress}
            className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border-2 border-blue-300 overflow-hidden animate-slide-in-right"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaBell className="text-white animate-pulse" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">New Escrow Sale</h3>
                    <p className="text-sm text-blue-100 mt-0.5">
                      A seller wants to sell you a property
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(escrow.escrowAddress)}
                  className="text-white/80 hover:text-white transition p-1"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Seller:</span>
                  <span className="font-mono text-gray-900">{shortAddress(escrow.seller)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Price:</span>
                  <span className="font-semibold text-green-700 flex items-center gap-1">
                    <FaEthereum size={12} /> {escrow.price} ETH
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Property Token ID:</span>
                  <span className="font-semibold text-gray-900">#{escrow.tokenId}</span>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Status:</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Seller Deposited NFT:</span>
                      <span className={`text-xs font-semibold ${escrow.isSellerDeposited ? "text-green-600" : "text-orange-600"}`}>
                        {escrow.isSellerDeposited ? "✓ Yes" : "✗ Waiting"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Your Payment:</span>
                      <span className={`text-xs font-semibold ${escrow.isBuyerDeposited ? "text-green-600" : "text-orange-600"}`}>
                        {escrow.isBuyerDeposited ? "✓ Deposited" : "✗ Not Deposited"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedEscrow(escrow.escrowAddress);
                }}
                className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <FaHandshake size={16} />
                <span>View Escrow Details</span>
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {selectedEscrow && (
        <BuyerEscrowPopup
          isOpen={!!selectedEscrow}
          escrowAddress={selectedEscrow}
          onClose={() => setSelectedEscrow(null)}
        />
      )}
    </>
  );
};

export default BuyerEscrowNotification;

