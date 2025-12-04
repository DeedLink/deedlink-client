import { FaEnvelope, FaWallet, FaCheckCircle } from "react-icons/fa";
import { useWallet } from "../../contexts/WalletContext";
import { compressAddress } from "../../utils/format";
import { useLanguage } from "../../contexts/LanguageContext";

type Props = {
  email: string;
  name: string;
  setEmail: (val: string) => void;
  setName: (val: string) => void;
  walletConnected: boolean;
  setWalletConnected: (val: boolean) => void;
  canGoNext: () => boolean;
  nextStep: () => void;
};

const StepEmailWallet = ({
  email,
  name,
  setName,
  setEmail,
  walletConnected,
  setWalletConnected,
  canGoNext,
  nextStep,
}: Props) => {
  const { account } = useWallet();
  const { t } = useLanguage();

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FaEnvelope className="text-green-700" />
        <h2 className="text-lg font-bold text-[#00420A]">{t("registration.step1Title")}</h2>
      </div>

      <input
        type="email"
        placeholder={t("registration.emailAddress")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
      />
      <input
        type="text"
        placeholder={t("registration.fullName")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
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
        {walletConnected && account ? (
          <>
            <FaCheckCircle /> {compressAddress(account)}
          </>
        ) : (
          <>
            <FaWallet /> {t("registration.connectWallet")}
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
          {t("registration.next")}
        </button>
      </div>
    </div>
  );
};

export default StepEmailWallet;
