import React, { useState, useEffect } from "react";
import { FaHandshake, FaEthereum, FaCheckCircle, FaClock, FaExclamationCircle, FaArrowRight } from "react-icons/fa";
import { getTransactionsByDeedId } from "../../../api/api";
import { getEscrowStatus, getEscrowDetails } from "../../../web3.0/escrowIntegration";
import { useWallet } from "../../../contexts/WalletContext";
import { shortAddress } from "../../../utils/format";

interface PendingEscrowBannerProps {
  deedId: string;
  onOpenEscrow: (escrowAddress: string) => void;
  onRefresh?: () => void;
}

const PendingEscrowBanner: React.FC<PendingEscrowBannerProps> = ({
  deedId,
  onOpenEscrow,
  onRefresh
}) => {
  const { account } = useWallet();
  const [pendingEscrows, setPendingEscrows] = useState<Array<{
    escrowAddress: string;
    buyer: string;
    price: string;
    isSellerDeposited: boolean;
    isBuyerDeposited: boolean;
    transactionId: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPendingEscrows = async () => {
      if (!deedId || !account) {
        if (isMounted) {
          setPendingEscrows([]);
          setLoading(false);
        }
        return;
      }

      try {
        const txs = await getTransactionsByDeedId(deedId);
        if (!isMounted) return;
        
        if (!Array.isArray(txs)) {
          setPendingEscrows([]);
          setLoading(false);
          return;
        }

        const pendingEscrowTxs = txs.filter((t: any) => 
          t.type === "escrow_sale" && 
          (t.from || "").toLowerCase() === account.toLowerCase() && 
          t.blockchain_identification &&
          t.status !== "completed" &&
          t.status !== "failed"
        );

        const escrowDetails = await Promise.allSettled(
          pendingEscrowTxs.map(async (tx: any) => {
            try {
              const [details, status] = await Promise.all([
                getEscrowDetails(tx.blockchain_identification),
                getEscrowStatus(tx.blockchain_identification)
              ]);
              
              return {
                escrowAddress: tx.blockchain_identification,
                buyer: details.buyer,
                price: details.price,
                isSellerDeposited: status.isSellerDeposited,
                isBuyerDeposited: status.isBuyerDeposited,
                transactionId: tx._id
              };
            } catch (error) {
              console.error("Failed to fetch escrow details:", error);
              return null;
            }
          })
        );

        if (!isMounted) return;

        const validEscrows = escrowDetails
          .filter((result): result is PromiseFulfilledResult<any> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);

        setPendingEscrows(validEscrows);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch pending escrows:", error);
        if (isMounted) {
          setPendingEscrows([]);
          setLoading(false);
        }
      }
    };

    fetchPendingEscrows();
    const interval = setInterval(() => {
      if (isMounted) {
        fetchPendingEscrows();
        if (onRefresh) onRefresh();
      }
    }, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deedId, account, onRefresh]);

  if (loading) {
    return (
      <div className="w-full mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading escrow information...</span>
        </div>
      </div>
    );
  }

  if (pendingEscrows.length === 0) {
    return null;
  }

  const getStatusInfo = (escrow: typeof pendingEscrows[0]) => {
    if (!escrow.isSellerDeposited && !escrow.isBuyerDeposited) {
      return {
        text: "Waiting for your NFT deposit",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        icon: FaClock,
        step: 1,
        totalSteps: 3
      };
    } else if (escrow.isSellerDeposited && !escrow.isBuyerDeposited) {
      return {
        text: "Waiting for buyer payment",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: FaClock,
        step: 2,
        totalSteps: 3
      };
    } else if (escrow.isSellerDeposited && escrow.isBuyerDeposited) {
      return {
        text: "Ready to finalize",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: FaCheckCircle,
        step: 3,
        totalSteps: 3
      };
    }
    return {
      text: "In progress",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: FaClock,
      step: 1,
      totalSteps: 3
    };
  };

  return (
    <div className="w-full mb-6 space-y-4">
      {pendingEscrows.map((escrow) => {
        const statusInfo = getStatusInfo(escrow);
        const StatusIcon = statusInfo.icon;
        
        return (
          <div
            key={escrow.escrowAddress}
            className="bg-white rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-b-2 px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${statusInfo.bgColor} rounded-lg border ${statusInfo.borderColor}`}>
                    <StatusIcon className={statusInfo.color} size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Active Escrow Sale</h3>
                    <p className={`text-sm ${statusInfo.color} font-medium mt-0.5`}>
                      {statusInfo.text}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                  <span className="text-xs font-semibold text-gray-600">
                    Step {statusInfo.step} of {statusInfo.totalSteps}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <FaEthereum className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-gray-700">Sale Price</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{escrow.price} ETH</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Buyer Address</div>
                    <div className="font-mono text-sm text-gray-900">{shortAddress(escrow.buyer)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Transaction Status</div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${escrow.isSellerDeposited ? "bg-green-500" : "bg-gray-300"}`}></span>
                          Your NFT Deposit
                        </span>
                        <span className={`text-sm font-semibold ${
                          escrow.isSellerDeposited ? "text-green-600" : "text-gray-400"
                        }`}>
                          {escrow.isSellerDeposited ? (
                            <span className="flex items-center gap-1">
                              <FaCheckCircle size={12} />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FaClock size={12} />
                              Pending
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${escrow.isBuyerDeposited ? "bg-green-500" : "bg-gray-300"}`}></span>
                          Buyer Payment
                        </span>
                        <span className={`text-sm font-semibold ${
                          escrow.isBuyerDeposited ? "text-green-600" : "text-gray-400"
                        }`}>
                          {escrow.isBuyerDeposited ? (
                            <span className="flex items-center gap-1">
                              <FaCheckCircle size={12} />
                              Deposited
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FaClock size={12} />
                              Waiting
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!escrow.isSellerDeposited && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FaExclamationCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={16} />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Action Required</p>
                      <p className="text-amber-700">Deposit your NFT to proceed with the escrow sale.</p>
                    </div>
                  </div>
                </div>
              )}

              {escrow.isSellerDeposited && !escrow.isBuyerDeposited && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FaClock className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Waiting for Buyer</p>
                      <p className="text-blue-700">The buyer needs to deposit payment. You can withdraw your NFT if needed.</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => onOpenEscrow(escrow.escrowAddress)}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <FaHandshake size={16} />
                <span>Manage Escrow Sale</span>
                <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PendingEscrowBanner;
