import { FaIdCard } from "react-icons/fa";

type Props = {
  nic: string;
  setNic: (val: string) => void;
  canGoNext: () => boolean;
  nextStep: () => void;
  prevStep: () => void;
};

const StepKYC = ({ nic, setNic, canGoNext, nextStep, prevStep }: Props) => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FaIdCard className="text-green-700" />
        <h2 className="text-lg font-bold text-[#00420A]">KYC Verification</h2>
      </div>

      <input
        type="text"
        placeholder="NIC Number"
        value={nic}
        onChange={(e) => setNic(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
      />
      <div className="space-y-2">
        <input type="file" accept="image/*" className="w-full border border-gray-300 rounded p-2 text-[#00420A]" />
        <input type="file" accept="image/*" className="w-full border border-gray-300 rounded p-2 text-[#00420A]" />
        <input type="file" accept="video/*,image/*" className="w-full border border-gray-300 rounded p-2 text-[#00420A]" />
      </div>

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

export default StepKYC;
