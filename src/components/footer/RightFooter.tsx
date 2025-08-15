import { FaLocationDot } from "react-icons/fa6";
import { IoMail } from "react-icons/io5";
import { BsFillTelephoneFill } from "react-icons/bs";
import { contact } from "../../constants/const";

const RightFooter = () => {
  return (
    <div className="w-full md:w-1/2 lg:w-2/3 border-t md:border-t-0 flex items-center justify-center p-6">
      <div className="flex flex-col gap-6 text-white max-w-sm w-full">
        <div className="flex gap-4 items-start hover:text-yellow-300 transition-colors duration-300">
          <FaLocationDot className="w-6 h-6 flex-shrink-0 mt-1" />
          <div className="text-sm leading-relaxed">
            {[contact.location.line1, contact.location.line2, contact.location.line3, contact.location.line4].map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-center hover:text-yellow-300 transition-colors duration-300">
          <IoMail className="w-6 h-6 flex-shrink-0" />
          <a href={`mailto:${contact.mail}`} className="text-sm break-all">
            {contact.mail}
          </a>
        </div>
        <div className="flex gap-4 items-center hover:text-yellow-300 transition-colors duration-300">
          <BsFillTelephoneFill className="w-6 h-6 flex-shrink-0" />
          <a href={`tel:${contact.telephone}`} className="text-sm">
            {contact.telephone}
          </a>
        </div>
      </div>
    </div>
  );
};

export default RightFooter;
