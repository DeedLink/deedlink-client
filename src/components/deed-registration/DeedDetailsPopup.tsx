import type { RequestRegisteringDeed } from "../../types/types";

const DeedDetailsPopup = ({
  isOpen,
  onClose,
  deed,
}: {
  isOpen: boolean;
  onClose: () => void;
  deed: RequestRegisteringDeed | null;
}) => {
  if (!isOpen || !deed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-green-900 mb-4">
          Deed Details
        </h2>

        <div className="space-y-3 text-gray-700">
          <p><span className="font-semibold">Deed ID:</span> {deed.id}</p>
          <p><span className="font-semibold">Owner:</span> {deed.owner}</p>
          <p><span className="font-semibold">Address:</span> {deed.address}</p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`font-bold ${
                deed.status === "Pending"
                  ? "text-yellow-600"
                  : deed.status === "Approved"
                  ? "text-blue-600"
                  : deed.status === "Minted"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {deed.status}
            </span>
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeedDetailsPopup;
