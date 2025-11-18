import { type FC, useState, useEffect } from "react";
import { createTransaction, getUsers, updateFullOwnerAddress, updateDeedOwners } from "../../../api/api";
import type { User } from "../../../types/types";
import { IoClose, IoWalletOutline, IoSearchOutline, IoCheckmarkCircle } from "react-icons/io5";
import { FaGift } from "react-icons/fa";
import { transferNFT } from "../../../web3.0/contractService";
import { calculateOwnershipFromEvents } from "../../../web3.0/eventService";
import { useWallet } from "../../../contexts/WalletContext";

interface DirectTransferPopupProps {
  isOpen: boolean;
  tokenId: number;
  deedId: string;
  onClose: () => void;
}

export const DirectTransferPopup: FC<DirectTransferPopupProps> = ({
  isOpen,
  tokenId,
  deedId,
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const { account } = useWallet();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        const data = Array.isArray(res) ? res : [];
        const filtered = data.filter(
          (u) =>
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

  const handleDirectTransfer = async () => {
    if (!selectedWallet) return alert("Please select a recipient!");

    const confirmed = confirm(
      `Transfer property #${tokenId} to:\n${selectedWallet}\n\nThis is a direct transfer with no payment.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await transferNFT(account as string, selectedWallet, tokenId);

      if (res.txHash) {
        await createTransaction({
          deedId,
          from: account as string,
          to: selectedWallet,
          amount: 0,
          share: 100,
          type: "gift",
          hash: res.txHash,
          description: "Direct Transfer (Gift/No Payment)",
          status: "completed",
        });

        await updateFullOwnerAddress(tokenId, selectedWallet.toLowerCase());

        try {
          const owners = await calculateOwnershipFromEvents(tokenId);
          await updateDeedOwners(deedId, owners);
        } catch (updateError) {
          console.error("Failed to update deed owners:", updateError);
        }

        alert(`✅ Property transferred successfully!\n\nTransaction: ${res.txHash}`);
        onClose();
      }
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("❌ Transfer failed. Please try again.");
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FaGift className="text-blue-700" size={18} />
            </div>
            <h2 className="text-xl font-bold text-[#00420A]">Direct Transfer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-2 transition"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ This is a free transfer with no payment required. Perfect for
              gifts or transfers between your own wallets.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <IoWalletOutline size={16} />
              Recipient Wallet Address
            </label>
            <input
              type="text"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-gray-800 placeholder-gray-400"
            />
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 placeholder-gray-400"
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
                          ? "bg-blue-50"
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
                            className="text-blue-600 flex-shrink-0 ml-2"
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
            onClick={handleDirectTransfer}
            disabled={loading || !selectedWallet}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              loading || !selectedWallet
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Processing Transfer..." : "Transfer Ownership"}
          </button>
        </div>

        <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700" />
      </div>
    </div>
  );
};
