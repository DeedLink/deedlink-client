import BottomFooter from "./BottomFooter";
import LeftFooter from "./LeftFooter";
import RightFooter from "./RightFooter";
import background from "../../assets/images/backgrounds/lands.webp";

const Footer = () => {
  return (
    <footer
      className="w-full bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,60,10,0.85), rgba(0,60,10,0.85)), url(${background})`,
      }}
    >
        <div className="max-w-boundary mx-auto w-full flex flex-col gap-6 text-white">
            <div className="flex flex-col md:flex-row items-stretch">
                <LeftFooter />
                <RightFooter />
            </div>

            <BottomFooter />
        </div>
    </footer>
  );
};

export default Footer;
