import { FaRoute } from "react-icons/fa";
import type { Plan } from "../../types/plan";

interface BoundaryDeedsSectionProps {
  plan: Plan;
}

const BoundaryDeedsSection: React.FC<BoundaryDeedsSectionProps> = ({ plan }) => {
  if (!plan?.sides || Object.keys(plan.sides).length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-indigo-200/50 p-5 bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <FaRoute className="text-indigo-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Boundary Deeds</h2>
      </div>
      <div className="bg-white rounded-lg p-4">
        <ul className="space-y-3">
          {Object.entries(plan.sides).map(([direction, deedNum]) => (
            <li key={direction} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
              <span className="font-semibold text-gray-800">{direction}</span>
              <span className="text-gray-600">{deedNum || 'N/A'}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BoundaryDeedsSection;

