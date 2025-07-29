import { FaLocationDot } from "react-icons/fa6";
import { IoMail } from "react-icons/io5";
import { BsFillTelephoneFill } from "react-icons/bs";
import { contact } from "../../constants/const";

const RightFooter=()=>{
    return(
        <div className="h-64 border-t w-full flex flex-col gap-4 items-center justify-center">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <FaLocationDot className="w-6 h-6"/>
                    <div>
                        <div>
                            {
                                contact.location.line1
                            }
                        </div>
                        <div>
                            {
                                contact.location.line2
                            }
                        </div>
                        <div>
                            {
                                contact.location.line3
                            }
                        </div>
                        <div>
                            {
                                contact.location.line4
                            }
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <IoMail className="w-6 h-6"/>
                    <div>
                        {
                            contact.mail
                        }
                    </div>
                </div>
                <div className="flex gap-4">
                    <BsFillTelephoneFill className="w-6 h-6"/>
                    <div>
                        {
                            contact.telephone
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RightFooter;