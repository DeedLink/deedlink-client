import { useEffect, useState } from "react";
import type { Certificate } from "../../types/certificate";
import { getCertificatesByTokenId, deleteCertificate } from "../../api/api";
import { normalizeCertificateResponse } from "../../utils/certificateHelpers";
import { shortAddress } from "../../utils/format";
import { useLanguage } from "../../contexts/LanguageContext";
import { getWill, hasActiveWill, getDeathVerification, revokeWill, witnessWill } from "../../web3.0/lastWillIntegration";
import { useWallet } from "../../contexts/WalletContext";
import { useLoader } from "../../contexts/LoaderContext";
import { useToast } from "../../contexts/ToastContext";

type Props = {
  tokenId: number;
};

interface BlockchainWillData {
  beneficiary: string;
  witness1: string;
  witness2: string;
  createdAt: number;
  executionDate: number;
  isActive: boolean;
  isExecuted: boolean;
  ipfsHash: string;
  witness1Status: number;
  witness2Status: number;
}

const LastWillUI = ({ tokenId }: Props) => {
  const { t } = useLanguage();
  const { account } = useWallet();
  const { showLoader, hideLoader } = useLoader();
  const { showToast } = useToast();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [blockchainWill, setBlockchainWill] = useState<BlockchainWillData | null>(null);
  const [deathVerification, setDeathVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasWill, setHasWill] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isWitnessing, setIsWitnessing] = useState(false);

  useEffect(() => {
    const loadLastWill = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check if will exists on blockchain
        const willExists = await hasActiveWill(tokenId);
        setHasWill(willExists);

        if (willExists) {
          // Fetch from blockchain
          const willData = await getWill(tokenId);
          setBlockchainWill(willData);

          // Try to fetch death verification if available
          try {
            const deathData = await getDeathVerification(tokenId);
            setDeathVerification(deathData);
          } catch (err) {
            // Death verification might not exist yet, that's okay
            setDeathVerification(null);
          }

          // Also try to fetch certificate from API for additional metadata
          try {
            const res = await getCertificatesByTokenId(tokenId);
            const cert = normalizeCertificateResponse(res);
            if (cert) {
              setCertificate(cert);
            }
          } catch (err) {
            // Certificate might not exist in API, that's okay - we have blockchain data
            console.log("Certificate not found in API, using blockchain data only");
          }
        } else {
          // No will exists, try to load certificate from API as fallback
          try {
            const res = await getCertificatesByTokenId(tokenId);
            const cert = normalizeCertificateResponse(res);
            setCertificate(cert);
          } catch (err: any) {
            // No certificate found either
            setCertificate(null);
          }
        }
      } catch (err: any) {
        console.error("Error loading last will:", err);
        setError(err?.message || "Failed to load last will from blockchain");
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      loadLastWill();
    }
  }, [tokenId, account]);

  const handleRevokeWill = async () => {
    if (!tokenId) return;
    
    if (!window.confirm(t("messages.confirmRevokeLastWill") || "Are you sure you want to revoke this Last Will? This action cannot be undone.")) {
      return;
    }

    setIsRevoking(true);
    showLoader();
    try {
      // Revoke from blockchain
      const revokeResult = await revokeWill(tokenId);
      
      if (!revokeResult.success) {
        throw new Error("Failed to revoke will on blockchain");
      }
      
      // Delete certificate from API if it exists
      if (certificate?._id) {
        try {
          await deleteCertificate(certificate._id);
        } catch (apiError) {
          console.warn("Failed to delete certificate from API:", apiError);
          // Continue even if API deletion fails
        }
      }
      
      showToast(t("messages.lastWillCancelledSuccessfully"), "success");
      
      // Reset state and reload
      setBlockchainWill(null);
      setCertificate(null);
      setHasWill(false);
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error revoking last will:", error);
      const errorMessage = error?.message || error?.reason || t("messages.failedToCancelLastWill");
      showToast(errorMessage, "error");
    } finally {
      setIsRevoking(false);
      hideLoader();
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-600">{t("messages.loadingCertificate")}</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (!hasWill && !certificate) return <div className="p-4 text-gray-500 text-center">{t("messages.noLastWillCertificate")}</div>;

  // Helper function to format date
  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleWitnessSign = async (approve: boolean) => {
    if (!tokenId || !account) return;
    
    if (!window.confirm(
      approve 
        ? "Are you sure you want to approve this Last Will? This action cannot be undone."
        : "Are you sure you want to reject this Last Will? This action cannot be undone."
    )) {
      return;
    }

    setIsWitnessing(true);
    showLoader();
    try {
      const result = await witnessWill(tokenId, approve);
      showToast(result.message, "success");
      
      const willData = await getWill(tokenId);
      setBlockchainWill(willData);
    } catch (error: any) {
      console.error("Error witnessing will:", error);
      const errorMessage = error?.message || error?.reason || "Failed to witness will";
      showToast(errorMessage, "error");
    } finally {
      setIsWitnessing(false);
      hideLoader();
    }
  };

  const isCurrentUserWitness = () => {
    if (!blockchainWill || !account) return { isWitness: false, witnessNumber: 0, status: -1 };
    
    const accountLower = account.toLowerCase();
    const witness1Lower = blockchainWill.witness1.toLowerCase();
    const witness2Lower = blockchainWill.witness2.toLowerCase();
    
    if (accountLower === witness1Lower) {
      return { isWitness: true, witnessNumber: 1, status: blockchainWill.witness1Status };
    }
    if (accountLower === witness2Lower) {
      return { isWitness: true, witnessNumber: 2, status: blockchainWill.witness2Status };
    }
    
    return { isWitness: false, witnessNumber: 0, status: -1 };
  };

  const getWitnessStatus = (status: number) => {
    if (status === 0) return "Pending";
    if (status === 1) return "Signed";
    if (status === 2) return "Rejected";
    return "Unknown";
  };

  const witnessInfo = isCurrentUserWitness();

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-emerald-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("messages.lastWillCertificate")}
        </h2>
        <div className="flex items-center gap-2">
          {blockchainWill && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              blockchainWill.isActive 
                ? "bg-green-100 text-green-800" 
                : blockchainWill.isExecuted
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {blockchainWill.isActive 
                ? "Active" 
                : blockchainWill.isExecuted 
                ? "Executed" 
                : "Inactive"}
            </span>
          )}
          {blockchainWill && blockchainWill.isActive && !blockchainWill.isExecuted && (
            <button
              onClick={handleRevokeWill}
              disabled={isRevoking}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-md transition"
            >
              {isRevoking ? t("messages.revoking") || "Revoking..." : t("messages.revokeLastWill") || "Revoke Last Will"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Certificate metadata from API (if available) */}
        {certificate && (
          <>
            {certificate.title && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t("messages.title")}</p>
                <p className="text-base font-medium text-gray-900">{certificate.title}</p>
              </div>
            )}
            {certificate.description && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t("messages.description")}</p>
                <p className="text-base text-gray-900 leading-relaxed">{certificate.description}</p>
              </div>
            )}
          </>
        )}

        {/* Blockchain Will Data */}
        {blockchainWill && (
          <>
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-3">Blockchain Data</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Created:</span>
                  <span className="text-gray-900 ml-2">{formatDate(blockchainWill.createdAt)}</span>
                </div>
                {blockchainWill.executionDate > 0 && (
                  <div>
                    <span className="text-gray-600 font-medium">Execution Date:</span>
                    <span className="text-gray-900 ml-2">{formatDate(blockchainWill.executionDate)}</span>
                  </div>
                )}
                {blockchainWill.ipfsHash && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600 font-medium">IPFS Hash:</span>
                    <span className="text-gray-900 font-mono text-xs ml-2 break-all">{blockchainWill.ipfsHash}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Death Verification (if available) */}
            {deathVerification && deathVerification.isVerified && (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wide mb-3">Death Verification</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Verified:</span>
                    <span className="text-gray-900 ml-2">{deathVerification.isVerified ? "Yes" : "No"}</span>
                  </div>
                  {deathVerification.verifiedAt > 0 && (
                    <div>
                      <span className="text-gray-600 font-medium">Verified At:</span>
                      <span className="text-gray-900 ml-2">{formatDate(deathVerification.verifiedAt)}</span>
                    </div>
                  )}
                  {deathVerification.verifiedBy && (
                    <div>
                      <span className="text-gray-600 font-medium">Verified By:</span>
                      <span className="text-gray-900 font-mono text-xs ml-2">{shortAddress(deathVerification.verifiedBy)}</span>
                    </div>
                  )}
                  {deathVerification.canExecute && (
                    <div>
                      <span className="text-gray-600 font-medium">Ready to Execute:</span>
                      <span className="text-green-700 font-semibold ml-2">Yes</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {witnessInfo.isWitness && witnessInfo.status === 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-yellow-900 mb-3">You are a Witness</h4>
                <p className="text-sm text-yellow-800 mb-4">
                  You have been designated as Witness {witnessInfo.witnessNumber} for this Last Will. 
                  Please review and sign the will to proceed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleWitnessSign(true)}
                    disabled={isWitnessing}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition"
                  >
                    {isWitnessing ? "Signing..." : "Approve & Sign"}
                  </button>
                  <button
                    onClick={() => handleWitnessSign(false)}
                    disabled={isWitnessing}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md transition"
                  >
                    {isWitnessing ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            )}

            {witnessInfo.isWitness && witnessInfo.status !== 0 && (
              <div className={`border-2 p-4 rounded-lg ${
                witnessInfo.status === 1 
                  ? "bg-green-50 border-green-300" 
                  : "bg-red-50 border-red-300"
              }`}>
                <h4 className={`text-lg font-bold mb-2 ${
                  witnessInfo.status === 1 ? "text-green-900" : "text-red-900"
                }`}>
                  Your Witness Status: {getWitnessStatus(witnessInfo.status)}
                </h4>
                <p className={`text-sm ${
                  witnessInfo.status === 1 ? "text-green-800" : "text-red-800"
                }`}>
                  {witnessInfo.status === 1 
                    ? "You have signed this Last Will. Waiting for the other witness to sign."
                    : "You have rejected this Last Will."}
                </p>
              </div>
            )}

            {blockchainWill && 
             !blockchainWill.isExecuted && 
             blockchainWill.witness1Status === 0 && 
             blockchainWill.witness2Status === 0 && 
             !witnessInfo.isWitness && (
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-blue-900 mb-2">Waiting for Witness Signatures</h4>
                <p className="text-sm text-blue-800">
                  Both witnesses must sign the will before it can be executed.
                </p>
                <div className="mt-3 text-xs text-blue-700 space-y-1">
                  <p>Witness 1: {getWitnessStatus(blockchainWill.witness1Status)}</p>
                  <p>Witness 2: {getWitnessStatus(blockchainWill.witness2Status)}</p>
                </div>
              </div>
            )}

            {/* Parties from Blockchain */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">{t("messages.parties")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Beneficiary */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.name")}:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">Beneficiary</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.role")}:</strong> 
                    <span className="text-gray-900 capitalize font-medium ml-2">beneficiary</span>
                  </p>
                  <p>
                    <strong className="text-gray-700 text-sm">{t("messages.contact")}:</strong> 
                    <span className="text-gray-900 font-mono text-sm ml-2">{shortAddress(blockchainWill.beneficiary)}</span>
                  </p>
                </div>

                {/* Witness 1 */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.name")}:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">Witness 1</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.role")}:</strong> 
                    <span className="text-gray-900 capitalize font-medium ml-2">witness</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">Status:</strong> 
                    <span className={`font-medium ml-2 ${
                      blockchainWill.witness1Status === 1 ? "text-green-700" :
                      blockchainWill.witness1Status === 2 ? "text-red-700" :
                      "text-yellow-700"
                    }`}>
                      {getWitnessStatus(blockchainWill.witness1Status)}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-700 text-sm">{t("messages.contact")}:</strong> 
                    <span className="text-gray-900 font-mono text-sm ml-2">{shortAddress(blockchainWill.witness1)}</span>
                  </p>
                </div>

                {/* Witness 2 */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.name")}:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">Witness 2</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.role")}:</strong> 
                    <span className="text-gray-900 capitalize font-medium ml-2">witness</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">Status:</strong> 
                    <span className={`font-medium ml-2 ${
                      blockchainWill.witness2Status === 1 ? "text-green-700" :
                      blockchainWill.witness2Status === 2 ? "text-red-700" :
                      "text-yellow-700"
                    }`}>
                      {getWitnessStatus(blockchainWill.witness2Status)}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-700 text-sm">{t("messages.contact")}:</strong> 
                    <span className="text-gray-900 font-mono text-sm ml-2">{shortAddress(blockchainWill.witness2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fallback to certificate parties if no blockchain data */}
        {!blockchainWill && certificate && certificate.parties?.length && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">{t("messages.parties")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificate.parties.map((p, i) => (
                <div key={i} className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.name")}:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">{p.name}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.role")}:</strong> 
                    <span className="text-gray-900 capitalize font-medium ml-2">{p.role}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700 text-sm">{t("messages.contact")}:</strong> 
                    <span className="text-gray-900 font-mono text-sm ml-2">{shortAddress(p.contact)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional data from certificate */}
        {certificate && certificate.data && typeof certificate.data === 'object' && Object.keys(certificate.data).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">{t("messages.data")}</h3>
            <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {JSON.stringify(certificate.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LastWillUI;
