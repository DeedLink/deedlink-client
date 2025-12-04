import {
  FaLayerGroup,
  FaGift,
  FaHandshake,
  FaExchangeAlt,
  FaStore,
  FaPlayCircle,
  FaLock,
  FaSitemap,
  FaUser,
} from "react-icons/fa";
import { useState, useMemo } from "react";
import { formatCurrency, shortAddress } from "../../utils/format";
import type { Title } from "../../types/title";
import type { JSX } from "react/jsx-runtime";
import { useLanguage } from "../../contexts/LanguageContext";

const formatDateWithTime = (date: Date | number) => {
  const dateObj = typeof date === "number" ? new Date(date) : new Date(date);
  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const typeMap: Record<
  Title["type"],
  { icon: JSX.Element; label: string; color: string }
> = {
  gift: {
    icon: <FaGift className="text-pink-500" />,
    label: "Gift Transfer",
    color: "text-pink-600",
  },
  open_market: {
    icon: <FaStore className="text-indigo-500" />,
    label: "Open Market Listing",
    color: "text-indigo-600",
  },
  direct_transfer: {
    icon: <FaExchangeAlt className="text-green-500" />,
    label: "Direct Transfer",
    color: "text-green-600",
  },
  closed: {
    icon: <FaLock className="text-gray-500" />,
    label: "Closed Deal",
    color: "text-gray-600",
  },
  init: {
    icon: <FaPlayCircle className="text-yellow-500" />,
    label: "Initialization",
    color: "text-yellow-600",
  },
  sale_transfer: {
    icon: <FaHandshake className="text-blue-500" />,
    label: "Sale Transfer",
    color: "text-blue-600",
  },
  escrow_sale: {
    icon: <FaLayerGroup className="text-teal-500" />,
    label: "Escrow Sale",
    color: "text-teal-600",
  },
  defractionalize: {
    icon: <FaSitemap className="text-purple-500" />,
    label: "Defractionalization",
    color: "text-purple-600",
  },
  escrow_cancel: {
    icon: <FaLock className="text-red-500" />,
    label: "Escrow Cancelled",
    color: "text-red-600",
  },
};

const Modal = ({
  open,
  onClose,
  children,
  header,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
}) => {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          {header || <h3 className="text-lg font-semibold">{t("titleHistory.fullTitleHistory")}</h3>}
          <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">
            ✕
          </button>
        </div>
        <div className="overflow-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

interface OwnerNode {
  address: string;
  share: number;
  children: OwnerNode[];
  transaction?: Title;
  level: number;
}

export const TitleHistory = ({ tnx }: { tnx: Title[] }) => {
  const { t } = useLanguage();
  const [openModal, setOpenModal] = useState(false);
  const [showTreeView, setShowTreeView] = useState(false);

  const buildOwnershipTree = useMemo(() => {
    if (!tnx || tnx.length === 0) return null;

    const sortedTxs = [...tnx].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return dateA - dateB;
    });

    const addressToNodes = new Map<string, OwnerNode[]>();
    let rootNode: OwnerNode | null = null;

    for (const tx of sortedTxs) {
      if (tx.status !== "completed") continue;

      if (tx.type === "init" && tx.to) {
        const address = tx.to.toLowerCase();
        rootNode = {
          address,
          share: 100,
          children: [],
          transaction: tx,
          level: 0,
        };
        addressToNodes.set(address, [rootNode]);
      } else if (tx.from && tx.to && tx.share && tx.share > 0 && tx.type !== "open_market") {
        const fromAddress = tx.from.toLowerCase();
        const toAddress = tx.to.toLowerCase();
        const share = tx.share;

        const fromNodes = addressToNodes.get(fromAddress) || [];
        
        for (const fromNode of fromNodes) {
          if (fromNode.share >= share) {
            fromNode.share = Math.max(0, fromNode.share - share);

            const toNode: OwnerNode = {
              address: toAddress,
              share: share,
              children: [],
              transaction: tx,
              level: fromNode.level + 1,
            };

            if (!addressToNodes.has(toAddress)) {
              addressToNodes.set(toAddress, []);
            }
            addressToNodes.get(toAddress)!.push(toNode);
            fromNode.children.push(toNode);
            break;
          }
        }
      }
    }

    const hasMultipleOwners = rootNode && (rootNode.children.length > 0 || addressToNodes.size > 1);
    return hasMultipleOwners ? rootNode : null;
  }, [tnx]);

  const renderTreeNode = (node: OwnerNode, isLast: boolean, prefix: string = ""): JSX.Element => {
    const hasChildren = node.children.length > 0;
    const connector = isLast ? "└─ " : "├─ ";
    const nextPrefix = isLast ? "   " : "│  ";

    return (
      <div key={`${node.address}-${node.level}-${node.transaction?._id || ''}`} className="my-2">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-gray-400 font-mono text-xs whitespace-pre select-none">{prefix + connector}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <FaUser className="text-blue-500 text-xs flex-shrink-0" />
              <span className="font-medium text-gray-900 break-all">{shortAddress(node.address)}</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold whitespace-nowrap">
                {node.share.toFixed(4)}%
              </span>
            </div>
            {node.transaction && (
              <div className="ml-6 mt-1 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeMap[node.transaction.type] && (
                    <span className={`flex items-center gap-1 ${typeMap[node.transaction.type].color}`}>
                      {typeMap[node.transaction.type].icon}
                      <span>{typeMap[node.transaction.type].label}</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400">
                    {formatDateWithTime(new Date(node.transaction.date || node.transaction.createdAt || 0).getTime())}
                  </span>
                  {node.transaction.amount > 0 && (
                    <span className="ml-2 text-gray-600">
                      • {formatCurrency(node.transaction.amount, "ETH")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {hasChildren && (
          <div className="ml-4">
            {node.children.map((child, idx) =>
              renderTreeNode(child, idx === node.children.length - 1, prefix + nextPrefix)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRows = (list: Title[]) =>
    list.map((t, idx) => {
      const typeInfo = typeMap[t.type];
      return (
        <div
          key={t._id || idx}
          className="flex items-center justify-between text-sm border-b border-gray-100 pb-2"
        >
          <div className="flex-1">
            <div className="font-medium text-black">
              {shortAddress(t.from)} → {shortAddress(t.to)}
            </div>
            {t.date && (
              <div className="text-gray-500 text-xs">
                {formatDateWithTime(new Date(t.date).getTime())}
              </div>
            )}
            {typeInfo && (
              <div className={`flex items-center gap-1 mt-1 ${typeInfo.color}`}>
                {typeInfo.icon}
                <span className="text-xs font-medium">{typeInfo.label}</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-gray-700">{t.share}%</div>
            {t.amount > 0 && (
              <div className="text-gray-500 text-xs">
                {formatCurrency(t.amount, "ETH")}
              </div>
            )}
            <div
              className={`text-[10px] mt-1 ${
                t.status === "completed"
                  ? "text-green-600"
                  : t.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
            </div>
          </div>
        </div>
      );
    });

  return (
    <>
      <section className="rounded-xl border border-black/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaLayerGroup className="text-green-700" />
          <h4 className="font-semibold text-black">{t("titleHistory.titleHistory")}</h4>
        </div>

        <div className="space-y-3 overflow-auto max-h-64 pr-1 py-1">
          {(!tnx || tnx.length === 0) && (
            <p className="text-gray-500 text-sm">{t("titleHistory.noTransfersRecorded")}</p>
          )}
          {renderRows(tnx.slice(0, 5))}
        </div>

        {tnx.length > 5 && (
          <button
            onClick={() => setOpenModal(true)}
            className="w-full mt-3 py-2 text-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View Full History
          </button>
        )}
      </section>

      <Modal 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        header={
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">{t("titleHistory.fullTitleHistory")}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTreeView(!showTreeView)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  showTreeView
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaSitemap className="inline mr-1" />
                {showTreeView ? "List View" : "Tree View"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">

          {showTreeView && buildOwnershipTree ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FaSitemap className="text-blue-600" />
                <h4 className="font-semibold text-gray-900">{t("titleHistory.fractionalOwnershipTree")}</h4>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 overflow-x-auto max-h-[60vh] overflow-y-auto">
                <div className="text-xs text-gray-500 mb-3 pb-2 border-b border-gray-200">
                  This tree shows how ownership has been distributed through transfers. The root represents the initial owner, and branches show fractional ownership transfers.
                </div>
                {renderTreeNode(buildOwnershipTree, true)}
              </div>
            </div>
          ) : null}

          {!showTreeView && (
            <div className="space-y-3">{renderRows(tnx)}</div>
          )}

          {showTreeView && !buildOwnershipTree && (
            <div className="text-center py-8 text-gray-500">
              <p>No ownership tree available. Ownership may not be fractionalized yet.</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default TitleHistory;
