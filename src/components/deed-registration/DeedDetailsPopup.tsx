import type { IDeed } from "../../types/responseDeed";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

const DeedDetailsPopup = ({
  isOpen,
  onClose,
  deed,
}: {
  isOpen: boolean;
  onClose: () => void;
  deed: (IDeed & { signatures?: ISignatures }) | null;
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

        <h2 className="text-2xl font-bold text-green-900 mb-4">Deed Details</h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">Deed ID:</span> {deed._id}
          </p>
          <p>
            <span className="font-semibold">Deed Number:</span> {deed.deedNumber}
          </p>
          <p>
            <span className="font-semibold">Land Type:</span> {deed.landType}
          </p>
          <p>
            <span className="font-semibold">Area:</span> {deed.landArea} m²
          </p>
          <p>
            <span className="font-semibold">Value:</span> ${deed.value}
          </p>

          <div>
            <span className="font-semibold">Owners:</span>
            <ul className="ml-4 list-disc">
              {(deed.owners || []).map((o, idx) => (
                <li key={idx}>
                  {o.address} ({o.share}%)
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold">Sides:</span>
            <ul className="ml-4 list-disc">
              {Object.entries(deed.sides || {}).map(([direction, value], idx) => (
                <li key={idx}>
                  {direction}: {value}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold">Location Points:</span>
            <ul className="ml-4 list-disc">
              {(deed.location || []).map((loc, idx) => (
                <li key={idx}>
                  ({loc.latitude}, {loc.longitude})
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="font-semibold">Signatures:</span>
            <ul className="ml-4 list-disc">
              <li>Surveyor: {deed.signatures?.surveyor ? "✅" : "❌"}</li>
              <li>Notary: {deed.signatures?.notary ? "✅" : "❌"}</li>
              <li>IVSL: {deed.signatures?.ivsl ? "✅" : "❌"}</li>
              <li>Fully Signed: {deed.signatures?.fully ? "✅" : "❌"}</li>
            </ul>
          </div>

          <p>
            <span className="font-semibold">Created:</span>{" "}
            {new Date(deed.timestamp).toLocaleString()}
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
