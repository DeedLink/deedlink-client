import { useState, useMemo } from "react";
import logo from "../../assets/images/logo/main1.jpg";
import { about } from "../../constants/const";
import { HiMenu, HiX } from "react-icons/hi";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import { useLogin } from "../../contexts/LoginContext";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useLogin();
  const { t } = useLanguage();

  const navLinks = useMemo(() => [
    { label: t("nav.home"), href: "/" , protected: false},
    { label: t("nav.about"), href: "/about", protected: false },
    { label: t("nav.deedsRegistration"), href: "/deeds-registration", protected: true },
    { label: t("nav.deeds"), href: "/deeds", protected: true },
    { label: t("nav.market"), href: "/market", protected: true }
  ], [t]);

  return (
    <nav className="bg-[#00420A]/40 backdrop-blur-xl w-full fixed top-0 left-0 z-50 shadow-md">
      <div className="max-w-boundary mx-auto px-4 sm:px-6 lg:px-10 h-20 flex justify-between items-center overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-4 font-extrabold text-white text-base sm:text-lg min-w-0 flex-shrink">
          <img
            src={logo}
            alt="logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/30 flex-shrink-0"
          />
          <span className="truncate">{about.title}</span>
        </div>

      <div className="cursor-pointer flex gap-2 sm:gap-4 lg:gap-8 items-center justify-center flex-shrink-0">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <div className="hidden lg:block">
            <NavLinks links={user?.kycStatus==="verified"? navLinks :navLinks.filter((link)=>!link.protected)} />
          </div>
      </div>

        <button
          className="lg:hidden text-white text-2xl sm:text-3xl flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        links={user?.kycStatus==="verified"? navLinks :navLinks.filter((link)=>!link.protected)}
        onClose={() => setMenuOpen(false)}
      />
    </nav>
  );
};

export default NavBar;
