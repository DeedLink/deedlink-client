import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
//import { useWallet } from "../../../contexts/WalletContext";
import { useToast } from "../../../contexts/ToastContext";
import { setRent } from "../../../web3.0/rentIntegration";
import type { User } from "../../../types/types";
import { getUsers } from "../../../api/api";
import { useWallet } from "../../../contexts/WalletContext";
import { shortAddress } from "../../../utils/format";
import { IoCheckmarkCircle, IoSearchOutline } from "react-icons/io5";

interface GiveRentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
}

const GiveRentPopup: React.FC<GiveRentPopupProps> = ({ isOpen, onClose, tokenId }) => {
  //const { account } = useWallet();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [tenantAddress, setTenantAddress] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const { account } = useWallet();

  if (!isOpen) return null;

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

  const handleSetRent = async () => {
    if (!tenantAddress || !rentAmount || !duration) {
      showToast("Please fill all fields", "error");
      return;
    }

    setIsSubmitting(true);
    console.log({        tokenId,
        tenantAddress,
        rentAmount,
        duration});
    try {
      const res = await setRent(
        tokenId,
        rentAmount,
        parseInt(duration),
        tenantAddress
      );
      showToast(res?.message || "Rent successfully set!", "success");
      onClose();
    } catch (error: any) {
      console.log(error.message)
      showToast(error.message || "Failed to set rent", "error");
    } finally {
      setIsSubmitting(false);
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
          Set Rent for Property
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Tenant Address</label>
            <input
              type="text"
              value={tenantAddress}
              onChange={(e) => setTenantAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      onClick={() => setTenantAddress(user.walletAddress!)}
                      className={`px-4 py-3 cursor-pointer transition ${
                        tenantAddress === user.walletAddress
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
                        {tenantAddress === user.walletAddress && (
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
            <label className="text-sm font-semibold text-gray-600">Rent Amount (LKR)</label>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 25000"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Duration (Months)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 12"
            />
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleSetRent}
            className={`w-full mt-4 py-2 rounded-lg text-white font-semibold transition ${
              isSubmitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Setting..." : "Set Rent"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveRentPopup;
