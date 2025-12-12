import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt, FaUser, FaHome, FaArrowLeft, FaStore } from "react-icons/fa";
import { getDeedByQR } from "../api/api";
import { useToast } from "../contexts/ToastContext";
import { useLoader } from "../contexts/LoaderContext";
import { useWallet } from "../contexts/WalletContext";
import { useLogin } from "../contexts/LoginContext";
import type { IDeed } from "../types/responseDeed";
import { shortAddress } from "../utils/format";

const QRDeedViewPage = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const [searchParams] = useSearchParams();
  const scannerAddress = searchParams.get("scannerAddress");
  const [deed, setDeed] = useState<IDeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { account } = useWallet();
  const { user } = useLogin();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeed = async () => {
      if (!qrId) {
        setError("QR ID is required");
        setLoading(false);
        return;
      }

      showLoader();
      try {
        const response = await getDeedByQR(qrId, scannerAddress || undefined);
        if (response.success && response.deed) {
          setDeed(response.deed);
        } else {
          setError("Failed to load deed information");
        }
      } catch (err: any) {
        console.error("Error fetching deed:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to load deed information");
        showToast(err?.response?.data?.message || err?.message || "Failed to load deed", "error");
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    fetchDeed();
  }, [qrId, scannerAddress, showLoader, hideLoader, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deed information...</p>
        </div>
      </div>
    );
  }

  if (error || !deed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FaShieldAlt className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error || "Deed not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | number | string) => {
    const dateObj = typeof date === 'number' ? new Date(date) : typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Deed Information</h1>
                <p className="text-sm text-gray-600">Viewing via QR Code</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
              <FaShieldAlt className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Verified QR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">{deed.deedNumber}</h2>
            <p className="text-emerald-50 text-sm mt-1">{deed.landAddress}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaFileAlt className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Deed Number</h3>
                </div>
                <p className="text-gray-700 font-mono">{deed.deedNumber}</p>
              </div>

              {deed.tokenId !== undefined && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaShieldAlt className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Token ID</h3>
                  </div>
                  <p className="text-gray-700 font-mono">#{deed.tokenId}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Registration Date</h3>
                </div>
                <p className="text-gray-700">{formatDate(deed.registrationDate)}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaHome className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Land Type</h3>
                </div>
                <p className="text-gray-700 capitalize">{deed.landType}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Land Area</h3>
                </div>
                <p className="text-gray-700">
                  {deed.landArea} {deed.landSizeUnit || "Perches"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaFileAlt className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Land Title Number</h3>
                </div>
                <p className="text-gray-700">{deed.landTitleNumber}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="w-5 h-5 text-emerald-600" />
                Owner Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</p>
                    <p className="text-gray-900 font-medium">{deed.ownerFullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">NIC</p>
                    <p className="text-gray-900 font-medium">{deed.ownerNIC}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Address</p>
                    <p className="text-gray-900">{deed.ownerAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Phone</p>
                    <p className="text-gray-900">{deed.ownerPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {deed.owners && deed.owners.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaShieldAlt className="w-5 h-5 text-emerald-600" />
                  Blockchain Owners
                </h3>
                <div className="space-y-2">
                  {deed.owners.map((owner, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Owner {index + 1}</p>
                          <p className="text-gray-900 font-mono text-sm">{shortAddress(owner.address)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Share</p>
                          <p className="text-gray-900 font-bold">{owner.share}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="w-5 h-5 text-emerald-600" />
                Location Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Address</p>
                  <p className="text-gray-900">{deed.landAddress}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">District</p>
                    <p className="text-gray-900">{deed.district}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Division</p>
                    <p className="text-gray-900">{deed.division}</p>
                  </div>
                </div>
              </div>
            </div>

            {deed.deedType && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFileAlt className="w-5 h-5 text-emerald-600" />
                  Deed Type
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900">{deed.deedType.deedType}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-4">
            <strong>Note:</strong> This is a read-only view of the deed information accessed via QR code. 
            For full access and management features, please log in as the deed owner.
          </p>
          {deed.deedNumber && user && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (user && account) {
                    navigate(`/deed/${deed.deedNumber}?action=escrow`);
                  } else {
                    showToast("Please log in to create an escrow", "info");
                    navigate(`/deed/${deed.deedNumber}`);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                <FaStore className="w-4 h-4" />
                Create Escrow Sale
              </button>
              <button
                onClick={() => navigate(`/deed/${deed.deedNumber}`)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                View Full Deed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRDeedViewPage;

