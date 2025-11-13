import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useToast } from "../../../contexts/ToastContext";
import { setLastWill } from "../../../web3.0/lastWillIntegration";
import type { User } from "../../../types/types";
import { getUsers } from "../../../api/api";
import { useWallet } from "../../../contexts/WalletContext";
import { shortAddress } from "../../../utils/format";
import { IoCheckmarkCircle, IoSearchOutline } from "react-icons/io5";

interface SetLastWillPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
}

const STAMP_DUTY_RATE = 0.03;
const GOV_FEE_FIXED = 500;

const SetLastWillPopup: React.FC<SetLastWillPopupProps> = ({ isOpen, onClose, tokenId }) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [notaryAddress, setNotaryAddress] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const { account } = useWallet();

  const stampDuty = estimatedValue ? (parseFloat(estimatedValue) * STAMP_DUTY_RATE).toFixed(2) : "0.00";
  const totalGovFee = estimatedValue ? (parseFloat(estimatedValue) * STAMP_DUTY_RATE + GOV_FEE_FIXED).toFixed(2) : "0.00";

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

  const handleSetLastWill = async () => {
    if (!beneficiaryAddress || !notaryAddress || !estimatedValue) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (parseFloat(estimatedValue) <= 0) {
      showToast("Estimated value must be greater than zero", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setLastWill(
        tokenId,
        beneficiaryAddress,
        notaryAddress,
        parseFloat(estimatedValue)
      );
      showToast(res?.message || "Last Will successfully set!", "success");
      onClose();
    } catch (error: any) {
      showToast(error.message || "Failed to set Last Will", "error");
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
          Set Last Will
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Beneficiary Address</label>
            <input
              type="text"
              value={beneficiaryAddress}
              onChange={(e) => setBeneficiaryAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0x1234..."
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-500 uppercase tracking-wide">
                Or Select Beneficiary
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
                placeholder="Search beneficiary by name or address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800 placeholder-gray-400"
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers
                  .filter((u) => u.walletAddress)
                  .map((user) => (
                    <div
                      key={user.walletAddress}
                      onClick={() => setBeneficiaryAddress(user.walletAddress!)}
                      className={`px-4 py-3 cursor-pointer transition ${
                        beneficiaryAddress === user.walletAddress
                          ? "bg-emerald-50"
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
                        {beneficiaryAddress === user.walletAddress && (
                          <IoCheckmarkCircle
                            className="text-emerald-600 flex-shrink-0 ml-2"
                            size={20}
                          />
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  No verified users found
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Notary Address</label>
            <input
              type="text"
              value={notaryAddress}
              onChange={(e) => setNotaryAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0x5678..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Estimated Property Value (LKR)</label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: 25000000"
            />
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 space-y-2 border border-emerald-200">
            <h3 className="text-sm font-semibold text-emerald-800">Government Fees (Stamp Duty)</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stamp Duty (3%):</span>
              <span className="font-medium text-emerald-700">LKR {stampDuty}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fixed Fee:</span>
              <span className="font-medium text-emerald-700">LKR {GOV_FEE_FIXED.toLocaleString()}</span>
            </div>
            <div className="border-t border-emerald-200 pt-2 flex justify-between font-bold text-emerald-900">
              <span>Total Payable:</span>
              <span>LKR {totalGovFee}</span>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleSetLastWill}
            className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition text-base ${
              isSubmitting 
                ? "bg-emerald-400 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-700 shadow-lg"
            }`}
          >
            {isSubmitting ? "Setting Last Will..." : "Set Last Will"}
          </button>

          <p className="text-xs text-center text-gray-500 mt-3">
            Government fees will be deducted from your wallet upon execution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetLastWillPopup;