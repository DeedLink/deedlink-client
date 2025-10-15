import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

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

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });

    const qrCodeSuccessCallback = (decodedText: string) => {
      try {
        const data: QRData = JSON.parse(decodedText);
        if (data.deedId && data.escrowAddress && data.seller) {
          onScan(data);
          stopScanner();
        } else {
          console.warn("QR code missing required fields", data);
        }
      } catch (err) {
        console.error("QR code parse error", err);
      }
    };

    const qrCodeErrorCallback = (errorMessage: string) => {
      console.warn("QR code scan error:", errorMessage);
    };

    const startScanner = async () => {
      try {
        await html5QrCodeRef.current?.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 200, aspectRatio: 1.0 },
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );
      } catch (err) {
        console.error("QR scanner start failed:", err);
      }
    };

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

    startScanner();

    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, [onScan]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-3">Scan QR Code</h2>
        <div id={qrCodeRegionId} className="w-[300px] h-[300px]" />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-black transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
