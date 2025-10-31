import {
  FaEdit,
  FaExchangeAlt,
  FaFileDownload,
  FaShareAlt,
  FaEye,
  FaKey,
  FaHome,
} from "react-icons/fa";

interface DeedActionBarProps {
  deedNumber: string;
  tokenId?: number;
  numberOfFT: number;

  onEdit?: () => void;
  onTransfer?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onViewBlockchain?: () => void;
  onFractioning: () => void;
  onDirectTransfer: () => void;
  onSaleEscrow: () => void;
  onRent: () => void;
  onPowerOfAttorney: () => void;
}

const DeedActionBar = ({
  deedNumber,
  tokenId,
  onEdit,
  onTransfer,
  onDirectTransfer,
  onSaleEscrow,
  onDownload,
  onShare,
  onViewBlockchain,
  onFractioning,
  onRent,
  onPowerOfAttorney,
  numberOfFT,
}: DeedActionBarProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-6 w-full max-w-[460px] md:max-w-full h-full">
      <h3 className="font-bold text-gray-900 mb-5 text-lg flex items-center justify-between">
        Quick Actions
      </h3>

      <div className="flex flex-col gap-3">
        {onEdit && (
          <ActionButton
            icon={<FaEdit size={18} />}
            label="Edit Deed"
            onClick={onEdit}
            color="bg-green-600 hover:bg-green-700"
          />
        )}

        <ActionButton
          icon={<FaEdit size={18} />}
          label="Create Fractions"
          onClick={onFractioning}
          color={
            numberOfFT !== 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }
          disabled={numberOfFT !== 0}
        />

        {onTransfer && (
          <ActionButton
            icon={<FaExchangeAlt size={18} />}
            label="Transfer the Deed"
            onClick={onTransfer}
            color="bg-blue-600 hover:bg-blue-700"
          />
        )}

        {onDirectTransfer && (
          <ActionButton
            icon={<FaExchangeAlt size={18} />}
            label="Gift Your Deed"
            onClick={onDirectTransfer}
            color="bg-blue-600 hover:bg-blue-700"
          />
        )}

        {onSaleEscrow && (
          <ActionButton
            icon={<FaExchangeAlt size={18} />}
            label="Sell via Escrow"
            onClick={onSaleEscrow}
            color="bg-indigo-600 hover:bg-indigo-700"
          />
        )}

        {onRent && (
          <ActionButton
            icon={<FaHome size={18} />}
            label="Rent the Deed"
            onClick={onRent}
            color="bg-yellow-500 hover:bg-yellow-600 text-black"
          />
        )}

        {onPowerOfAttorney && (
          <ActionButton
            icon={<FaKey size={18} />}
            label="Grant Power of Attorney"
            onClick={onPowerOfAttorney}
            color="bg-purple-600 hover:bg-purple-700"
          />
        )}

        {onDownload && (
          <ActionButton
            icon={<FaFileDownload size={18} />}
            label="Download PDF"
            onClick={onDownload}
            color="bg-gray-100 hover:bg-gray-200 text-gray-800"
          />
        )}

        {onShare && (
          <ActionButton
            icon={<FaShareAlt size={18} />}
            label="Share Deed"
            onClick={onShare}
            color="bg-gray-100 hover:bg-gray-200 text-gray-800"
          />
        )}

        {tokenId !== undefined && onViewBlockchain && (
          <ActionButton
            icon={<FaEye size={18} />}
            label="View on Blockchain"
            onClick={onViewBlockchain}
            color="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
          />
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-gray-200">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-2">
          Deed Reference
        </div>
        <div className="font-mono text-sm text-gray-800 bg-gray-50 rounded-lg p-3 break-all">
          {deedNumber}
        </div>
      </div>
    </div>
  );
};

// Reusable button component for cleaner JSX
const ActionButton = ({
  icon,
  label,
  onClick,
  color,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  color: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg font-medium transition shadow-sm hover:shadow-md ${color}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default DeedActionBar;
