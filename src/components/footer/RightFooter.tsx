import { CiLocationOn } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { BsTelephone } from "react-icons/bs";
import { contact } from "../../constants/const";

const RightFooter=()=>{
    return(
        <div className="h-64 border-t w-full flex flex-col gap-4 items-center justify-center">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <CiLocationOn className="w-6 h-6"/>
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
                    <CiMail className="w-6 h-6"/>
                    <div>
                        {
                            contact.mail
                        }
                    </div>
                </div>
                <div className="flex gap-4">
                    <BsTelephone className="w-6 h-6"/>
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