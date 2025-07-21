import logo from "../../assets/images/logo/main.webp";
import { about } from "../../constants/const";

const LeftFooter=()=>{
    return(
        <div className="h-64 border-r border-t w-full flex items-center justify-center">
            <div className="">
                <div className="flex flex-col gap-4">
                    <div>
                        <img src={logo} className="w-10 h-10 rounded-xl"/>
                    </div>
                    <div className="font-extrabold text-lg">
                        {about.title}
                    </div>
                    <div className="max-w-72">
                        {about.discription}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LeftFooter;