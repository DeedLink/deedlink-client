import logo from "../../assets/images/logo/main1.jpg";
import { about } from "../../constants/const";

const LeftFooter = () => {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 border-t md:border-t-0 md:border-r border-white/20 flex items-center justify-center p-6">
      <div className="flex flex-col gap-4 max-w-sm text-white">
        <img src={logo} className="w-12 h-12 rounded-xl border-2 border-white/30" />
        <h2 className="font-extrabold text-lg">{about.title}</h2>
        <p className="text-sm leading-relaxed opacity-90">{about.discription}</p>
      </div>
    </div>
  );
};

export default LeftFooter;
