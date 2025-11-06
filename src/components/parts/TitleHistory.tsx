import { FaLayerGroup } from "react-icons/fa";
import { formatCurrency, shortAddress } from "../../utils/format";
import type { Title } from "../../types/title";

const formatDateWithTime = (date: Date | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
    return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
};

export const TitleHistory=({tnx}: {tnx: Title[]})=>{
    return(
        <section className="rounded-xl border border-black/5 p-4">
        <div className="flex items-center gap-2 mb-3">
            <FaLayerGroup className="text-green-700" />
            <h4 className="font-semibold">Title History</h4>
        </div>
        <div className="space-y-3 overflow-auto max-h-64 pr-1 py-1">
            {(!tnx || tnx.length === 0) && <p className="text-gray-500 text-sm">No transfers recorded.</p>}
            {tnx?.map((t, idx) => (
            <div key={t._id || idx} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                <div className="font-medium">{shortAddress(t.from)} → {shortAddress(t.to)}</div>
                { t.date && <div className="text-gray-500 text-xs">{formatDateWithTime(new Date(t.date).getTime())}</div> }
                </div>
                <div className="text-right">
                <div className="text-gray-700">{t.share}%</div>
                {t.amount > 0 && <div className="text-gray-500 text-xs">{formatCurrency(t.amount, "ETH")}</div>}
                </div>
            </div>
            ))}
        </div>
        </section>
    )
}

export default TitleHistory;