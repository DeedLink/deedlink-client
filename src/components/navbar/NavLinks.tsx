import { useWallet } from "../../contexts/WalletContext";
import { compressAddress } from "../../utils/format";
import { useLanguage } from "../../contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";

interface NavLinksProps {
  links: { label: string; href: string }[];
  onClick?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ links, onClick, isMobile }) => {
  const { account, connect, disconnect } = useWallet();
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
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
        <button
          onClick={disconnect}
          className="group px-4 py-2 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-semibold cursor-pointer w-38"
        >
          <span className="block group-hover:hidden">
            {compressAddress(account)}
          </span>
          <span className="hidden group-hover:block">
            {t("nav.disconnect")}
          </span>
        </button>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-2xl text-white font-semibold cursor-pointer w-38"
        >
          {t("nav.connectWallet")}
        </button>
      )}
    </div>
  );
};

export default NavLinks;
