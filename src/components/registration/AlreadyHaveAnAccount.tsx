import { FaUserCircle } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const AlreadyHaveAnAccount = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-center">
      <div className="flex items-start gap-3">
        <FaUserCircle className="text-[#00420A] text-5xl" />
        <h2 className="text-[#00420A] text-lg font-semibold leading-snug">
          {t("registration.alreadyHaveAccount")}
        </h2>
      </div>
    </div>
  );
};

export default AlreadyHaveAnAccount;
