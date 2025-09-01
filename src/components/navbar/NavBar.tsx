import { useState } from "react";
import logo from "../../assets/images/logo/main1.jpg";
import { about } from "../../constants/const";
import { HiMenu, HiX } from "react-icons/hi";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Deeds Registration", href: "/deeds-registration" },
  { label: "Deeds", href: "/deeds" },
  { label: "Market", href: "/market" }
];

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <NavLinks links={navLinks} />
      </div>

        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        links={navLinks}
        onClose={() => setMenuOpen(false)}
      />
    </nav>
  );
};

export default NavBar;
