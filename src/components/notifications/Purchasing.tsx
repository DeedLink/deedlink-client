import { useEffect, useState } from "react";
import BuyerEscrowPopup from "../adeed/tnxPopups/BuyerEscrowPopup";
import { useQR } from "../../contexts/QRContext";
import { IoQrCodeOutline } from "react-icons/io5";
import type { QRData } from "../qr/QRscanner";
import { validateEscrowString } from "../../utils/helpers";


function PurchancePanel() {
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null);
  const [_deedId, setDeedId] = useState<string>("");
  const [scannedData, setScannedData] = useState<QRData | null>(null);
  const [typed, setTyped] = useState<string>("");

  const { showQRScanner } = useQR();

  useEffect(() => {
    if (selectedEscrow) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [selectedEscrow]);

  const handleScanQR = () => {
    showQRScanner((data: QRData) => {
      console.log("Scanned QR Data:", data);
      if (data?.escrowAddress && data?.deedId) {
        setScannedData(data);
        setSelectedEscrow(data.escrowAddress);
        setDeedId(data.deedId);
      } else {
        alert("Invalid or incomplete QR data!");
      }
    });
  };

  useEffect(() => {
    console.log(typed);
    const [ok, decrypted] = validateEscrowString(typed);
    if (ok && decrypted) {
      const obj = decrypted as QRData;
      console.log(obj);
      setScannedData(obj);
      setDeedId(obj.deedId);
      setSelectedEscrow(obj.escrowAddress)
    }
  }, [typed]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-4 py-2">
        <h2 className="text-xl font-bold text-gray-800">Purchases</h2>
        <button
          onClick={handleScanQR}
          className="font-semibold cursor-pointer bg-amber-950 flex items-center justify-center border border-gray-300 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <IoQrCodeOutline className="inline-block text-lg" />
        </button>
        <div>
          <input value={typed} onChange={(e)=>setTyped(e.target.value)} className="border text-black border-green-400 rounded-lg p-1 w-48 max-w-[44vw]"></input>
        </div>
      </div>

      {scannedData && (
        <div
          className="w-full flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200"
        >
          <p className="text-gray-700">
            Purchase found for Deed ID: <b>{scannedData.deedId}</b>
          </p>
          <button
            onClick={() => {
              setSelectedEscrow(scannedData.escrowAddress);
              setDeedId(scannedData.deedId);
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            View Purchase
          </button>
        </div>
      )}

      {selectedEscrow && (
        <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <BuyerEscrowPopup
            isOpen={!!selectedEscrow}
            escrowAddress={selectedEscrow}
            onClose={() => setSelectedEscrow(null)}
          />
        </div>
      )}
    </div>
  );
}

export default PurchancePanel;
