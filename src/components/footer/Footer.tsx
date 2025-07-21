import BottomFooter from "./BottomFooter";
import LeftFooter from "./LeftFooter";
import RightFooter from "./RightFooter";
import background from "../../assets/images/backgrounds/lands.webp";

const Footer=()=>{
    return(
        <div className="bg-transparent w-full bg-cover" style={{backgroundImage: `linear-gradient(rgba(0,60,10,0.8), rgba(0,60,10,0.8)), url(${background})`}}>
            <div className="w-full flex flex-col md:flex-row items-center justify-center">
                <div className="w-full flex items-center justify-center">
                    <LeftFooter/>
                </div>
                <div className="w-full flex items-center justify-center">
                    <RightFooter/>
                </div>
            </div>
            <div className="w-full flex items-center justify-center">
                <BottomFooter/>
            </div>
        </div>
    )
}

export default Footer;