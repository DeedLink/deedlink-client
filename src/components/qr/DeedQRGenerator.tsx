import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaTimes, FaDownload, FaCopy, FaCheckCircle } from "react-icons/fa";
import { Encryting } from "../../utils/encryption";
import { generateDeedQR } from "../../api/api";
import { useToast } from "../../contexts/ToastContext";
import type { QRPermissionType } from "../../types/qr";
import type { IDeed } from "../../types/responseDeed";

interface DeedQRGeneratorProps {
  deed: IDeed;
  isOpen: boolean;
  onClose: () => void;
}

const DeedQRGenerator: React.FC<DeedQRGeneratorProps> = ({ deed, isOpen, onClose }) => {
  const [permissionType, setPermissionType] = useState<QRPermissionType>("public");
  const [allowedAddresses, setAllowedAddresses] = useState<string>("");
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!deed._id) {
      showToast("Deed ID not found", "error");
      return;
    }

    if (permissionType === "restricted" && !allowedAddresses.trim()) {
      showToast("Please enter at least one allowed address", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const addressesArray = permissionType === "restricted" 
        ? allowedAddresses.split(",").map(addr => addr.trim()).filter(addr => addr.length > 0)
        : [];

      const tempEncryptedData = Encryting({
        qrId: "temp",
        deedId: deed._id,
        tokenId: deed.tokenId,
        deedNumber: deed.deedNumber,
        permissionType,
        allowedAddresses: addressesArray,
      });

      const response = await generateDeedQR({
        deedId: deed._id,
        permissionType,
        allowedAddresses: addressesArray,
        encryptedData: tempEncryptedData,
      });

      if (response.success && response.qrCode.qrId) {
        const qrData = {
          qrId: response.qrCode.qrId,
          deedId: deed._id,
          tokenId: deed.tokenId,
          deedNumber: deed.deedNumber,
          permissionType,
          allowedAddresses: addressesArray,
        };

        const encryptedData = Encryting(qrData);
        setGeneratedQR(encryptedData);
        setQrId(response.qrCode.qrId);
        showToast("QR code generated successfully", "success");
      } else {
        showToast("Failed to generate QR code", "error");
      }
    } catch (error: any) {
      console.error("Error generating QR:", error);
      showToast(error?.message || "Failed to generate QR code", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedQR) return;

    const canvas = document.getElementById("deed-qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `deed-qr-${deed.deedNumber}-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const handleCopyQRId = () => {
    if (!qrId) return;
    navigator.clipboard.writeText(qrId);
    setCopied(true);
    showToast("QR ID copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setPermissionType("public");
    setAllowedAddresses("");
    setGeneratedQR(null);
    setQrId(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">Generate QR Code for Deed</h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <FaTimes className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Deed Number</p>
            <p className="text-lg font-mono text-gray-900">{deed.deedNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Permission Type
            </label>
            <div className="space-y-2 text-black">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="permissionType"
                  value="public"
                  checked={permissionType === "public"}
                  onChange={(e) => setPermissionType(e.target.value as QRPermissionType)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-black">Anyone can scan</p>
                  <p className="text-xs text-black">Public access - no restrictions</p>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="permissionType"
                  value="restricted"
                  checked={permissionType === "restricted"}
                  onChange={(e) => setPermissionType(e.target.value as QRPermissionType)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-black">Given people only</p>
                  <p className="text-xs text-black">Only specified addresses can scan</p>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="permissionType"
                  value="owner_only"
                  checked={permissionType === "owner_only"}
                  onChange={(e) => setPermissionType(e.target.value as QRPermissionType)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-black">Only I can scan</p>
                  <p className="text-xs text-black">Only deed owners can scan</p>
                </div>
              </label>
            </div>
          </div>

          {permissionType === "restricted" && (
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Allowed Wallet Addresses
              </label>
              <textarea
                value={allowedAddresses}
                onChange={(e) => setAllowedAddresses(e.target.value)}
                placeholder="Enter wallet addresses separated by commas&#10;Example: 0x123..., 0x456..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none font-mono text-sm text-black"
                rows={4}
              />
              <p className="text-xs text-black mt-1">
                Separate multiple addresses with commas
              </p>
            </div>
          )}

          {!generatedQR ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate QR Code"}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border-2 border-emerald-200">
                <QRCodeCanvas
                  id="deed-qr-canvas"
                  value={generatedQR}
                  size={256}
                  includeMargin={true}
                  level="M"
                />
                <p className="text-xs text-gray-600 mt-4 text-center font-mono break-all">
                  {deed.deedNumber}
                </p>
              </div>

              {qrId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-900 uppercase mb-1">
                        QR Code ID
                      </p>
                      <p className="text-sm font-mono text-blue-700 break-all">{qrId}</p>
                    </div>
                    <button
                      onClick={handleCopyQRId}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="Copy QR ID"
                    >
                      {copied ? (
                        <FaCheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <FaCopy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition"
                >
                  <FaDownload className="w-5 h-5" />
                  Download QR
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Generate New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeedQRGenerator;

