import { useLanguage } from "../../contexts/LanguageContext";

const BottomFooter = () => {
  const { t } = useLanguage();
  
  return (
    <div className="w-full border-t border-white/20 pt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white text-sm">
        <div className="text-center md:text-left">
          <p className="opacity-90">{t("footer.copyright")}</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-xs opacity-75">
          <span>{t("footer.blockchainPowered")}</span>
          <span className="hidden md:inline">•</span>
          <span>{t("footer.sriLankaPilot")}</span>
        </div>
      </div>
    </div>
  );
};

export default BottomFooter;
