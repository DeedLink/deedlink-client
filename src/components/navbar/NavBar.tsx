import logo from "../../assets/images/logo/main.webp";
import { about } from "../../constants/const";

const NavBar=()=>{
    return(
        <div className="bg-[#00420A] w-full h-20 flex items-center px-10">
            <div className="flex items-center gap-6 font-extrabold text-lg">
                <img src={logo} className="w-10 h-10 rounded-xl"/>
                {about.title}
            </div>
        </div>
    )
}

export default NavBar;