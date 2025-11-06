import React, { useEffect, useState } from "react";

interface AddToMarketPopupProps {
  isOpen: boolean;
  tokenId: number;
  onClose: () => void;
}

const AddToMarketPopup: React.FC<AddToMarketPopupProps> = ({ isOpen, tokenId, onClose }) => {
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#f0fff4] text-gray-900 rounded-2xl shadow-xl border border-green-300 w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>
        <h2 className="text-xl font-semibold mb-5 text-center text-green-700">List Deed #{tokenId}</h2>

        <form className="flex flex-col gap-3">
          <input
            type="number"
            min={0}
            placeholder="Sale Price (ETH)"
            className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-green-300 bg-white"
          />
          <textarea
            rows={3}
            placeholder="Description..."
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
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">List</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToMarketPopup;
