import { type FC, useEffect, useState } from "react";
import {
  IoClose,
  IoCashOutline,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoWalletOutline,
  IoQrCodeOutline,
} from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { useWallet } from "../../../contexts/WalletContext";
import { useQR } from "../../../contexts/QRContext";
import { getRentEscrowsForTenant, payRent, claimRentedNFT } from "../../../web3.0/escrowIntegration";
import { createTransaction } from "../../../api/api";

interface GetRentPopupProps {
  isOpen: boolean;
  deedId: string;
  tokenId: number;
  onClose: () => void;
}

const GetRentPopup: FC<GetRentPopupProps> = ({ isOpen, deedId, tokenId, onClose }) => {
  const { account } = useWallet();
  const { showQRPopup } = useQR();

  const [escrowAddress, setEscrowAddress] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [landlord, setLandlord] = useState("");
  const [duration, setDuration] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [rentalInfo, setRentalInfo] = useState<any>(null);

  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        const res = await getRentEscrowsForTenant(account!, tokenId);
        if (res.success && res.escrow) {
          setEscrowAddress(res.escrow.escrowAddress);
          setLandlord(res.escrow.landlord);
          setRentAmount(res.escrow.rentPrice);
          setDuration(res.escrow.duration);
          setRentalInfo(res.escrow);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen && account) fetchEscrow();
  }, [isOpen, account, tokenId]);

  const shortAddress = (addr: string) =>
    addr && addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  const handlePayRent = async () => {
    if (!escrowAddress || !rentAmount) return alert("Invalid escrow details.");
    setLoading(true);
    try {
      const result = await payRent(escrowAddress, rentAmount);
      if (result.success) {
        setTxHash(result.txHash);
        await createTransaction(
          deedId,
          account!,
          landlord,
          parseFloat(rentAmount),
          100,
          "rent_payment",
          result.txHash,
          escrowAddress,
          "Tenant paid rent successfully"
        );
        alert("✅ Rent payment successful!");
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert(`❌ Rent payment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimNFT = async () => {
    if (!escrowAddress) return;
    setLoading(true);
    try {
      const result = await claimRentedNFT(escrowAddress);
      if (result.success) {
        alert("✅ Rental completed and NFT claimed back!");
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert(`❌ Claim failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <FaHome className="text-amber-700" size={18} />
            </div>
            <h2 className="text-xl font-bold text-[#6B4F00]">Rent Property</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-2 transition"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {escrowAddress ? (
            <>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-sm font-semibold text-amber-800 mb-2">
                  Active Rent Escrow Found
                </div>
                <p className="text-xs text-gray-700">
                  Escrow Address: {shortAddress(escrowAddress)} <br />
                  Landlord: {shortAddress(landlord)} <br />
                  Rent: {rentAmount} ETH/month <br />
                  Duration: {duration} months
                </p>
              </div>

              <button
                onClick={handlePayRent}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold ${
                  loading
                    ? "bg-gray-300 text-gray-500"
                    : "bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:shadow-lg"
                }`}
              >
                {loading ? "Paying Rent..." : "Pay Rent"}
              </button>

              <button
                onClick={handleClaimNFT}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold ${
                  loading
                    ? "bg-gray-300 text-gray-500"
                    : "bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:shadow-lg"
                }`}
              >
                {loading ? "Claiming..." : "Claim NFT (End of Rent)"}
              </button>

              <button
                onClick={() =>
                  showQRPopup({
                    deedId,
                    escrowAddress,
                    seller: landlord,
                    hash: txHash,
                    size: 220,
                  })
                }
                disabled={!txHash}
                className={`w-full py-3 rounded-xl font-semibold bg-gray-900 text-white hover:bg-black ${
                  !txHash ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex justify-center items-center gap-2">
                  <IoQrCodeOutline size={18} />
                  Show Rent QR Details
                </div>
              </button>
            </>
          ) : (
            <div className="p-4 border border-gray-200 rounded-xl text-center text-gray-600 text-sm">
              No active rental escrow found for this property.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetRentPopup;
