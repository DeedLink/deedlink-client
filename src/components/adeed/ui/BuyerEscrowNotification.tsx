import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "../../../contexts/WalletContext";
import { useLogin } from "../../../contexts/LoginContext";
import { tnxApi } from "../../../api/api";
import { getEscrowStatus, getEscrowDetails, getUserEscrows } from "../../../web3.0/escrowIntegration";
import { shortAddress } from "../../../utils/format";
import BuyerEscrowPopup from "../tnxPopups/BuyerEscrowPopup";
import { useFloatingNotify } from "../../../contexts/FloatingNotifyContext";

interface BuyerEscrowNotificationProps {
  onDismiss?: () => void;
}

const BuyerEscrowNotification: React.FC<BuyerEscrowNotificationProps> = ({ onDismiss }) => {
  const { account } = useWallet();
  const { token, user } = useLogin();
  const { showNotification, clearNotification } = useFloatingNotify();
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
  const [_notificationMap, setNotificationMap] = useState<Record<string, string>>({});
  const dismissedEscrowsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    
    const fetchBuyerEscrows = async () => {
      // Only show notifications if user is logged in (authenticated), not just wallet connected
      if (!account || !token || !user) {
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
          .filter(({ tx }) => !dismissedEscrowsRef.current.has(tx.blockchain_identification))
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
  }, [account, token, user]);

  useEffect(() => {
    if (!account || !token || !user) {
      setNotificationMap(prev => {
        Object.values(prev).forEach(id => clearNotification(id));
        return {};
      });
      dismissedEscrowsRef.current.clear();
      setSelectedEscrow(null);
    }
  }, [account, token, user, clearNotification]);

  useEffect(() => {
    setNotificationMap(prev => {
      if (!Object.keys(prev).length) return prev;
      const activeAddresses = new Set(pendingEscrows.map(e => e.escrowAddress));
      const updates: Record<string, string> = {};
      
      Object.entries(prev).forEach(([address, notifId]) => {
        if (!activeAddresses.has(address)) {
          clearNotification(notifId);
        } else {
          updates[address] = notifId;
        }
      });
      
      return updates;
    });
  }, [pendingEscrows, clearNotification]);

  useEffect(() => {
    if (loading) return;
    
    setNotificationMap(prev => {
      const newEscrows = pendingEscrows.filter(e => 
        !prev[e.escrowAddress] && !dismissedEscrowsRef.current.has(e.escrowAddress)
      );

      if (newEscrows.length === 0) {
        return prev;
      }

      const updates: Record<string, string> = { ...prev };

      newEscrows.forEach((escrow) => {
        const notificationId = showNotification({
          type: "info",
          title: "Escrow awaiting your action",
          message: `Property #${escrow.tokenId} • ${escrow.price} ETH from ${shortAddress(escrow.seller)}`,
          onClick: () => {
            setSelectedEscrow(escrow.escrowAddress);
            onDismiss?.();
          },
          onRemove: (reason) => {
            setNotificationMap(current => {
              const { [escrow.escrowAddress]: _removed, ...rest } = current;
              return rest;
            });

            if (reason === "manual") {
              dismissedEscrowsRef.current.add(escrow.escrowAddress);
            }
          }
        });

        updates[escrow.escrowAddress] = notificationId;
      });

      return updates;
    });
  }, [pendingEscrows, showNotification, loading, onDismiss]);

  if (!selectedEscrow) {
    return null;
  }

  return (
    <BuyerEscrowPopup
      isOpen={!!selectedEscrow}
      escrowAddress={selectedEscrow}
      onClose={() => setSelectedEscrow(null)}
    />
  );
};

export default BuyerEscrowNotification;

