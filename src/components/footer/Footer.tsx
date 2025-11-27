import BottomFooter from "./BottomFooter";
import LeftFooter from "./LeftFooter";
import RightFooter from "./RightFooter";
import QuickLinks from "./QuickLinks";
import background from "../../assets/images/backgrounds/lands.webp";

const Footer = () => {
  return (
    <footer
      className="w-full bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,60,10,0.9), rgba(0,60,10,0.9)), url(${background})`,
      }}
    >
        <div className="max-w-boundary mx-auto w-full px-6 md:px-16 py-12 md:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-10">
                <div className="lg:col-span-1">
                  <LeftFooter />
                </div>
                <div className="lg:col-span-1">
                  <QuickLinks />
                </div>
                <div className="lg:col-span-1">
                  <RightFooter />
                </div>
            </div>

            <BottomFooter />
        </div>
    </footer>
  );
};

export default Footer;
