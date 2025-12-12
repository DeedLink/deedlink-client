import React, { useEffect, useState } from "react";
import { FaTimes, FaTrash, FaEdit, FaCopy, FaCheckCircle, FaQrcode, FaGlobe, FaLock, FaUsers, FaDownload, FaEye, FaEyeSlash, FaCalendarAlt, FaIdCard, FaShieldAlt } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { getQRCodesByDeed, deleteQRCode, updateQRPermissions } from "../../api/api";
import { useToast } from "../../contexts/ToastContext";
import type { QRPermissionType } from "../../types/qr";
import DeedQRGenerator from "../qr/DeedQRGenerator";
import DeedQRScanner from "../qr/DeedQRScanner";
import type { IDeed } from "../../types/responseDeed";

interface QRManagementProps {
  deed: IDeed;
  isOpen: boolean;
  onClose: () => void;
}

interface QRCodeItem {
  qrId: string;
  deedId: string;
  tokenId?: number;
  deedNumber: string;
  permissionType: QRPermissionType;
  allowedAddresses: string[];
  encryptedData?: string;
  createdAt: string;
  updatedAt?: string;
}

const QRManagement: React.FC<QRManagementProps> = ({ deed, isOpen, onClose }) => {
  const [qrCodes, setQRCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQR, setEditingQR] = useState<QRCodeItem | null>(null);
  const [editPermissionType, setEditPermissionType] = useState<QRPermissionType>("public");
  const [editAllowedAddresses, setEditAllowedAddresses] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQR, setExpandedQR] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && deed._id) {
      fetchQRCodes();
    }
  }, [isOpen, deed._id]);

  const fetchQRCodes = async () => {
    if (!deed._id) return;
    setLoading(true);
    try {
      const response = await getQRCodesByDeed(deed._id);
      if (response.success) {
        setQRCodes(response.qrCodes || []);
      }
    } catch (error: any) {
      console.error("Error fetching QR codes:", error);
      showToast("Failed to load QR codes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qrId: string) => {
    setDeleteConfirm(qrId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteQRCode(deleteConfirm);
      showToast("QR code deleted successfully", "success");
      setDeleteConfirm(null);
      fetchQRCodes();
    } catch (error: any) {
      console.error("Error deleting QR code:", error);
      showToast(error?.message || "Failed to delete QR code", "error");
    }
  };

  const handleStartEdit = (qr: QRCodeItem) => {
    setEditingQR(qr);
    setEditPermissionType(qr.permissionType);
    setEditAllowedAddresses(qr.allowedAddresses.join(", "));
  };

  const handleCancelEdit = () => {
    setEditingQR(null);
    setEditPermissionType("public");
    setEditAllowedAddresses("");
  };

  const handleSaveEdit = async () => {
    if (!editingQR) return;

    if (editPermissionType === "restricted" && !editAllowedAddresses.trim()) {
      showToast("Please enter at least one allowed address", "error");
      return;
    }

    setIsSaving(true);
    try {
      const addressesArray = editPermissionType === "restricted"
        ? editAllowedAddresses.split(",").map(addr => addr.trim()).filter(addr => addr.length > 0)
        : [];

      await updateQRPermissions(editingQR.qrId, {
        permissionType: editPermissionType,
        allowedAddresses: addressesArray,
      });

      showToast("Permissions updated successfully", "success");
      handleCancelEdit();
      fetchQRCodes();
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      showToast(error?.message || "Failed to update permissions", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyQRId = (qrId: string) => {
    navigator.clipboard.writeText(qrId);
    setCopiedId(qrId);
    showToast("QR ID copied to clipboard", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQR = (qrId: string) => {
    const canvas = document.getElementById(`qr-canvas-${qrId}`) as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `deed-qr-${qrId}-${Date.now()}.png`;
    link.href = url;
    link.click();
    showToast("QR code downloaded", "success");
  };

  const toggleQRDisplay = (qrId: string) => {
    setExpandedQR(expandedQR === qrId ? null : qrId);
  };

  const getPermissionIcon = (type: QRPermissionType) => {
    switch (type) {
      case "public":
        return <FaGlobe className="w-4 h-4 text-green-600" />;
      case "restricted":
        return <FaUsers className="w-4 h-4 text-blue-600" />;
      case "owner_only":
        return <FaLock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getPermissionLabel = (type: QRPermissionType) => {
    switch (type) {
      case "public":
        return "Anyone can scan";
      case "restricted":
        return "Given people only";
      case "owner_only":
        return "Only I can scan";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaQrcode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">QR Code Management</h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">Deed #{deed.deedNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowScanner(true)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaQrcode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan QR</span>
                <span className="sm:hidden">Scan</span>
              </button>
              <button
                onClick={() => setShowGenerator(true)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-white text-emerald-600 text-sm sm:text-base font-semibold rounded-xl hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaQrcode className="w-4 h-4" />
                <span className="hidden sm:inline">Generate New</span>
                <span className="sm:hidden">Generate</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-xl p-2.5 transition-all duration-200 flex-shrink-0"
                title="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading QR codes...</p>
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaQrcode className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No QR Codes Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Generate your first QR code to share your deed securely with others.</p>
                <button
                  onClick={() => setShowGenerator(true)}
                  className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Generate First QR Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{qrCodes.length}</span> QR {qrCodes.length === 1 ? 'code' : 'codes'} generated
                  </p>
                </div>
                {qrCodes.map((qr, index) => (
                  <div
                    key={qr.qrId}
                    className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-6 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {editingQR?.qrId === qr.qrId ? (
                      <div className="space-y-5">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FaEdit className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-blue-900">Edit Permissions</h3>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Permission Type
                            </label>
                            <div className="space-y-2 text-black">
                              {(["public", "restricted", "owner_only"] as QRPermissionType[]).map((type) => (
                                <label 
                                  key={type} 
                                  className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    editPermissionType === type 
                                      ? 'border-emerald-500 bg-emerald-50' 
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="editPermissionType"
                                    value={type}
                                    checked={editPermissionType === type}
                                    onChange={(e) => setEditPermissionType(e.target.value as QRPermissionType)}
                                    className="mr-3 w-4 h-4 text-emerald-600"
                                  />
                                  <div className="flex items-center gap-2">
                                    {getPermissionIcon(type)}
                                    <span className="text-sm font-medium">{getPermissionLabel(type)}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>

                          {editPermissionType === "restricted" && (
                            <div className="mt-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Allowed Wallet Addresses
                              </label>
                              <textarea
                                value={editAllowedAddresses}
                                onChange={(e) => setEditAllowedAddresses(e.target.value)}
                                placeholder="Enter wallet addresses separated by commas (e.g., 0x123..., 0x456...)"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono text-sm bg-white text-black"
                                rows={4}
                              />
                              <p className="text-xs text-gray-500 mt-2">Separate multiple addresses with commas</p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-5">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="flex-1 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                              {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Permission Badge */}
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                qr.permissionType === 'public' ? 'bg-green-100' :
                                qr.permissionType === 'restricted' ? 'bg-blue-100' :
                                'bg-orange-100'
                              }`}>
                                {getPermissionIcon(qr.permissionType)}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900 text-base">
                                  {getPermissionLabel(qr.permissionType)}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <FaShieldAlt className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 capitalize">{qr.permissionType}</span>
                                </div>
                              </div>
                            </div>

                            {/* QR ID Section */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <FaIdCard className="w-3 h-3 text-gray-500" />
                                <span className="text-xs font-semibold text-gray-600 uppercase">QR ID</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-gray-800 break-all">{qr.qrId}</span>
                                <button
                                  onClick={() => handleCopyQRId(qr.qrId)}
                                  className="p-1.5 hover:bg-white rounded-lg transition flex-shrink-0"
                                  title="Copy QR ID"
                                >
                                  {copiedId === qr.qrId ? (
                                    <FaCheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <FaCopy className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Allowed Addresses */}
                            {qr.permissionType === "restricted" && qr.allowedAddresses.length > 0 && (
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <FaUsers className="w-3 h-3 text-blue-600" />
                                  <span className="text-xs font-semibold text-blue-800 uppercase">
                                    Allowed Addresses ({qr.allowedAddresses.length})
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {qr.allowedAddresses.map((addr, idx) => (
                                    <p key={idx} className="text-xs font-mono text-blue-900 bg-white px-2 py-1 rounded border border-blue-200">
                                      {addr}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Created Date */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaCalendarAlt className="w-3 h-3" />
                              <span>Created: {new Date(qr.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 sm:flex-col">
                            {qr.encryptedData && (
                              <button
                                onClick={() => toggleQRDisplay(qr.qrId)}
                                className={`p-3 rounded-xl transition-all duration-200 ${
                                  expandedQR === qr.qrId
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                                title={expandedQR === qr.qrId ? "Hide QR Code" : "Show QR Code"}
                              >
                                {expandedQR === qr.qrId ? (
                                  <FaEyeSlash className="w-5 h-5" />
                                ) : (
                                  <FaEye className="w-5 h-5" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEdit(qr)}
                              className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200"
                              title="Edit permissions"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(qr.qrId)}
                              className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200"
                              title="Delete QR code"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* QR Code Display Section */}
                        {qr.encryptedData && expandedQR === qr.qrId && (
                          <div className="border-t-2 border-gray-200 pt-5 mt-4 animate-fadeIn">
                            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border-2 border-emerald-200 shadow-inner">
                              <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                                  <QRCodeCanvas
                                    id={`qr-canvas-${qr.qrId}`}
                                    value={qr.encryptedData}
                                    size={220}
                                    includeMargin={true}
                                    level="M"
                                  />
                                </div>
                                <div className="text-center mb-4">
                                  <p className="text-sm font-semibold text-gray-700 mb-1">Deed Number</p>
                                  <p className="text-base font-mono text-emerald-700 font-bold">{qr.deedNumber}</p>
                                </div>
                                <button
                                  onClick={() => handleDownloadQR(qr.qrId)}
                                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                  <FaDownload className="w-4 h-4" />
                                  Download QR Code
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <FaTrash className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete QR Code?</h3>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this QR code? Anyone who has scanned it will no longer be able to access the deed through this QR code.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerator && (
        <DeedQRGenerator
          deed={deed}
          isOpen={showGenerator}
          onClose={() => {
            setShowGenerator(false);
            fetchQRCodes();
          }}
        />
      )}

      {showScanner && (
        <DeedQRScanner
          onClose={() => setShowScanner(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default QRManagement;

