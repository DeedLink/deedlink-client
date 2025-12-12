import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Decrypting } from "../../utils/encryption";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../contexts/WalletContext";
import { checkQRPermissions } from "../../api/api";
import { useToast } from "../../contexts/ToastContext";
import { FaTimes } from "react-icons/fa";
import type { DeedQRData } from "../../types/qr";

interface DeedQRScannerProps {
  onClose: () => void;
}

const DeedQRScanner: React.FC<DeedQRScannerProps> = ({ onClose }) => {
  const qrCodeRegionId = "deed-qr-scanner";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const navigate = useNavigate();
  const { account } = useWallet();
  const { showToast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      await html5QrCodeRef.current?.clear();
    } catch (err) {
      console.error("QR scanner stop failed:", err);
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });

    const qrCodeSuccessCallback = async (decodedText: string) => {
      try {
        if (!decodedText || decodedText.trim().length === 0) {
          console.warn("QR code contains empty data");
          return;
        }

        if (isChecking) return;
        setIsChecking(true);

        const decryptedData = Decrypting(decodedText);
        
        if (!decryptedData || typeof decryptedData !== "object") {
          showToast("Invalid QR code format", "error");
          setIsChecking(false);
          return;
        }

        const qrData = decryptedData as DeedQRData;
        
        if (!qrData.qrId) {
          showToast("QR code missing QR ID", "error");
          setIsChecking(false);
          return;
        }

        await stopScanner();

        try {
          const permissionCheck = await checkQRPermissions(qrData.qrId, account || undefined);
          
          if (permissionCheck.hasAccess) {
            navigate(`/qr/deed/${qrData.qrId}${account ? `?scannerAddress=${account}` : ""}`);
          } else {
            showToast(permissionCheck.reason || "Access denied", "error");
            setIsChecking(false);
            setTimeout(() => {
              startedRef.current = false;
              startScanner();
            }, 2000);
          }
        } catch (error: any) {
          console.error("Permission check error:", error);
          showToast(error?.message || "Failed to check permissions", "error");
          setIsChecking(false);
          setTimeout(() => {
            startedRef.current = false;
            startScanner();
          }, 2000);
        }
      } catch (err) {
        console.error("QR code decrypt error:", err);
        showToast("Failed to decrypt QR code", "error");
        setIsChecking(false);
      }
    };

    const qrCodeErrorCallback = (errorMessage: string) => {
      if (!errorMessage.includes("NotFoundException")) {
        console.warn("QR code scan error:", errorMessage);
      }
    };

    const startScanner = async () => {
      try {
        await html5QrCodeRef.current?.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );
      } catch (err) {
        console.error("QR scanner start failed:", err);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [account, navigate, showToast, isChecking]);

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Scan Deed QR Code</h2>
            <p className="text-emerald-50 text-sm mt-1">
              Position the QR code within the frame
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative">
            <div
              id={qrCodeRegionId}
              className="w-full rounded-lg overflow-hidden border-4 border-emerald-500"
              style={{ aspectRatio: "1/1" }}
            />
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
            </div>
          </div>

          {isChecking && (
            <div className="mt-4 text-center">
              <div className="inline-block w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 mt-2">Checking permissions...</p>
            </div>
          )}

          <button
            onClick={handleClose}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeedQRScanner;

