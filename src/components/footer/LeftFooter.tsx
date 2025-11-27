import logo from "../../assets/images/logo/main1.jpg";
import { about } from "../../constants/const";

const LeftFooter = () => {
  return (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex items-center gap-3">
        <img src={logo} className="w-14 h-14 rounded-xl border-2 border-white/30 shadow-lg flex-shrink-0" alt="DeedLink Logo" />
        <h2 className="font-extrabold text-xl">{about.title}</h2>
      </div>
      <p className="text-sm leading-relaxed opacity-90">
        {about.discription}
      </p>
      <p className="text-xs opacity-75">
        Blockchain-powered property deed management for Sri Lanka
      </p>
    </div>
  );
};

export default LeftFooter;
