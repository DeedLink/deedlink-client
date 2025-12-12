import React, { useEffect, useState } from "react";
import { FaTimes, FaTrash, FaEdit, FaCopy, FaCheckCircle, FaQrcode, FaGlobe, FaLock, FaUsers } from "react-icons/fa";
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
    if (!window.confirm("Are you sure you want to delete this QR code?")) {
      return;
    }

    try {
      await deleteQRCode(qrId);
      showToast("QR code deleted successfully", "success");
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
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
            <h2 className="text-lg sm:text-xl font-bold text-white">QR Code Management</h2>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowScanner(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-emerald-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-emerald-400 transition flex items-center justify-center gap-2"
              >
                <FaQrcode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan QR</span>
                <span className="sm:hidden">Scan</span>
              </button>
              <button
                onClick={() => setShowGenerator(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white text-emerald-600 text-sm sm:text-base font-semibold rounded-lg hover:bg-emerald-50 transition flex items-center justify-center gap-2"
              >
                <FaQrcode className="w-4 h-4" />
                <span className="hidden sm:inline">Generate New</span>
                <span className="sm:hidden">Generate</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition flex-shrink-0"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading QR codes...</p>
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-12">
                <FaQrcode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No QR codes generated yet</p>
                <button
                  onClick={() => setShowGenerator(true)}
                  className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
                >
                  Generate First QR Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {qrCodes.map((qr) => (
                  <div
                    key={qr.qrId}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition"
                  >
                    {editingQR?.qrId === qr.qrId ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Permission Type
                          </label>
                          <div className="space-y-2">
                            {(["public", "restricted", "owner_only"] as QRPermissionType[]).map((type) => (
                              <label key={type} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                  type="radio"
                                  name="editPermissionType"
                                  value={type}
                                  checked={editPermissionType === type}
                                  onChange={(e) => setEditPermissionType(e.target.value as QRPermissionType)}
                                  className="mr-2"
                                />
                                <span className="text-sm">{getPermissionLabel(type)}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {editPermissionType === "restricted" && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Allowed Wallet Addresses
                            </label>
                            <textarea
                              value={editAllowedAddresses}
                              onChange={(e) => setEditAllowedAddresses(e.target.value)}
                              placeholder="Enter wallet addresses separated by commas"
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none font-mono text-sm"
                              rows={3}
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getPermissionIcon(qr.permissionType)}
                            <span className="font-semibold text-gray-900">
                              {getPermissionLabel(qr.permissionType)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="font-mono break-all">{qr.qrId}</span>
                            <button
                              onClick={() => handleCopyQRId(qr.qrId)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                              title="Copy QR ID"
                            >
                              {copiedId === qr.qrId ? (
                                <FaCheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <FaCopy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {qr.permissionType === "restricted" && qr.allowedAddresses.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                                Allowed Addresses ({qr.allowedAddresses.length})
                              </p>
                              <div className="space-y-1">
                                {qr.allowedAddresses.map((addr, idx) => (
                                  <p key={idx} className="text-xs font-mono text-gray-700">
                                    {addr}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Created: {new Date(qr.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleStartEdit(qr)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit permissions"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(qr.qrId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete QR code"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </>
  );
};

export default QRManagement;

