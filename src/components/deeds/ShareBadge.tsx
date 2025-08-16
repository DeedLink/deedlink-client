import { percentBarClass } from "../../utils/format";

const ShareBadge = ({ share }: { share: number }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 bg-gray-200 rounded">
        <div className={`h-2 rounded ${percentBarClass(share)}`} style={{ width: `${share}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700">{share}%</span>
    </div>
  );
};

export default ShareBadge;
