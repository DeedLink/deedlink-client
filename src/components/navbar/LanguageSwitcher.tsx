import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaGlobe, FaChevronDown } from "react-icons/fa";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode: "en" | "si") => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all duration-200 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 active:scale-95"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FaGlobe className="text-sm flex-shrink-0" />
        <span className="text-sm font-medium hidden sm:inline whitespace-nowrap">
          {currentLanguage.nativeName}
        </span>
        <span className="text-sm font-medium sm:hidden whitespace-nowrap">
          {currentLanguage.code.toUpperCase()}
        </span>
        <FaChevronDown 
          className={`text-xs transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as "en" | "si")}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-all duration-150 ${
                    language === lang.code
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                  aria-label={`Switch to ${lang.name}`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{lang.nativeName}</span>
                    <span className="text-xs text-gray-500">{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <svg
                      className="w-5 h-5 text-emerald-600 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

