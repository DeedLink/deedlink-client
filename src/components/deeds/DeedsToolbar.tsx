import { useMemo } from "react";
import { FaSearch, FaSortAmountDown, FaSync } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

type SortKey = "newest" | "value" | "area" | "share";

export interface ToolbarProps {
  query: string;
  setQuery: (v: string) => void;
  sortBy: SortKey;
  setSortBy: (s: SortKey) => void;
  onReset?: () => void;
  total: number;
}

const DeedsToolbar = ({ query, setQuery, sortBy, setSortBy, onReset, total }: ToolbarProps) => {
  const { t } = useLanguage();
  const options = useMemo(
    () => [
      { key: "newest", label: t("deedsPage.sortNewest") },
      { key: "value", label: t("deedsPage.sortValue") },
      { key: "area", label: t("deedsPage.sortArea") },
      { key: "share", label: t("deedsPage.sortShare") },
    ],
    [t]
  );

  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
      <div className="flex items-center gap-2 w-full md:max-w-md">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("deedsPage.searchPlaceholder")}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
          />
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-[#00420A]"
            title="Reset filters"
          >
            <FaSync /> {t("deedsPage.reset")}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <FaSortAmountDown className="text-green-700" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
        >
          {options.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 ml-2">{total} {total === 1 ? t("deedsPage.deedCount") : t("deedsPage.deedCountPlural")}</span>
      </div>
    </div>
  );
};

export default DeedsToolbar;
