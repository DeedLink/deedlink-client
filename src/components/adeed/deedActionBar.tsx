import { FaEdit, FaExchangeAlt, FaFileDownload, FaShareAlt, FaEye } from "react-icons/fa";

interface DeedActionBarProps {
  deedNumber: string;
  tokenId?: number;
  onEdit?: () => void;
  onTransfer?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onViewBlockchain?: () => void;
  onFractioning: () => void;
  numberOfFT: number;
}

const DeedActionBar = ({
  deedNumber,
  tokenId,
  onEdit,
  onTransfer,
  onDownload,
  onShare,
  onViewBlockchain,
  onFractioning,
  numberOfFT,
}: DeedActionBarProps) => {
  return (
    <div className="rounded-xl border border-black/5 p-5 bg-white shadow-sm flex flex-col h-full lg:w-fit min-w-[320px] xl:min-w-[480px]">
      <h3 className="font-bold text-gray-900 mb-4 text-lg">Quick Actions</h3>
      <div className="space-y-3">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm hover:shadow-md"
          >
            <FaEdit size={18} />
            <span>Edit Deed</span>
          </button>
        )}

        {onFractioning && (
          <button
            disabled={numberOfFT != 0}
            onClick={onFractioning}
            className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg font-medium transition shadow-sm hover:shadow-md ${numberOfFT != 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            <FaEdit size={18} />
            <span>Create Fractions</span>
          </button>
        )}

        {onTransfer && (
          <button
            onClick={onTransfer}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm hover:shadow-md"
          >
            <FaExchangeAlt size={18} />
            <span>Transfer Ownership</span>
          </button>
        )}

        {onDownload && (
          <button
            onClick={onDownload}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
          >
            <FaFileDownload size={18} />
            <span>Download PDF</span>
          </button>
        )}

        {onShare && (
          <button
            onClick={onShare}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition"
          >
            <FaShareAlt size={18} />
            <span>Share Deed</span>
          </button>
        )}

        {tokenId !== undefined && onViewBlockchain && (
          <button
            onClick={onViewBlockchain}
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200 rounded-lg font-medium transition"
          >
            <FaEye size={18} />
            <span>View on Blockchain</span>
          </button>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Deed Reference</div>
        <div className="font-mono text-sm text-gray-800 bg-gray-50 rounded-lg p-3 break-all">
          {deedNumber}
        </div>
      </div>
    </div>
  );
};

export default DeedActionBar;