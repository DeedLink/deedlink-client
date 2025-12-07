import { useEffect, useState } from "react";
import { useToast } from "../../../contexts/ToastContext";
import type { User } from "../../../types/types";
import { createCertificate, getDeedByDeedNumber, getUsers } from "../../../api/api";
import { useWallet } from "../../../contexts/WalletContext";
import { shortAddress } from "../../../utils/format";
import { IoCheckmarkCircle, IoSearchOutline } from "react-icons/io5";
import { createWill, hasActiveWill } from "../../../web3.0/lastWillIntegration";
import { getAddress } from "ethers";
import { useLanguage } from "../../../contexts/LanguageContext";

interface SetLastWillPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  deedNumber: string;
}

const STAMP_DUTY_RATE = 0.03;
const GOV_FEE_FIXED = 0.01; // Fixed fee in ETH

const SetLastWillPopup: React.FC<SetLastWillPopupProps> = ({ isOpen, onClose, tokenId, deedNumber }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [witnesses, setWitnesses] = useState<User[]>([]);
  const [searchBeneficiary, setSearchBeneficiary] = useState("");
  const [searchWitness1, setSearchWitness1] = useState("");
  const [searchWitness2, setSearchWitness2] = useState("");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState("");
  const [witness1Address, setWitness1Address] = useState("");
  const [witness2Address, setWitness2Address] = useState("");
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<User[]>([]);
  const [filteredWitnesses1, setFilteredWitnesses1] = useState<User[]>([]);
  const [filteredWitnesses2, setFilteredWitnesses2] = useState<User[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>("beneficiary");
  const { account } = useWallet();

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const stampDuty = estimatedValue ? (estimatedValue * STAMP_DUTY_RATE).toFixed(4) : "0.0000";
  const totalGovFee = estimatedValue ? (estimatedValue * STAMP_DUTY_RATE + GOV_FEE_FIXED).toFixed(4) : GOV_FEE_FIXED.toFixed(4);

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
        const witnessList = data.filter(
          (u) =>
            u.walletAddress &&
            u.walletAddress !== account &&
            u.kycStatus === "verified" &&
            u.role === "notary"
        );

        setUsers(currentUserBeneficiaries);
        setFilteredBeneficiaries(currentUserBeneficiaries);
        setWitnesses(witnessList);
        setFilteredWitnesses1(witnessList);
        setFilteredWitnesses2(witnessList);

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
    const val = searchWitness1.trim().toLowerCase();
    setFilteredWitnesses1(
      val === ""
        ? witnesses
        : witnesses.filter(
            (u) =>
              u.name?.toLowerCase().includes(val) ||
              u.walletAddress?.toLowerCase().includes(val)
          )
    );
  }, [searchWitness1, witnesses]);

  useEffect(() => {
    const val = searchWitness2.trim().toLowerCase();
    setFilteredWitnesses2(
      val === ""
        ? witnesses
        : witnesses.filter(
            (u) =>
              u.name?.toLowerCase().includes(val) ||
              u.walletAddress?.toLowerCase().includes(val)
          )
    );
  }, [searchWitness2, witnesses]);

  const handleSetLastWill = async () => {
    if (!beneficiaryAddress || !witness1Address || !witness2Address) {
      showToast("Please complete all required fields (Beneficiary and 2 Witnesses)", "error");
      return;
    }

    if (witness1Address === witness2Address) {
      showToast("Witnesses must be different", "error");
      return;
    }

    if (beneficiaryAddress === account) {
      showToast("You cannot be your own beneficiary", "error");
      return;
    }

    if (!account) {
      showToast("Wallet not connected. Please connect your wallet first.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if a will already exists
      const willExists = await hasActiveWill(tokenId);
      if (willExists) {
        showToast("A Last Will already exists for this property. Please revoke it first before creating a new one.", "error");
        setIsSubmitting(false);
        return;
      }

      // Normalize addresses to checksum format
      const normalizedBeneficiary = getAddress(beneficiaryAddress);
      const normalizedWitness1 = getAddress(witness1Address);
      const normalizedWitness2 = getAddress(witness2Address);

      // Generate IPFS hash from certificate data (or use empty string if IPFS not available)
      const ipfsHash = `last_will_${tokenId}_${Date.now()}`;

      // Create will on blockchain
      const res = await createWill(
        tokenId,
        normalizedBeneficiary,
        normalizedWitness1,
        normalizedWitness2,
        ipfsHash
      );

      console.log("Last Will set on blockchain:", res);

      const payload = {
        type: "last_will",
        title: `Last Will for Token #${tokenId}`,
        description: `Last Will declaration for property deed ${deedNumber}`,
        parties: [
          {
            name: "Property Owner",
            role: "owner",
            contact: account,
          },
          {
            name: "Beneficiary",
            role: "beneficiary",
            contact: normalizedBeneficiary,
          },
          {
            name: "Witness 1",
            role: "witness",
            contact: normalizedWitness1,
          },
          {
            name: "Witness 2",
            role: "witness",
            contact: normalizedWitness2,
          }
        ],
        createdBy: account,
        data: {
          tokenId,
          deedNumber,
          estimatedValue,
          stampDuty: Number(stampDuty),
          fixedFee: GOV_FEE_FIXED,
          totalFee: Number(totalGovFee),
          txHash: res?.txHash || ""
        }
      };

      // Try to save certificate to API, but don't fail if it doesn't work
      // The blockchain transaction is the primary record
      try {
        const saved = await createCertificate(payload);
        console.log("Certificate created in API:", saved);
      } catch (apiError: any) {
        const status = apiError?.response?.status;
        const message = apiError?.response?.data?.message || apiError?.message;
        console.warn(`Failed to save certificate to API (status: ${status}). This is optional - blockchain transaction is the source of truth.`, message || apiError);
        // Continue even if API save fails - blockchain transaction is the source of truth
      }

      showToast("Last Will successfully set and stored!", "success");
      onClose();
    } catch (error: any) {
      console.error("Error creating last will:", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to set Last Will";
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        
        if (msg.includes("user rejected") || msg.includes("user denied")) {
          errorMessage = "Transaction was rejected. Please try again.";
        } else if (msg.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction. Please add more ETH to your wallet.";
        } else if (msg.includes("will already exists")) {
          errorMessage = "A Last Will already exists for this property. Please revoke it first.";
        } else if (msg.includes("not property owner")) {
          errorMessage = "You are not the owner of this property.";
        } else if (msg.includes("invalid beneficiary") || msg.includes("invalid witness")) {
          errorMessage = "Invalid address provided. Please check the addresses and try again.";
        } else if (msg.includes("wallet not connected")) {
          errorMessage = "Wallet not connected. Please connect your wallet and try again.";
        } else if (msg.includes("network") || msg.includes("provider")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          // Try to extract the revert reason if available
          const revertMatch = msg.match(/revert\s+(.+)/i) || msg.match(/reason:\s*(.+)/i);
          if (revertMatch) {
            errorMessage = revertMatch[1];
          } else {
            errorMessage = error.message;
          }
        }
      } else if (error?.reason) {
        errorMessage = error.reason;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full h-full fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-[90%] max-w-3xl overflow-hidden">
        <div className="rounded-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-green-900 mb-2 text-center">
            {t("messages.createLastWill")}
          </h2>
          <p className="text-gray-700 text-sm mb-6 text-center">
            {t("messages.provideLastWillDetails") || "Provide details for creating a Last Will"}
          </p>

          <div className="space-y-6 text-gray-700">
            <div>
              <h3
                onClick={() => toggleSection("beneficiary")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("messages.beneficiary")} ({t("messages.verifiedUser")})
                <span>{activeSection === "beneficiary" ? "−" : "+"}</span>
              </h3>
              {activeSection === "beneficiary" && (
                <div className="space-y-3">
                  <div className="relative">
                    <IoSearchOutline
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder={t("messages.searchByNameOrAddress")}
                      value={searchBeneficiary}
                      onChange={(e) => setSearchBeneficiary(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-lg divide-y divide-gray-100">
                    {filteredBeneficiaries.length > 0 ? (
                      filteredBeneficiaries.map((user) => (
                        <div
                          key={user.walletAddress}
                          onClick={() => setBeneficiaryAddress(user.walletAddress!)}
                          className={`px-4 py-3 cursor-pointer transition ${
                            beneficiaryAddress === user.walletAddress
                              ? "bg-green-100"
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
                                className="text-green-600 flex-shrink-0 ml-2"
                                size={20}
                              />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-5 text-center text-gray-400 text-sm">
                        {t("messages.noVerifiedUsersFound")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("witnesses")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("messages.witnesses") || "Witnesses"} ({t("messages.notaryOnly") || "Notary Only"})
                <span>{activeSection === "witnesses" ? "−" : "+"}</span>
              </h3>
              {activeSection === "witnesses" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      {t("messages.witness")} 1 ({t("messages.notary") || "Notary"})
                    </label>
                    <div className="relative">
                      <IoSearchOutline
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder={t("messages.searchWitnessByNameOrAddress")}
                        value={searchWitness1}
                        onChange={(e) => setSearchWitness1(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border rounded-lg divide-y divide-gray-100">
                      {filteredWitnesses1.length > 0 ? (
                        filteredWitnesses1.map((witness) => (
                          <div
                            key={witness.walletAddress}
                            onClick={() => setWitness1Address(witness.walletAddress!)}
                            className={`px-4 py-3 cursor-pointer transition ${
                              witness1Address === witness.walletAddress
                                ? "bg-green-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-gray-900 truncate">
                                  {witness.name || "Unnamed User"}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {shortAddress(witness.walletAddress!)}
                                </div>
                              </div>
                              {witness1Address === witness.walletAddress && (
                                <IoCheckmarkCircle
                                  className="text-green-600 flex-shrink-0 ml-2"
                                  size={20}
                                />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 text-center text-gray-400 text-sm">
                          {t("messages.noVerifiedNotariesFound") || "No verified notaries found"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      {t("messages.witness")} 2 ({t("messages.notary") || "Notary"})
                    </label>
                    <div className="relative">
                      <IoSearchOutline
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder={t("messages.searchWitnessByNameOrAddress")}
                        value={searchWitness2}
                        onChange={(e) => setSearchWitness2(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border rounded-lg divide-y divide-gray-100">
                      {filteredWitnesses2.length > 0 ? (
                        filteredWitnesses2.map((witness) => (
                          <div
                            key={witness.walletAddress}
                            onClick={() => setWitness2Address(witness.walletAddress!)}
                            className={`px-4 py-3 cursor-pointer transition ${
                              witness2Address === witness.walletAddress
                                ? "bg-green-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-gray-900 truncate">
                                  {witness.name || "Unnamed User"}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {shortAddress(witness.walletAddress!)}
                                </div>
                              </div>
                              {witness2Address === witness.walletAddress && (
                                <IoCheckmarkCircle
                                  className="text-green-600 flex-shrink-0 ml-2"
                                  size={20}
                                />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 text-center text-gray-400 text-sm">
                          {t("messages.noVerifiedNotariesFound") || "No verified notaries found"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("valuation")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("messages.propertyValuation")} (ETH)
                <span>{activeSection === "valuation" ? "−" : "+"}</span>
              </h3>
              {activeSection === "valuation" && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">
                    ETH {estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t("messages.latestValuationFromDeed")}</div>
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("payment")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("messages.governmentFeesStampDuty")}
                <span>{activeSection === "payment" ? "−" : "+"}</span>
              </h3>
              {activeSection === "payment" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("messages.stampDuty")} (3%):</span>
                      <span className="text-gray-900">ETH {stampDuty}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("messages.fixedFee")}:</span>
                      <span className="text-gray-900">ETH {GOV_FEE_FIXED.toFixed(4)}</span>
                    </div>
                    <div className="border-t border-yellow-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-bold">{t("messages.totalPayable")}:</span>
                        <span className="text-green-700 font-bold text-lg">ETH {totalGovFee}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    {t("messages.governmentFeesDeductedNotice")}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                disabled={isSubmitting || !beneficiaryAddress || !witness1Address || !witness2Address}
                onClick={handleSetLastWill}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                {isSubmitting ? t("messages.settingLastWill") : t("messages.createLastWill")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetLastWillPopup;