import { useParams } from "react-router-dom";

const ADeedPage=()=>{
    const { deedNumber } = useParams();
    return(
        <div className="flex items-center justify-center text-black min-h-screen">
            {deedNumber}
        </div>
    )
}

export default ADeedPage;