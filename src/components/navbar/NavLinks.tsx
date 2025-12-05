import { useWallet } from "../../contexts/WalletContext";
import { compressAddress } from "../../utils/format";
import { useLanguage } from "../../contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import { useLogin } from "../../contexts/LoginContext";
import { FaUser, FaWallet } from "react-icons/fa";

interface NavLinksProps {
  links: { label: string; href: string }[];
  onClick?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ links, onClick, isMobile }) => {
  const { account, connect, disconnect } = useWallet();
  const { user } = useLogin();
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname===href;
  };

  return (
    <div
      className={`${
        isMobile
          ? "flex flex-col items-center gap-4 py-4"
          : "hidden lg:flex gap-8 font-medium text-white items-center"
      }`}
    >
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.label}
            to={link.href}
            onClick={onClick}
            className={`relative group ${
              isMobile
                ? `w-full text-center py-2 rounded-lg transition ${
                    active
                      ? "bg-white/20 text-yellow-300"
                      : "hover:bg-white/10"
                  }`
                : ""
            }`}
          >
            <span
              className={`transition-colors duration-300 ${
                active
                  ? "text-yellow-300 font-semibold"
                  : "group-hover:text-yellow-300"
              }`}
            >
              {link.label}
            </span>
            {!isMobile && (
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-300 transition-all duration-300 ${
                  active ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            )}
          </Link>
        );
      })}
      {account ? (
        <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full gap-3' : 'gap-2'}`}>
          {user?.name && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg border border-white/20 transition-all duration-200">
              <FaUser className="text-sm text-white flex-shrink-0" />
              <span className="text-sm text-white font-medium whitespace-nowrap hidden xl:inline">
                {user.name}
              </span>
              <span className="text-xs text-white font-medium whitespace-nowrap xl:hidden">
                {user.name.split(' ')[0]}
              </span>
            </div>
          )}
          <button
            onClick={disconnect}
            className={`group flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium cursor-pointer transition-all duration-200 whitespace-nowrap ${isMobile ? 'w-full justify-center' : ''}`}
            title={compressAddress(account)}
          >
            <FaWallet className="text-sm flex-shrink-0" />
            <span className="block group-hover:hidden text-sm">
              {compressAddress(account)}
            </span>
            <span className="hidden group-hover:block text-sm">
              {t("nav.disconnect")}
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className={`px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium cursor-pointer transition-all duration-200 ${isMobile ? 'w-full' : ''}`}
        >
          {t("nav.connectWallet")}
        </button>
      )}
    </div>
  );
};

export default NavLinks;
