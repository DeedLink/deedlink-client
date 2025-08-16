import { shortAddress } from "../../utils/format";

const colorPool = [
  "bg-emerald-100 text-emerald-800",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
];

const OwnerChips = ({ owners }: { owners: { address: string; share: number }[] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {owners.map((o, i) => (
        <span
          key={`${o.address}-${i}`}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border border-black/5 ${colorPool[i % colorPool.length]}`}
          title={`${o.address} • ${o.share}%`}
        >
          {shortAddress(o.address)} • {o.share}%
        </span>
      ))}
    </div>
  );
};

export default OwnerChips;
