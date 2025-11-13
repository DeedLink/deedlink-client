import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useToast } from "../../../contexts/ToastContext";
import type { User } from "../../../types/types";
import { getDeedByDeedNumber, getUsers } from "../../../api/api";
import { useWallet } from "../../../contexts/WalletContext";
import { shortAddress } from "../../../utils/format";
import { IoCheckmarkCircle, IoSearchOutline } from "react-icons/io5";
import { setLastWill } from "../../../web3.0/lastWillIntegration";

interface SetLastWillPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  deedNumber: string;
}

const STAMP_DUTY_RATE = 0.03;
const GOV_FEE_FIXED = 500;

const SetLastWillPopup: React.FC<SetLastWillPopupProps> = ({ isOpen, onClose, tokenId, deedNumber }) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [notaries, setNotaries] = useState<User[]>([]);
  const [searchBeneficiary, setSearchBeneficiary] = useState("");
  const [searchNotary, setSearchNotary] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [notaryAddress, setNotaryAddress] = useState("");
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<User[]>([]);
  const [filteredNotaries, setFilteredNotaries] = useState<User[]>([]);
  const { account } = useWallet();

  const stampDuty = estimatedValue ? (estimatedValue * STAMP_DUTY_RATE).toFixed(2) : "0.00";
  const totalGovFee = estimatedValue ? (estimatedValue * STAMP_DUTY_RATE + GOV_FEE_FIXED).toFixed(2) : "0.00";

  if (!isOpen) return null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deedRes] = await Promise.all([
          getUsers(),
          getDeedByDeedNumber(deedNumber)
        ]);

        const data = Array.isArray(usersRes) ? usersRes : [];
        const currentUserBeneficiaries = data.filter(
          (u) =>
            u.walletAddress &&
            u.walletAddress !== account &&
            u.kycStatus === "verified" &&
            u.role === "user"
        );
        const notaryList = data.filter(
          (u) =>
            u.walletAddress &&
            u.walletAddress !== account &&
            u.kycStatus === "verified" &&
            u.role === "notary"
        );

        setUsers(currentUserBeneficiaries);
        setFilteredBeneficiaries(currentUserBeneficiaries);
        setNotaries(notaryList);
        setFilteredNotaries(notaryList);

        if (deedRes && deedRes.valuation && deedRes.valuation.length > 0) {
          const latestValuation = deedRes.valuation
            .slice()
            .sort((a: any, b: any) => b.timestamp - a.timestamp)[0];
          setEstimatedValue(latestValuation.estimatedValue || 0);
        }
      } catch (error) {
        showToast("Failed to load data", "error");
      }
    };

    if (isOpen) fetchData();
  }, [isOpen, tokenId, account]);

  useEffect(() => {
    const val = searchBeneficiary.trim().toLowerCase();
    setFilteredBeneficiaries(
      val === ""
        ? users
        : users.filter(
            (u) =>
              u.name?.toLowerCase().includes(val) ||
              u.walletAddress?.toLowerCase().includes(val)
          )
    );
  }, [searchBeneficiary, users]);

  useEffect(() => {
    const val = searchNotary.trim().toLowerCase();
    setFilteredNotaries(
      val === ""
        ? notaries
        : notaries.filter(
            (u) =>
              u.name?.toLowerCase().includes(val) ||
              u.walletAddress?.toLowerCase().includes(val)
          )
    );
  }, [searchNotary, notaries]);

  const handleSetLastWill = async () => {
    if (!beneficiaryAddress || !notaryAddress || estimatedValue <= 0) {
      showToast("Please complete all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setLastWill(
        tokenId,
        beneficiaryAddress,
        notaryAddress,
        estimatedValue
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
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Set Last Will
        </h2>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600">Beneficiary (Verified User)</label>
            <div className="mt-1">
              <div className="relative mb-2">
                <IoSearchOutline
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or address"
                  value={searchBeneficiary}
                  onChange={(e) => setSearchBeneficiary(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {filteredBeneficiaries.length > 0 ? (
                  filteredBeneficiaries.map((user) => (
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
                  <div className="p-5 text-center text-gray-400 text-sm">
                    No verified users found
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Notary (Verified Notary)</label>
            <div className="mt-1">
              <div className="relative mb-2">
                <IoSearchOutline
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search notary by name or address"
                  value={searchNotary}
                  onChange={(e) => setSearchNotary(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {filteredNotaries.length > 0 ? (
                  filteredNotaries.map((notary) => (
                    <div
                      key={notary.walletAddress}
                      onClick={() => setNotaryAddress(notary.walletAddress!)}
                      className={`px-4 py-3 cursor-pointer transition ${
                        notaryAddress === notary.walletAddress
                          ? "bg-emerald-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-gray-900 truncate">
                            {notary.name || "Unnamed Notary"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {shortAddress(notary.walletAddress!)}
                          </div>
                        </div>
                        {notaryAddress === notary.walletAddress && (
                          <IoCheckmarkCircle
                            className="text-emerald-600 flex-shrink-0 ml-2"
                            size={20}
                          />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-center text-gray-400 text-sm">
                    No verified notaries found
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Property Valuation (LKR)</label>
            <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-emerald-700">
                LKR {estimatedValue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Latest valuation from deed</div>
            </div>
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
            disabled={isSubmitting || !beneficiaryAddress || !notaryAddress || estimatedValue <= 0}
            onClick={handleSetLastWill}
            className={`w-full mt-4 py-3 rounded-lg text-white font-semibold transition text-base shadow-lg ${
              isSubmitting || !beneficiaryAddress || !notaryAddress || estimatedValue <= 0
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
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