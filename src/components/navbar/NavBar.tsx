import { useState } from "react";
import logo from "../../assets/images/logo/main1.jpg";
import { about } from "../../constants/const";
import { HiMenu, HiX } from "react-icons/hi";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import { useLogin } from "../../contexts/LoginContext";

const navLinks = [
  { label: "Home", href: "/" , protected: false},
  { label: "About", href: "/about", protected: false },
  { label: "Deeds Registration", href: "/deeds-registration", protected: true },
  { label: "Deeds", href: "/deeds", protected: true },
  { label: "Market", href: "/market", protected: true }
];

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useLogin();

  return (
    <nav className="bg-[#00420A]/40 backdrop-blur-xl w-full fixed top-0 left-0 z-50 shadow-md">
      <div className="max-w-boundary mx-auto px-6 sm:px-10 h-20 flex justify-between items-center">
        <div className="flex items-center gap-4 font-extrabold text-white text-lg">
          <img
            src={logo}
            alt="logo"
            className="w-10 h-10 rounded-full border-2 border-white/30"
          />
          {about.title}
        </div>

      <div className="cursor-pointer flex gap-8 items-center justify-center">
          <NavLinks links={user?.kycStatus==="verified"? navLinks :navLinks.filter((link)=>!link.protected)} />
      </div>

        <button
          className="lg:hidden text-white text-3xl"
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
