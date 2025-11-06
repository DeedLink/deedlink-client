import {
  FaLayerGroup,
  FaGift,
  FaHandshake,
  FaExchangeAlt,
  FaStore,
  FaPlayCircle,
  FaLock,
} from "react-icons/fa";
import { formatCurrency, shortAddress } from "../../utils/format";
import type { Title } from "../../types/title";
import type { JSX } from "react/jsx-runtime";

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
};

export const TitleHistory = ({ tnx }: { tnx: Title[] }) => {
  return (
    <section className="rounded-xl border border-black/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FaLayerGroup className="text-green-700" />
        <h4 className="font-semibold text-black">Title History</h4>
      </div>

      <div className="space-y-3 overflow-auto max-h-64 pr-1 py-1">
        {(!tnx || tnx.length === 0) && (
          <p className="text-gray-500 text-sm">No transfers recorded.</p>
        )}

        {tnx?.map((t, idx) => {
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
        })}
      </div>
    </section>
  );
};

export default TitleHistory;
