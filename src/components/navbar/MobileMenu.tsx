import NavLinks from "./NavLinks";

interface MobileMenuProps {
  isOpen: boolean;
  links: { label: string; href: string }[];
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, links, onClose }) => {
  return (
    <div
      className={`md:hidden bg-[#00420A] text-white overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96" : "max-h-0"
      }`}
    >
      <NavLinks links={links} onClick={onClose} isMobile />
    </div>
  );
};

export default MobileMenu;
