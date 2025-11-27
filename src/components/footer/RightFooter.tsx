import { FaLocationDot } from "react-icons/fa6";
import { IoMail } from "react-icons/io5";
import { BsFillTelephoneFill } from "react-icons/bs";
import { contact } from "../../constants/const";

const RightFooter = () => {
  return (
    <div className="flex flex-col gap-4 text-white">
      <h3 className="font-semibold text-lg">Contact Us</h3>
      <div className="space-y-3.5">
        <div className="flex gap-3 items-start">
          <div className="p-2 bg-white/10 rounded-lg flex-shrink-0 mt-0.5">
            <FaLocationDot className="w-5 h-5" />
          </div>
          <div className="text-sm leading-relaxed opacity-90">
            {[contact.location.line1, contact.location.line2, contact.location.line3, contact.location.line4, contact.location.line5].map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
        <a 
          href={`mailto:${contact.mail}`} 
          className="flex gap-3 items-center hover:text-emerald-300 transition-colors"
        >
          <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
            <IoMail className="w-5 h-5" />
          </div>
          <span className="text-sm break-all">{contact.mail}</span>
        </a>
        <a 
          href={`tel:${contact.telephone}`} 
          className="flex gap-3 items-center hover:text-emerald-300 transition-colors"
        >
          <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
            <BsFillTelephoneFill className="w-5 h-5" />
          </div>
          <span className="text-sm">{contact.telephone}</span>
        </a>
      </div>
    </div>
  );
};

export default RightFooter;
