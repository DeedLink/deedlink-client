import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Decrypting } from "../../utils/encryption";

interface QRScannerProps {
  onScan: (data: QRData) => void;
  onClose: () => void;
}

export interface QRData {
  deedId: string;
  escrowAddress: string;
  seller: string;
  hash?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const qrCodeRegionId = "html5qr-scanner";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);

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

        const decryptedData = Decrypting(decodedText);
        
        if (!decryptedData || typeof decryptedData !== "object") {
          console.warn("QR code decryption failed or returned invalid data:", decryptedData);
          return;
        }

        const data = decryptedData as QRData;
        
        // Validate required fields
        if (!data.deedId || !data.escrowAddress || !data.seller) {
          console.warn("QR code missing required fields:", {
            hasDeedId: !!data.deedId,
            hasEscrowAddress: !!data.escrowAddress,
            hasSeller: !!data.seller,
            data
          });
          return;
        }

        // Validate escrow address format (should be Ethereum address)
        if (!data.escrowAddress.startsWith("0x") || data.escrowAddress.length !== 42) {
          console.warn("Invalid escrow address format:", data.escrowAddress);
          return;
        }

        await stopScanner();
        onScan(data);
      } catch (err) {
        console.error("QR code decrypt error:", err);
      }
    };

    const qrCodeErrorCallback = (errorMessage: string) => {
      console.warn("QR code scan error:", errorMessage);
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
  }, [onScan]);

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
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white text-center">
            Scan QR Code
          </h2>
          <p className="text-green-50 text-sm text-center mt-1">
            Position the QR code within the frame
          </p>
        </div>

        <div className="p-6">
          <div className="relative">
            <div
              id={qrCodeRegionId}
              className="w-full rounded-lg overflow-hidden border-4 border-green-500"
              style={{ aspectRatio: "1/1" }}
            />
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
            </div>
          </div>

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

export default QRScanner;