import { type FC } from "react";

interface TransactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const TransactPopup: FC<TransactPopupProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-lg"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transact</h2>
        <div className="text-gray-700">{children || "Transaction details will appear here."}</div>
      </div>
    </div>
  );
};

export default TransactPopup;
