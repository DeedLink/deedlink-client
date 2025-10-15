// QRContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from "react";
import QRScanner from "../components/qr/QRscanner";
import TnxQR from "../components/qr/QRtnx";
import { useWallet } from "../contexts/WalletContext";

interface QRData {
  deedId: string;
  escrowAddress: string;
  seller: string;
  hash?: string;
  size?: number;
}

interface QRContextType {
  showQRScanner: (callback: (data: QRData) => void) => void;
  showQRPopup: (data: QRData) => void;
}

const QRContext = createContext<QRContextType>({
  showQRScanner: () => {},
  showQRPopup: () => {},
});

export const QRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { account } = useWallet();
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannerCallback, setScannerCallback] = useState<(data: QRData) => void>();
  
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState<QRData | null>(null);

  // ----------------- Scanner -----------------
  const showQRScanner = (callback: (data: QRData) => void) => {
    setScannerCallback(() => callback);
    setScannerVisible(true);
  };

  const handleScanSuccess = (data: QRData) => {
    const parsedData: QRData = {
      deedId: data.deedId,
      escrowAddress: data.escrowAddress,
      seller: data.seller,
      hash: data.hash,
    };
    if (scannerCallback) scannerCallback(parsedData);
    setScannerVisible(false);
  };

  const handleCloseScanner = () => setScannerVisible(false);

  // ----------------- QR Popup -----------------
  const showQRPopup = (data: QRData) => {
    setPopupData(data);
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    setPopupData(null);
  };

  return (
    <QRContext.Provider value={{ showQRScanner, showQRPopup }}>
      {children}

      {/* QR Scanner Modal */}
      {isScannerVisible && (
        <QRScanner onScan={handleScanSuccess} onClose={handleCloseScanner} />
      )}

      {/* QR Popup Modal */}
      {isPopupVisible && popupData && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClosePopup}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-3">Transaction QR</h2>
            <TnxQR
              deedId={popupData.deedId}
              escrowAddress={popupData.escrowAddress}
              seller={popupData.seller || (account as string)}
              hash={popupData.hash || "pending"}
              size={popupData.size || 200}
            />
            <p className="text-xs text-gray-600 mt-3 text-center break-words">
              Scan this QR to verify escrow transaction details securely.
            </p>
            <button
              onClick={handleClosePopup}
              className="mt-4 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-black transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </QRContext.Provider>
  );
};

export const useQR = () => useContext(QRContext);
