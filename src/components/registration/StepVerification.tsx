import { FaClock } from "react-icons/fa";

type Props = {
  keyValue: string;
  setKey: (val: string) => void;
  canGoNext: () => boolean;
  nextStep: () => void;
  prevStep: () => void;
};

const StepVerification = ({ keyValue, setKey, canGoNext, nextStep, prevStep }: Props) => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FaClock className="text-green-700" />
        <h2 className="text-lg font-bold text-[#00420A]">KYC in Progress</h2>
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Please wait while we verify your documents. A key will be sent to your email once verified.
      </p>

      <input
        type="text"
        placeholder="Enter Verification Key"
        value={keyValue}
        onChange={(e) => setKey(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
      />

      <div className="flex justify-between mt-4">
        <button
          onClick={prevStep}
          className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canGoNext()}
          className={`px-4 py-2 rounded-lg ${
            canGoNext()
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepVerification;
