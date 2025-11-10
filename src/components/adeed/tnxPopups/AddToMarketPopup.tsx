import React, { useEffect, useState } from "react";
import type { IDeed } from "../../../types/responseDeed";
import type { Marketplace } from "../../../types/marketplace";
import { createMarketPlace } from "../../../api/api";
import { useWallet } from "../../../contexts/WalletContext";

interface AddToMarketPopupProps {
  deed: IDeed;
  isOpen: boolean;
  tokenId: number;
  onClose: () => void;
  ownedFractionalTokens?: number;
  totalFractionalTokens?: number;
  hasFractionalized?: boolean;
}

const AddToMarketPopup: React.FC<AddToMarketPopupProps> = ({
  deed,
  isOpen,
  tokenId,
  onClose,
  ownedFractionalTokens = 0,
  totalFractionalTokens = 0,
  hasFractionalized = false,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [salePrice, setSalePrice] = useState("");
  const [ftAmount, setFtAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { account } = useWallet();

  if(!account) return;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const isFullOwner = !hasFractionalized;
  const canSellFT = hasFractionalized && ownedFractionalTokens > 0;

  const handleAddToMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isFullOwner && !canSellFT) || !salePrice) return;

    try {
      setLoading(true);

      const newMarket: Omit<Marketplace, "_id" | "timestamp" | "status"> = {
        marketPlaceId: `MP-${Date.now()}`,
        from: account,
        amount: Number(salePrice),
        deedId: deed._id || "",
        tokenId: tokenId.toString(),
        share: isFullOwner ? 100 : ftAmount,
        description,
      };

      await createMarketPlace(newMarket);
      onClose();
    } catch (error) {
      console.error("Error adding to marketplace:", error);
      alert("Failed to list property on marketplace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2"
      onClick={onClose}
    >
      <div
        className="bg-[#f0fff4] text-gray-900 rounded-2xl shadow-xl border border-green-300 w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>
        <h2 className="text-xl font-semibold mb-5 text-center text-green-700">
          {isFullOwner ? `List Full Property #${tokenId}` : `List Fractional Tokens of #${tokenId}`}
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleAddToMarket}>
          <input
            type="number"
            min={0}
            placeholder="Sale Price (ETH)"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-green-300 bg-white"
          />

          {canSellFT && (
            <div>
              <p className="text-sm mb-2 text-gray-700">
                You own <span className="font-semibold">{ownedFractionalTokens}</span> of{" "}
                <span className="font-semibold">{totalFractionalTokens}</span> fractional tokens.
              </p>
              <input
                type="number"
                min={1}
                max={ownedFractionalTokens}
                placeholder="Number of tokens to sell"
                value={ftAmount}
                onChange={(e) => setFtAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-green-300 bg-white"
              />
            </div>
          )}

          {!canSellFT && !isFullOwner && (
            <p className="text-sm text-red-600 text-center">
              You don’t own any fractional tokens to sell.
            </p>
          )}

          <textarea
            rows={3}
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-green-300 bg-white"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-700 bg-white file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg border border-green-200"
            />
          )}

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFullOwner && !canSellFT || loading}
              className={`px-4 py-2 rounded-lg text-white transition ${
                (isFullOwner || canSellFT)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Listing..." : "List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToMarketPopup;
