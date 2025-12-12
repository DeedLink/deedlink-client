import { useWallet } from "../../contexts/WalletContext";
import { compressAddress } from "../../utils/format";
import { useLanguage } from "../../contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import DeedQRScanner from "../qr/DeedQRScanner";
import { FaQrcode } from "react-icons/fa";

interface NavLinksProps {
  links: { label: string; href: string }[];
  onClick?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ links, onClick, isMobile }) => {
  const { account, connect, disconnect } = useWallet();
  const { t } = useLanguage();
  const location = useLocation();
  const [showQRScanner, setShowQRScanner] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname===href;
  };

  return (
    <>
      <div
        className={`${
          isMobile
            ? "flex flex-col items-center gap-4 py-4"
            : "hidden lg:flex gap-4 sm:gap-6 lg:gap-8 font-medium text-white items-center"
        }`}
      >
        {!isMobile && (
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition cursor-pointer text-sm sm:text-base"
            title="Scan Deed QR Code"
          >
            <FaQrcode className="w-4 h-4" />
            <span className="hidden xl:inline">Scan QR</span>
          </button>
        )}
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
          className={`px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium cursor-pointer transition-all duration-200 ${isMobile ? 'w-full' : ''}`}
        >
          {t("nav.connectWallet")}
        </button>
        {isMobile && (
          <button
            onClick={() => {
              setShowQRScanner(true);
              onClick?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition"
          >
            <FaQrcode className="w-4 h-4" />
            Scan Deed QR
          </button>
        )}
      </div>

      {showQRScanner && (
        <DeedQRScanner onClose={() => setShowQRScanner(false)} />
      )}
    </>
  );
};

export default NavLinks;
