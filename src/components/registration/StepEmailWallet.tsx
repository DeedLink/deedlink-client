import { FaEnvelope, FaWallet, FaCheckCircle } from "react-icons/fa";

type Props = {
  email: string;
  setEmail: (val: string) => void;
  walletConnected: boolean;
  setWalletConnected: (val: boolean) => void;
  canGoNext: () => boolean;
  nextStep: () => void;
};

const StepEmailWallet = ({
  email,
  setEmail,
  walletConnected,
  setWalletConnected,
  canGoNext,
  nextStep,
}: Props) => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FaEnvelope className="text-green-700" />
        <h2 className="text-lg font-bold text-[#00420A]">Email & Wallet</h2>
      </div>

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
      />

      <button
        onClick={() => setWalletConnected(true)}
        disabled={walletConnected}
        className={`w-full flex items-center justify-center gap-2 border border-green-600 py-2 rounded-lg transition cursor-pointer ${
          walletConnected
            ? "bg-green-600 text-white cursor-default"
            : "text-green-700 hover:bg-green-50"
        }`}
      >
        {walletConnected ? (
          <>
            <FaCheckCircle /> Wallet Connected
          </>
        ) : (
          <>
            <FaWallet /> Connect Wallet
          </>
        )}
      </button>

      <div className="flex justify-end mt-4">
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

export default StepEmailWallet;
