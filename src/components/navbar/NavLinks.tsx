import { useWallet } from "../../contexts/WalletContext";
import { compressAddress } from "../../utils/format";

interface NavLinksProps {
  links: { label: string; href: string }[];
  onClick?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ links, onClick, isMobile }) => {
  const { account, connect, disconnect } = useWallet();

  return (
    <div
      className={`${
        isMobile
          ? "flex flex-col items-center gap-4 py-4"
          : "hidden md:flex gap-8 font-medium text-white items-center"
      }`}
    >
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          onClick={onClick}
          className={`relative group ${
            isMobile
              ? "w-full text-center py-2 hover:bg-white/10 rounded-lg transition"
              : ""
          }`}
        >
          <span className="transition-colors duration-300 group-hover:text-yellow-300">
            {link.label}
          </span>
          {!isMobile && (
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-300 transition-all duration-300 group-hover:w-full"></span>
          )}
        </a>
      ))}
      {account ? (
        <button
          onClick={disconnect}
          className="group px-4 py-2 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-semibold cursor-pointer w-38"
        >
          <span className="block group-hover:hidden">
            {compressAddress(account)}
          </span>
          <span className="hidden group-hover:block">
            Disconnect
          </span>
        </button>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-2xl text-white font-semibold cursor-pointer w-38"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default NavLinks;
