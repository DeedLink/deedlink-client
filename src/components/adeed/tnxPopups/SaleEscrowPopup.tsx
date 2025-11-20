import { type FC, useState, useEffect } from "react";
import { createTransaction, getUsers, getTransactionsByDeedId } from "../../../api/api";
import type { User } from "../../../types/types";
import { IoClose, IoWalletOutline, IoSearchOutline, IoCheckmarkCircle, IoCashOutline } from "react-icons/io5";
import { FaStore } from "react-icons/fa";
import { completeFullOwnershipTransfer, sellerDepositNFT, getPaymentBreakdown } from "../../../web3.0/escrowIntegration";
import { useWallet } from "../../../contexts/WalletContext";
import { useQR } from "../../../contexts/QRContext";
import { useAlert } from "../../../contexts/AlertContext";
import { Encryting } from "../../../utils/encryption";

interface SaleEscrowPopupProps {
  isOpen: boolean;
  tokenId: number;
  deedId: string;
  onClose: () => void;
}

const SaleEscrowPopup: FC<SaleEscrowPopupProps> = ({ 
  isOpen, 
  tokenId, 
  deedId, 
  onClose 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);
  const { account } = useWallet();
  const { showAlert } = useAlert();
  const [txHash, setTxHash] = useState("");
  const { showQRPopup } = useQR();

  // If the seller created an escrow then closed the popup, we should recover
  // the escrow state when the popup is reopened. Look for a prior 'escrow_sale'
  // transaction for this deed created by the current account and restore the
  // escrow address / sale price so the seller can continue (deposit NFT).
  // Only recover PENDING escrows, not completed ones.
  useEffect(() => {
    const recoverEscrowState = async () => {
      if (!isOpen || !deedId || !account) return;
      try {
        const txs = await getTransactionsByDeedId(deedId);
        if (!Array.isArray(txs)) return;

        // find the most recent escrow_sale by this seller that contains an escrow address
        // Only recover if the transaction status is "pending" (not completed)
        const escrowTx = txs
          .filter((t: any) => 
            t.type === "escrow_sale" && 
            (t.from || "").toLowerCase() === (account || "").toLowerCase() && 
            t.blockchain_identification &&
            t.status !== "completed"  // Only recover pending escrows
          )
          .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))[0];

        if (escrowTx) {
          setEscrowAddress(escrowTx.blockchain_identification);
          setTxHash(escrowTx.hash || "");
          setSalePrice(String(escrowTx.amount || ""));
          setSelectedWallet(escrowTx.to || "");
        }
      } catch (e) {
        console.warn("Failed to recover escrow state:", e);
      }
    };

    recoverEscrowState();
  }, [isOpen, deedId, account]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        const data = Array.isArray(res) ? res : [];
        const filtered = data.filter((u) => 
          u.walletAddress && 
          u.walletAddress !== account && 
          u.kycStatus === "verified" && 
          u.role === "user"
        );
        setUsers(filtered);
        setFilteredUsers(filtered);
      } catch {
        setUsers([]);
        setFilteredUsers([]);
      }
    };
    if (isOpen) fetchUsers();
  }, [isOpen, account]);

  useEffect(() => {
    const val = search.trim().toLowerCase();
    setFilteredUsers(
      val === ""
        ? users
        : users.filter(
            (u) =>
              u.name?.toLowerCase().includes(val) ||
              u.walletAddress?.toLowerCase().includes(val)
          )
    );
  }, [search, users]);

  const breakdown = salePrice && parseFloat(salePrice) > 0 ? getPaymentBreakdown(salePrice) : null;

  const handleCreateSale = async () => {
    if (!selectedWallet) {
      showAlert({
        type: "warning",
        title: "Please select a buyer",
        message: "Choose a buyer wallet from the list above"
      });
      return;
    }
    if (!salePrice || parseFloat(salePrice) <= 0) {
      showAlert({
        type: "warning",
        title: "Invalid sale price",
        message: "Please enter a valid sale price greater than zero"
      });
      return;
    }

    showAlert({
      type: "warning",
      title: "Create Sale Escrow",
      htmlContent: (
        <div className="space-y-3">
          <p><strong>Property #:</strong> {tokenId}</p>
          <p><strong>Buyer:</strong> <span className="font-mono text-sm">{selectedWallet}</span></p>
          <p><strong>Total Price:</strong> {breakdown?.totalPrice} ETH</p>
          <div className="bg-gray-50 p-3 rounded space-y-2 mt-2">
            <p className="font-semibold text-sm">Payment Breakdown:</p>
            <ul className="space-y-1 text-sm">
              <li>• Stamp Fee ({breakdown?.stampFeePercentage}%): {breakdown?.stampFee} ETH → Admin</li>
              <li>• You Receive: {breakdown?.sellerAmount} ETH</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 mt-2">This will create an escrow. You'll need to deposit the NFT next.</p>
        </div>
      ),
      confirmText: "Create Sale",
      cancelText: "Cancel",
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await completeFullOwnershipTransfer(
            tokenId,
            account as string,
            selectedWallet,
            salePrice,
            account as string
          );

          if (result.success && result.escrowAddress) {
            setEscrowAddress(result.escrowAddress);
            setTxHash(result.stampFeeTxHash || "");

            showAlert({
              type: "success",
              title: "Escrow Created!",
              htmlContent: (
                <div className="space-y-2">
                  <p className="text-gray-700">Escrow successfully created!</p>
                  <p className="text-sm"><strong>Address:</strong> <span className="font-mono">{result.escrowAddress}</span></p>
                  <div className="bg-blue-50 p-3 rounded text-sm space-y-1 mt-2">
                    <p className="font-semibold">Next Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>You deposit NFT to escrow</li>
                      <li>Buyer deposits {breakdown?.sellerAmount} ETH</li>
                      <li>Buyer finalizes transfer</li>
                    </ol>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Click "Deposit NFT" button to continue.</p>
                </div>
              ),
              confirmText: "OK"
            });

            if(result.escrowAddress && breakdown?.sellerAmount){
              await createTransaction({
                deedId,
                from: account as string,
                to: selectedWallet,
                amount: parseFloat(salePrice),
                share: 100,
                type: "escrow_sale",
                blockchain_identification: result.escrowAddress,
                hash: result.stampFeeTxHash,
                description: `Escrow Sale - ${result.stampFeeTxHash || "no_hash"}`
              })
              
              console.log("Escrow: ",Encryting({
                deedId: deedId,
                escrowAddress: result.escrowAddress,
                seller: account || "",
                hash: result.stampFeeTxHash,
              }))
            }
          } else {
            throw new Error(result.error || "Failed to create escrow");
          }
        } catch (error: any) {
          console.error("Sale creation failed:", error);
          showAlert({
            type: "error",
            title: "Failed to Create Sale",
            message: error.message || "An error occurred while creating the sale",
            confirmText: "OK"
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDepositNFT = async () => {
    if (!escrowAddress) return;

    setLoading(true);
    try {
      const result = await sellerDepositNFT(escrowAddress, tokenId);
      
      if (result.success) {
        showAlert({
          type: "success",
          title: "NFT Deposited to Escrow",
          htmlContent: (
            <div className="space-y-2">
              <p className="text-gray-700">NFT has been successfully deposited to escrow.</p>
              <p className="text-sm text-gray-600">Waiting for buyer to deposit payment and finalize.</p>
              <p className="text-xs text-gray-600"><strong>Transaction:</strong> {result.txHash}</p>
            </div>
          ),
          confirmText: "OK",
          onConfirm: onClose
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("NFT deposit failed:", error);
      showAlert({
        type: "error",
        title: "Failed to Deposit NFT",
        message: error.message || "An error occurred while depositing the NFT",
        confirmText: "OK"
      });
    } finally {
      setLoading(false);
    }
  };

  const shortAddress = (addr: string) =>
    addr && addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <FaStore className="text-green-700" size={18} />
            </div>
            <h2 className="text-xl font-bold text-[#00420A]">
              {escrowAddress ? "Deposit NFT" : "Create Sale"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 transition">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {!escrowAddress ? (
            // Create Sale Form
            <>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Secure sale with escrow protection. Stamp fees are automatically collected.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <IoWalletOutline size={16} />
                  Buyer Wallet Address
                </label>
                <input
                  type="text"
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <IoCashOutline size={16} />
                  Sale Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Enter price in ETH"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-800 placeholder-gray-400"
                />
                
                {breakdown && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Payment Breakdown:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Price:</span>
                        <span className="font-semibold text-gray-900">{breakdown.totalPrice} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stamp Fee ({breakdown.stampFeePercentage}%):</span>
                        <span className="text-gray-700">{breakdown.stampFee} ETH</span>
                      </div>
                      <div className="flex justify-between border-t border-green-300 pt-1 mt-1">
                        <span className="text-gray-600">You Receive:</span>
                        <span className="font-bold text-green-700">{breakdown.sellerAmount} ETH</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-500 uppercase tracking-wide">
                    Or Select User
                  </span>
                </div>
              </div>

              <div>
                <div className="relative mb-3">
                  <IoSearchOutline
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or address"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-800 placeholder-gray-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers
                      .filter((u) => u.walletAddress)
                      .map((user) => (
                        <div
                          key={user.walletAddress}
                          onClick={() => setSelectedWallet(user.walletAddress!)}
                          className={`px-4 py-3 cursor-pointer transition ${
                            selectedWallet === user.walletAddress
                              ? "bg-green-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-gray-900 truncate">
                                {user.name || "Unnamed User"}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {shortAddress(user.walletAddress!)}
                              </div>
                            </div>
                            {selectedWallet === user.walletAddress && (
                              <IoCheckmarkCircle
                                className="text-green-600 flex-shrink-0 ml-2"
                                size={20}
                              />
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      No users found
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleCreateSale}
                disabled={loading || !selectedWallet || !salePrice}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  loading || !selectedWallet || !salePrice
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Creating Sale..." : "Create Sale Escrow"}
              </button>
            </>
          ) : (
            // Deposit NFT Form
            <>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-sm font-semibold text-green-800 mb-2">✅ Escrow Created!</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Escrow Address:</span>
                    <span className="font-mono">{shortAddress(escrowAddress)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buyer:</span>
                    <span className="font-mono">{shortAddress(selectedWallet)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold">{salePrice} ETH</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm font-semibold text-blue-800 mb-2">Next Step: Deposit NFT</div>
                <p className="text-xs text-gray-600">
                  Click the button below to deposit your NFT into the escrow. 
                  After this, the buyer will deposit payment and finalize the transfer.
                </p>
              </div>

              <button
                onClick={handleDepositNFT}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Depositing NFT..." : "Deposit NFT to Escrow"}
              </button>
            </>
          )}
          <button
            onClick={() => showQRPopup({
              deedId,
              escrowAddress: escrowAddress || "",
              seller: account || "",
              hash: txHash,
              size: 220
            })}
            disabled={!txHash || loading}
            className={`w-full py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold hover:from-gray-800 hover:to-black shadow-md hover:shadow-lg transition ${(!txHash || loading) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Show QR Details
          </button>
        </div>

        <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
      </div>
    </div>
  );
};

export default SaleEscrowPopup;