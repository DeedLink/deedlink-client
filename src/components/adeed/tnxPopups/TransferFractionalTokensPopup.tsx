import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useToast } from "../../../contexts/ToastContext";
import { useLoader } from "../../../contexts/LoaderContext";
import { useWallet } from "../../../contexts/WalletContext";
import { transferFractionalTokens, getFractionalTokenAddress, getFTBalance, getTotalSupply } from "../../../web3.0/contractService";
import { getUsers, createTransaction, updateDeedOwners } from "../../../api/api";
import { calculateOwnershipFromEvents } from "../../../web3.0/eventService";
import { shortAddress } from "../../../utils/format";
import { IoCheckmarkCircle, IoSearchOutline } from "react-icons/io5";
import type { User } from "../../../types/types";

interface TransferFractionalTokensPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  deedId: string;
  onSuccess?: () => void;
}

const TransferFractionalTokensPopup: React.FC<TransferFractionalTokensPopupProps> = ({
  isOpen,
  onClose,
  tokenId,
  deedId,
  onSuccess
}) => {
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen || !account) return;
      
      try {
        const tokenAddress = await getFractionalTokenAddress(tokenId);
        if (tokenAddress && tokenAddress !== "0x0000000000000000000000000000000000000000") {
          const balance = await getFTBalance(tokenAddress, account);
          const supply = await getTotalSupply(tokenId);
          setUserBalance(Number(balance));
          setTotalSupply(Number(supply));
        }
      } catch (error) {
        console.error("Error loading balance:", error);
      }
    };
    
    loadData();
  }, [isOpen, account, tokenId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        const data = Array.isArray(res) ? res : [];
        const filtered = data.filter(
          (u) =>
            u.walletAddress &&
            u.walletAddress !== account &&
            u.kycStatus === "verified"
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

  if (!isOpen) return null;

  const handleTransfer = async () => {
    if (!recipientAddress || !amount) {
      showToast("Please fill all fields", "error");
      return;
    }

    const amountNum = Number(amount);
    if (amountNum <= 0 || amountNum > userBalance) {
      showToast(`Amount must be between 1 and ${userBalance}`, "error");
      return;
    }

    setIsSubmitting(true);
    showLoader();

    try {
      const tokenAddress = await getFractionalTokenAddress(tokenId);
      if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Property is not fractionalized");
      }

      const result = await transferFractionalTokens(tokenAddress, recipientAddress, amountNum);
      
      if (result.success) {
        const percentage = (amountNum / totalSupply) * 100;
        await createTransaction({
          deedId,
          from: account!,
          to: recipientAddress,
          amount: 0,
          share: percentage,
          type: "direct_transfer",
          blockchain_identification: result.txHash,
          hash: result.txHash,
          description: `Transferred ${amountNum} fractional tokens (${percentage.toFixed(2)}% ownership)`,
          status: "completed"
        });

        try {
          const updatedOwners = await calculateOwnershipFromEvents(tokenId, totalSupply);
          await updateDeedOwners(deedId, updatedOwners);
        } catch (updateError) {
          console.error("Failed to update deed owners:", updateError);
        }

        showToast("Fractional tokens transferred successfully!", "success");
        onSuccess?.();
        onClose();
        setRecipientAddress("");
        setAmount("");
      }
    } catch (error: any) {
      console.error("Transfer error:", error);
      showToast(error.message || "Failed to transfer fractional tokens", "error");
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50 text-black">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Transfer Fractional Tokens
        </h2>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Your Balance:</span> {userBalance} tokens
            {totalSupply > 0 && (
              <span className="text-xs text-blue-600 block mt-1">
                ({((userBalance / totalSupply) * 100).toFixed(2)}% ownership)
              </span>
            )}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x1234..."
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
                      onClick={() => setRecipientAddress(user.walletAddress!)}
                      className={`px-4 py-3 cursor-pointer transition ${
                        recipientAddress === user.walletAddress
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
                        {recipientAddress === user.walletAddress && (
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

          <div>
            <label className="text-sm font-semibold text-gray-600">Amount (Tokens)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={userBalance}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Max: ${userBalance}`}
            />
            {totalSupply > 0 && amount && (
              <p className="text-xs text-gray-500 mt-1">
                This represents {((Number(amount) / totalSupply) * 100).toFixed(2)}% ownership
              </p>
            )}
          </div>

          <button
            disabled={isSubmitting || !recipientAddress || !amount || Number(amount) <= 0 || Number(amount) > userBalance}
            onClick={handleTransfer}
            className={`w-full mt-4 py-2 rounded-lg text-white font-semibold transition ${
              isSubmitting || !recipientAddress || !amount || Number(amount) <= 0 || Number(amount) > userBalance
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Transferring..." : "Transfer Tokens"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferFractionalTokensPopup;

