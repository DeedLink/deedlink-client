import { type FC, useState, useEffect } from "react";
import { IoClose, IoWalletOutline, IoCalendarOutline, IoCashOutline, IoSearchOutline, IoCheckmarkCircle } from "react-icons/io5";
import { FaKey } from "react-icons/fa";
import { useWallet } from "../../../contexts/WalletContext";
import { useQR } from "../../../contexts/QRContext";
import { getUsers, createTransaction } from "../../../api/api";
import { createRentEscrow, landlordDepositNFT } from "../../../web3.0/escrowIntegration";
import type { User } from "../../../types/types";

interface GiveRentPopupProps {
  isOpen: boolean;
  tokenId: number;
  deedId: string;
  onClose: () => void;
}

const GiveRentPopup: FC<GiveRentPopupProps> = ({ isOpen, tokenId, deedId, onClose }) => {
  const { account } = useWallet();
  const { showQRPopup } = useQR();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [duration, setDuration] = useState(""); // months
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        const data = Array.isArray(res) ? res : [];
        const filtered = data.filter(
          (u) =>
            u.walletAddress &&
            u.walletAddress !== account &&
            u.kycStatus === "verified" &&
            u.role === "user"
        );
        setUsers(filtered);
        setFilteredUsers(filtered);
      } catch {
        setUsers([]);
        setFilteredUsers([]);
      }
    };
    if (isOpen) fetchUsers();
  }, [isOpen, account]);

  useEffect(() => {
    const val = search.trim().toLowerCase();
    setFilteredUsers(
      val === ""
        ? users
        : users.filter(
            (u) =>
              u.name?.toLowerCase().includes(val) ||
              u.walletAddress?.toLowerCase().includes(val)
          )
    );
  }, [search, users]);

  const shortAddress = (addr: string) =>
    addr && addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  const handleCreateRent = async () => {
    if (!selectedWallet) return alert("Please select a tenant!");
    if (!rentPrice || parseFloat(rentPrice) <= 0) return alert("Please enter a valid rent amount!");
    if (!duration || parseInt(duration) <= 0) return alert("Please enter rental duration in months!");

    const confirmRent = confirm(
      `Create rental agreement for property #${tokenId}?\n\nTenant: ${selectedWallet}\nRent: ${rentPrice} ETH/month\nDuration: ${duration} months`
    );
    if (!confirmRent) return;

    setLoading(true);
    try {
      const result = await createRentEscrow(tokenId, account!, selectedWallet, rentPrice, duration);
      if (result.success && result.escrowAddress) {
        setEscrowAddress(result.escrowAddress);
        setTxHash(result.txHash || "");

        await createTransaction(
          deedId,
          account!,
          selectedWallet,
          parseFloat(rentPrice),
          100,
          "rent_escrow",
          result.txHash,
          result.escrowAddress,
          `Rental Escrow Created - ${result.txHash}`
        );

        alert(`✅ Rent Escrow Created!\nEscrow Address: ${result.escrowAddress}`);
      } else {
        throw new Error(result.error || "Failed to create rent escrow");
      }
    } catch (error: any) {
      alert(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositNFT = async () => {
    if (!escrowAddress) return;

    setLoading(true);
    try {
      const result = await landlordDepositNFT(escrowAddress, tokenId);
      if (result.success) {
        alert(`✅ NFT Deposited to Escrow!\nTransaction: ${result.txHash}`);
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      alert(`❌ Deposit Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <FaKey className="text-amber-700" size={18} />
            </div>
            <h2 className="text-xl font-bold text-[#6B4F00]">{escrowAddress ? "Deposit NFT" : "Create Rent"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 transition">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {!escrowAddress ? (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <IoWalletOutline size={16} />
                  Tenant Wallet Address
                </label>
                <input
                  type="text"
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <IoCashOutline size={16} />
                  Rent per Month (ETH)
                </label>
                <input
                  type="number"
                  value={rentPrice}
                  onChange={(e) => setRentPrice(e.target.value)}
                  placeholder="Enter monthly rent"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <IoCalendarOutline size={16} />
                  Duration (months)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Enter duration"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div className="relative mb-3">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search verified tenants"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.walletAddress}
                      onClick={() => setSelectedWallet(user.walletAddress!)}
                      className={`px-4 py-3 cursor-pointer ${
                        selectedWallet === user.walletAddress ? "bg-amber-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold text-sm">{user.name}</div>
                          <div className="text-xs font-mono text-gray-500">{shortAddress(user.walletAddress!)}</div>
                        </div>
                        {selectedWallet === user.walletAddress && (
                          <IoCheckmarkCircle className="text-amber-600" size={20} />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">No users found</div>
                )}
              </div>

              <button
                onClick={handleCreateRent}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold ${
                  loading
                    ? "bg-gray-300 text-gray-500"
                    : "bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:shadow-lg"
                }`}
              >
                {loading ? "Creating Rent..." : "Create Rent Escrow"}
              </button>
            </>
          ) : (
            <>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-sm font-semibold text-amber-800 mb-2">Escrow Created!</div>
                <p className="text-xs text-gray-700">
                  Escrow Address: {shortAddress(escrowAddress)}<br />
                  Tenant: {shortAddress(selectedWallet)}<br />
                  Rent: {rentPrice} ETH/month
                </p>
              </div>

              <button
                onClick={handleDepositNFT}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold ${
                  loading
                    ? "bg-gray-300 text-gray-500"
                    : "bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:shadow-lg"
                }`}
              >
                {loading ? "Depositing NFT..." : "Deposit NFT to Escrow"}
              </button>
            </>
          )}

          <button
            onClick={() =>
              showQRPopup({
                deedId,
                escrowAddress: escrowAddress || "",
                seller: account || "",
                hash: txHash,
                size: 220,
              })
            }
            disabled={!txHash}
            className={`w-full py-3 rounded-xl font-semibold bg-gray-900 text-white hover:bg-black ${
              !txHash ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Show QR Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveRentPopup;
