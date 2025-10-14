// SaleEscrowPopup.tsx - Sale with Payment & Escrow
import { type FC, useState, useEffect } from "react";
import { createTransaction, getUsers } from "../../../api/api";
import type { User } from "../../../types/types";
import { IoClose, IoWalletOutline, IoSearchOutline, IoCheckmarkCircle, IoCashOutline } from "react-icons/io5";
import { FaStore } from "react-icons/fa";
import { completeFullOwnershipTransfer, sellerDepositNFT, getPaymentBreakdown } from "../../../web3.0/escrowIntegration";
import { useWallet } from "../../../contexts/WalletContext";

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
    if (!selectedWallet) return alert("Please select a buyer!");
    if (!salePrice || parseFloat(salePrice) <= 0) return alert("Please enter a valid sale price!");

    const confirmed = confirm(
      `Create sale for property #${tokenId}?\n\n` +
      `Buyer: ${selectedWallet}\n` +
      `Total Price: ${breakdown?.totalPrice} ETH\n\n` +
      `Payment Breakdown:\n` +
      `- Stamp Fee (${breakdown?.stampFeePercentage}%): ${breakdown?.stampFee} ETH → Admin\n` +
      `- You Receive: ${breakdown?.sellerAmount} ETH\n\n` +
      `This will create an escrow. You'll need to deposit the NFT next.`
    );
    if (!confirmed) return;

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
        
        await createTransaction(
          deedId,
          account as string,
          selectedWallet,
          parseFloat(salePrice),
          100,
          result.stampFeeTxHash || "",
          "escrow_sale",
          `Escrow Sale - ${result.escrowAddress}`
        );

        alert(
          `✅ Escrow Created!\n\n` +
          `Escrow Address: ${result.escrowAddress}\n\n` +
          `Next Steps:\n` +
          `1. You deposit NFT to escrow\n` +
          `2. Buyer deposits ${breakdown?.sellerAmount} ETH\n` +
          `3. Buyer finalizes transfer\n\n` +
          `Click "Deposit NFT" button to continue.`
        );
      } else {
        throw new Error(result.error || "Failed to create escrow");
      }
    } catch (error: any) {
      console.error("Sale creation failed:", error);
      alert(`❌ Failed to create sale: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositNFT = async () => {
    if (!escrowAddress) return;

    setLoading(true);
    try {
      const result = await sellerDepositNFT(escrowAddress, tokenId);
      
      if (result.success) {
        alert(
          `✅ NFT Deposited to Escrow!\n\n` +
          `Transaction: ${result.txHash}\n\n` +
          `Waiting for buyer to deposit payment and finalize.`
        );
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("NFT deposit failed:", error);
      alert(`❌ Failed to deposit NFT: ${error.message}`);
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
                  💰 Secure sale with escrow protection. Stamp fees are automatically collected.
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
              </div>buyerAddress

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
        </div>

        <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
      </div>
    </div>
  );
};

export default SaleEscrowPopup;