import { useEffect, useState } from "react";
import {
  FaEdit,
  FaExchangeAlt,
  FaFileDownload,
  FaShareAlt,
  FaEye,
  FaKey,
  FaHome,
  FaLock,
  FaGifts
} from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import ActionButton from "./actionButton";
import RentUI from "../parts/RentUI";
import LastWillUI from "../parts/LastWillUI";
import { getTransactionsByDeedId } from "../../api/api";
import { useWallet } from "../../contexts/WalletContext";
import { hasFullOwnership, isPropertyFractionalized } from "../../web3.0/contractService";

interface DeedActionBarProps {
  deedNumber: string;
  tokenId?: number;
  deedId?: string;
  numberOfFT: number;
  certificateExists?: boolean;
  actionHappened?: boolean;

  onTransfer?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onViewBlockchain?: () => void;
  onFractioning: () => void;
  onDirectTransfer: () => void;
  onSaleEscrow: () => void;
  onRent: () => void;
  onPowerOfAttorney: () => void;
  onOpenMarket: () => void;
  onLastWill: () => void;
  onCancelCertificate?: () => void;
}

const DeedActionBar = ({
  deedNumber,
  tokenId,
  deedId,
  actionHappened,
  onTransfer,
  onDirectTransfer,
  onSaleEscrow,
  onDownload,
  onShare,
  onViewBlockchain,
  onFractioning,
  onRent,
  onPowerOfAttorney,
  onOpenMarket,
  numberOfFT,
  onLastWill,
  certificateExists,
  onCancelCertificate,
}: DeedActionBarProps) => {
  const [state, setState] = useState<"pending" | "completed" | "failed">("completed");
  const [titles, setTitles] = useState<any[]>([]);
  const [canSetRent, setCanSetRent] = useState(true);
  const [canSetPoA, setCanSetPoA] = useState(true);
  const { account } = useWallet();

  const getTransactions = async () => {
    if (deedId) {
      const tnx = await getTransactionsByDeedId(deedId);
      if (tnx && tnx.length) {
        const sortedTnx = tnx.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTitles(sortedTnx);
      }
    } else {
      console.log("Deed ID not found", "error");
    }
  };

  useEffect(() => {
    getTransactions();
  }, [deedId, actionHappened]);

  useEffect(() => {
    if (titles[0]) {
      setState(titles[0].status);
    }
  }, [titles, actionHappened]);

  useEffect(() => {
    const checkOwnership = async () => {
      if (!tokenId || !account) {
        setCanSetRent(true);
        setCanSetPoA(true);
        return;
      }

      try {
        const isFractionalized = await isPropertyFractionalized(tokenId);
        if (isFractionalized) {
          const hasFull = await hasFullOwnership(tokenId, account);
          setCanSetRent(hasFull);
          setCanSetPoA(hasFull);
        } else {
          setCanSetRent(true);
          setCanSetPoA(true);
        }
      } catch (error) {
        console.error("Error checking ownership:", error);
        setCanSetRent(false);
        setCanSetPoA(false);
      }
    };

    checkOwnership();
  }, [tokenId, account]);

  const isLocked = state === "pending";

  return (
    <div className="relative w-full max-w-[460px] md:max-w-full">
      <div
        className={`rounded-lg border border-gray-200 bg-white shadow-sm p-6 h-full transition-all duration-300 ${
          isLocked ? "opacity-50 blur-[1px] pointer-events-none" : ""
        }`}
      >
        <h3 className="font-semibold text-gray-900 mb-6 text-base">Quick Actions</h3>

        <div className="flex flex-col gap-2">
          <ActionButton
            icon={<FaEdit size={16} />}
            label="Create Fractions"
            onClick={onFractioning}
            color={
              numberOfFT !== 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 hidden"
                : "bg-gray-800 hover:bg-gray-900 text-white border-gray-800 hidden"
            }
            disabled={numberOfFT !== 0}
          />

          {onTransfer && 
            <ActionButton 
              icon={<FaExchangeAlt size={16} />} 
              label="Transfer the Deed" 
              onClick={onTransfer} 
              color="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hidden"
            />
          }
          {onDirectTransfer && 
            <ActionButton 
              icon={<FaExchangeAlt size={16} />} 
              label="Gift Your Deed" 
              onClick={onDirectTransfer} 
              color="bg-white hover:bg-gray-50 text-gray-700 border-gray-300" 
            />
          }
          {onSaleEscrow && <ActionButton icon={<FaExchangeAlt size={16} />} label="Sell via Escrow" onClick={onSaleEscrow} color="bg-white hover:bg-gray-50 text-gray-700 border-gray-300" />}
          {onRent && (
            <ActionButton 
              icon={<FaHome size={16} />} 
              label="Rent the Deed" 
              onClick={onRent} 
              color={canSetRent ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"}
              disabled={!canSetRent}
            />
          )}
          {onPowerOfAttorney && (
            <ActionButton 
              icon={<FaKey size={16} />} 
              label="Grant Power of Attorney" 
              onClick={onPowerOfAttorney} 
              color={canSetPoA ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hidden" : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 hidden"}
              disabled={!canSetPoA}
            />
          )}
          {onOpenMarket && <ActionButton icon={<FaShop size={16} />} label="Add to Open Market" onClick={onOpenMarket} color="bg-white hover:bg-gray-50 text-gray-700 border-gray-300" />}

          {certificateExists
            ? onCancelCertificate && <ActionButton icon={<FaGifts size={16} />} label="Cancel Certificate" onClick={onCancelCertificate} color="bg-red-600 hover:bg-red-700 text-white border-red-600" />
            : onLastWill && <ActionButton icon={<FaGifts size={16} />} label="Create Last Will" onClick={onLastWill} color="bg-white hover:bg-gray-50 text-gray-700 border-gray-300" />
          }

          {onDownload && <ActionButton icon={<FaFileDownload size={16} />} label="Download PDF" onClick={onDownload} color="bg-white hover:bg-gray-50 text-gray-700 border-gray-300" />}
          {onShare && <ActionButton icon={<FaShareAlt size={16} />} label="Share Deed" onClick={onShare} color="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hidden" />}
          {tokenId !== undefined && onViewBlockchain && <ActionButton icon={<FaEye size={16} />} label="View on Blockchain" onClick={onViewBlockchain} color="bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200 hidden" />}
        </div>

        {tokenId && <div className="mt-6 pt-6 border-t border-gray-200"><RentUI tokenId={tokenId} /></div>}
        {tokenId && <div className="mt-6 pt-6 border-t border-gray-200"><LastWillUI tokenId={tokenId} /></div>}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Deed Reference</div>
          <div className="font-mono text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 break-all border border-gray-200">{deedNumber}</div>
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
          <FaLock size={32} className="text-gray-400 mb-3" />
          <span className="text-gray-600 font-medium text-sm">Actions Locked</span>
          <span className="text-gray-500 text-xs mt-1">Pending Transaction</span>
        </div>
      )}
    </div>
  );
};

export default DeedActionBar;
