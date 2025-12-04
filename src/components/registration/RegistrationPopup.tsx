import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSignup } from "../../contexts/SignupContext";
import StepEmailWallet from "./StepEmailWallet";
import StepKYC from "./StepKYC";
import StepVerification from "./StepVerification";
import StepPassword from "./StepPassword";
import StepProgressBar from "../step-progress-bar/StepProgressBar";
import { useWallet } from "../../contexts/WalletContext";
import { getUserPasswordState, getUserState, registerUser, setPasswordForUser, uploadKYC } from "../../api/api";
import AleadyHaveAnAccount from "./AlreadyHaveAnAccount";
import { getSignature } from "../../web3.0/wallet";
import { isValidEmail, isValidNIC, isValidPassword } from "../../utils/functions";
import { useToast } from "../../contexts/ToastContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useLanguage } from "../../contexts/LanguageContext";

const RegistrationPopup = () => {
  const { isOpen, closeSignup } = useSignup();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [ name, setName ] = useState("");
  const [nic, setNic] = useState("");
  const [nicFrontSide, setNicFrontSide] = useState<File | null>(null);
  const [nicBackSide, setNicBackSide] = useState<File | null>(null);
  const [userFrontImage, setUserFrontSide] = useState<File | null>(null);
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const { account, connect } = useWallet();
  const [userState, setUserState] = useState<string | null>(null);
  const [userPasswordState, setUserPasswordState] = useState<"set" | "unset" | null>(null); 
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loadingInPopup, setLoadingInPopup] = useState(false);

  const getUserStatus = async () => {
    if (account) {
      setLoadingInPopup(true);
      const userStatus = await getUserState(account);
      if (!userStatus) return;

      if ("kycStatus" in userStatus) {
        setUserState(userStatus.kycStatus);
      } else if ("status" in userStatus && userStatus.status === "not_registered") {
        setUserState("not_registered");
      }
    }
    setLoadingInPopup(false);
  };

  const getUserPasswordStatus = async () => {
    if (account) {
      setLoadingInPopup(true);
      const userPasswordStatus = await getUserPasswordState(account);
      console.log("User Password Status: ", userPasswordStatus.passwordStatus);
      if (!userPasswordStatus) return;

      if ("passwordStatus" in userPasswordStatus) {
        setUserPasswordState(userPasswordStatus.passwordStatus);
      }
    }
    setLoadingInPopup(false);
  };

  useEffect(()=>{
    if(isOpen && account){
      getUserStatus();
      getUserPasswordStatus();
      if(userState==="verified" && userPasswordState==="set"){
        setStep(4);
      } else if(userState==="verified" && userPasswordState!="set"){
        setStep(3);
      } else if(userState==="pending"){
        setStep(3);
      } else {
        setStep(1);
      }
    }
  },[isOpen, account]);

    useEffect(()=>{
    if(isOpen && account){
      if(userState==="verified" && userPasswordState==="set"){
        setStep(4);
      } else if(userState==="verified" && userPasswordState!="set"){
        setStep(3);
      } else if(userState==="pending"){
        setStep(3);
      } else {
        setStep(1);
      }
    }
  },[isOpen, account, userState, userPasswordState]);

  useEffect(() => {
    console.log(userState);
    if(userState==="pending"){
      setStep(3);
    }
  }, [userState, isOpen]);

  const submitForKYC=async()=>{
    // console.log({
    //   "email": email,
    //   "nic": nic,
    //   "nicFrontSide": nicFrontSide?.name,
    //   "nicBackSide": nicBackSide?.name,
    //   "userFrontImage": userFrontImage?.name,
    //   "key": key,
    //   "password": password,
    //   "account": account
    // });
    const submissionStatus = await registerUser({
      "name": name,
      "email": email,
      "nic": nic,
      "walletAddress": account || "",
      "signature": await getSignature(`Registering wallet: ${account || ""}`),
      "role": "user"
    });

    if(!submissionStatus || !submissionStatus.user){
      showToast(t("registration.kycSubmissionFailed"), "error");
      return;
    }

    const res = await uploadKYC(submissionStatus.user._id, nic, nicFrontSide, nicBackSide, userFrontImage);
    console.log(res, submissionStatus);
  }

  if (!isOpen) return null;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const canGoNext = () => {
    if (step === 1) return isValidEmail(email) && account != null;
    if (step === 2) return isValidNIC(nic) && nicFrontSide != null && nicBackSide!=null && userFrontImage!=null;
    if (step === 3) return key.trim().length > 0;
    return false;
  };

  const handleFinish = async () => {
    if (password === confirm && isValidPassword(password)) {
      try {
        await setPasswordForUser({
          "email": email,
          "walletAddress": account || "",
          "signature": await getSignature(`Setting password for wallet: ${account || ""}`),
          "newPassword": password,
          "confirmPassword": confirm,
          "otp": key
        });
        showToast(t("registration.passwordSetSuccess"), "success");
        setDone(true);
      } catch (err) {
        console.error(err);
        showToast(t("registration.passwordSetFailed"), "error");
      }
    } else {
      showToast(t("registration.passwordsMismatch"), "error");
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={closeSignup}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {
          loadingInPopup && (
          <div className="absolute w-full h-full bg-black/40 backdrop-blur-xs z-50 inset-0 cursor-not-allowed">
            <div className="z-[9999] flex items-center justify-center w-full h-full">
              <div className="animate-spin text-4xl text-green-400">
                <AiOutlineLoading3Quarters />
              </div>
            </div>
          </div>
          )
        }
        <button
          onClick={closeSignup}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <IoClose size={20} />
        </button>

        {
          (userState != "verified" || userPasswordState!="set") &&
            <StepProgressBar currentStep={step} steps={4} />
        }

        {(step === 1 && userState != "verified") && (
          <StepEmailWallet
            email={email}
            name={name}
            setName={setName}
            setEmail={setEmail}
            walletConnected={account!=null}
            setWalletConnected={connect}
            canGoNext={canGoNext}
            nextStep={nextStep}
          />
        )}

        {(step === 2 && userState != "verified") && (
          <StepKYC
            setNicFrontSide={setNicFrontSide}
            setNicBackSide={setNicBackSide}
            setUserFrontImage={setUserFrontSide}
            nicFrontSide={nicFrontSide}
            nicBackSide={nicBackSide}
            userFrontImage={userFrontImage}
            nic={nic}
            setNic={setNic}
            canGoNext={canGoNext}
            nextStep={nextStep}
            prevStep={prevStep}
            submitForKYC={submitForKYC}
          />
        )}

        {(step === 3 && (userState != "verified" || userPasswordState != "set")) && (
          <StepVerification
            keyValue={key}
            setKey={setKey}
            canGoNext={canGoNext}
            nextStep={nextStep}
            prevStep={prevStep}
            canBack={userState!="pending"}
          />
        )}

        {(step === 4 && (userState != "verified" || userPasswordState != "set")) && (
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

        {((userState === "verified" && userPasswordState === "set") &&
          <AleadyHaveAnAccount/>
        )}
      </div>
    </div>
  );
};

export default RegistrationPopup;
