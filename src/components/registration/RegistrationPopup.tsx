import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSignup } from "../../contexts/SignupContext";
import StepEmailWallet from "./StepEmailWallet";
import StepKYC from "./StepKYC";
import StepVerification from "./StepVerification";
import StepPassword from "./StepPassword";
import StepProgressBar from "../step-progress-bar/StepProgressBar";

const RegistrationPopup = () => {
  const { isOpen, closeSignup } = useSignup();
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [nic, setNic] = useState("");
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const canGoNext = () => {
    if (step === 1) return email.includes("@") && walletConnected;
    if (step === 2) return nic.trim().length >= 6;
    if (step === 3) return key.trim().length > 0;
    return false;
  };

  const handleFinish = () => {
    if (password === confirm && password.length >= 6) {
      setDone(true);
    } else {
      alert("Passwords must match and be at least 6 characters.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={closeSignup}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={closeSignup}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={20} />
        </button>

        <StepProgressBar currentStep={step} steps={4} />

        {step === 1 && (
          <StepEmailWallet
            email={email}
            setEmail={setEmail}
            walletConnected={walletConnected}
            setWalletConnected={setWalletConnected}
            canGoNext={canGoNext}
            nextStep={nextStep}
          />
        )}

        {step === 2 && (
          <StepKYC
            nic={nic}
            setNic={setNic}
            canGoNext={canGoNext}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {step === 3 && (
          <StepVerification
            keyValue={key}
            setKey={setKey}
            canGoNext={canGoNext}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {step === 4 && (
          <StepPassword
            password={password}
            setPassword={setPassword}
            confirm={confirm}
            setConfirm={setConfirm}
            handleFinish={handleFinish}
            done={done}
            prevStep={prevStep}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationPopup;
