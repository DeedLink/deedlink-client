import React, { useEffect } from "react";

interface AddToMarketPopupProps {
  isOpen: boolean;
  tokenId: number;
  onClose: () => void;
}

const AddToMarketPopup: React.FC<AddToMarketPopupProps> = ({
  isOpen,
  tokenId,
  onClose,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] text-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Add Property #{tokenId} to Market
        </h2>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Sale Price (ETH)
            </label>
            <input
              type="number"
              placeholder="Enter sale price"
              className="w-full px-3 py-2 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:border-primary_light"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Enter a short description..."
              className="w-full px-3 py-2 bg-transparent border border-gray-500 rounded-lg focus:outline-none focus:border-primary_light"
            />
          </div>

          <button
            type="submit"
            className="bg-primary_light text-black font-semibold py-2 rounded-lg hover:bg-primary_bold transition"
          >
            List on Market
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddToMarketPopup;
