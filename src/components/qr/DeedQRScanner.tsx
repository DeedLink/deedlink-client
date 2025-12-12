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
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning()) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error("QR scanner stop failed:", err);
    }
    startedRef.current = false;
  };

  useEffect(() => {
    let isMounted = true;
    let scannerInstance: Html5Qrcode | null = null;
    let checkingRef = false;

    const initializeScanner = async () => {
      try {
        scannerInstance = new Html5Qrcode(qrCodeRegionId, {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        });

        html5QrCodeRef.current = scannerInstance;

        const qrCodeErrorCallback = (errorMessage: string) => {
          if (!errorMessage.includes("NotFoundException") && !errorMessage.includes("No MultiFormat Readers")) {
            console.warn("QR code scan error:", errorMessage);
          }
        };

        const qrCodeSuccessCallback = async (decodedText: string) => {
          if (!isMounted || checkingRef) return;

          try {
            if (!decodedText || decodedText.trim().length === 0) {
              console.warn("QR code contains empty data");
              return;
            }

            checkingRef = true;
            setIsChecking(true);

            const decryptedData = Decrypting(decodedText);
            
            if (!decryptedData || typeof decryptedData !== "object") {
              showToast("Invalid QR code format", "error");
              checkingRef = false;
              setIsChecking(false);
              return;
            }

            const qrData = decryptedData as DeedQRData;
            
            if (!qrData.qrId) {
              showToast("QR code missing QR ID", "error");
              checkingRef = false;
              setIsChecking(false);
              return;
            }

            if (scannerInstance && scannerInstance.isScanning()) {
              await scannerInstance.stop();
            }

            try {
              const permissionCheck = await checkQRPermissions(qrData.qrId, account || undefined);
              
              if (permissionCheck.hasAccess) {
                navigate(`/qr/deed/${qrData.qrId}${account ? `?scannerAddress=${account}` : ""}`);
              } else {
                showToast(permissionCheck.reason || "Access denied", "error");
                checkingRef = false;
                setIsChecking(false);
                if (isMounted && scannerInstance) {
                  setTimeout(async () => {
                    if (scannerInstance && !scannerInstance.isScanning() && isMounted) {
                      try {
                        await scannerInstance.start(
                          { facingMode: "environment" },
                          {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                          },
                          qrCodeSuccessCallback,
                          qrCodeErrorCallback
                        );
                      } catch (err: any) {
                        if (!err?.message?.includes("Already scanning")) {
                          console.error("QR scanner restart failed:", err);
                        }
                      }
                    }
                  }, 2000);
                }
              }
            } catch (error: any) {
              console.error("Permission check error:", error);
              showToast(error?.message || "Failed to check permissions", "error");
              checkingRef = false;
              setIsChecking(false);
              if (isMounted && scannerInstance) {
                setTimeout(async () => {
                  if (scannerInstance && !scannerInstance.isScanning() && isMounted) {
                    try {
                      await scannerInstance.start(
                        { facingMode: "environment" },
                        {
                          fps: 10,
                          qrbox: { width: 250, height: 250 },
                          aspectRatio: 1.0,
                        },
                        qrCodeSuccessCallback,
                        qrCodeErrorCallback
                      );
                    } catch (err: any) {
                      if (!err?.message?.includes("Already scanning")) {
                        console.error("QR scanner restart failed:", err);
                      }
                    }
                  }
                }, 2000);
              }
            }
          } catch (err) {
            console.error("QR code decrypt error:", err);
            showToast("Failed to decrypt QR code", "error");
            checkingRef = false;
            setIsChecking(false);
          }
        };

        const startScanner = async () => {
          if (!isMounted || !scannerInstance) return;
          try {
            await scannerInstance.start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              qrCodeSuccessCallback,
              qrCodeErrorCallback
            );
          } catch (err: any) {
            if (err?.message?.includes("Already scanning")) {
              return;
            }
            console.error("QR scanner start failed:", err);
          }
        };

        await startScanner();
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
      }
    };

    initializeScanner();

    return () => {
      isMounted = false;
      checkingRef = false;
      stopScanner();
      startedRef.current = false;
    };
  }, [account, navigate, showToast]);

  const handleClose = async () => {
    await stopScanner();
    startedRef.current = false;
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

