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
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded border font-medium transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed ${color}`}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

export default ActionButton;