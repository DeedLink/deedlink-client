import { useLanguage } from "../../contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1 border border-white/20">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === "en"
            ? "bg-white text-[#00420A]"
            : "text-white hover:bg-white/10"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("si")}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === "si"
            ? "bg-white text-[#00420A]"
            : "text-white hover:bg-white/10"
        }`}
      >
        SI
      </button>
    </div>
  );
};

export default LanguageSwitcher;

