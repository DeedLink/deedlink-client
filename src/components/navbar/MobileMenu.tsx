import NavLinks from "./NavLinks";

interface MobileMenuProps {
  isOpen: boolean;
  links: { label: string; href: string }[];
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, links, onClose }) => {
  return (
    <div
      className={`lg:hidden bg-white/10 backdrop-blur-md text-white overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-[600px] overflow-y-auto" : "max-h-0"
      }`}
    >
      <div className="flex flex-col gap-4 p-4">
        <NavLinks links={links} onClick={onClose} isMobile />
      </div>
    </div>
  );
};

export default MobileMenu;
