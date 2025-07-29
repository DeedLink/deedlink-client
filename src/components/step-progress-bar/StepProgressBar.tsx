import ProgressiveLine from "./ProgressiveLine";
import Step from "./Step";

const StepProgressBar = () => {
    return(
        <div className="w-full h-fit p-2 flex items-center justify-center max-w-[800px] mx-auto">
            <Step value="1" status="done" />
            <ProgressiveLine status="done" />
            <Step value="2" status="progressing" />
            <ProgressiveLine status="progressing" />
            <Step value="3" status="none" />
            <ProgressiveLine status="none" />
            <Step value="4" status="none" />
        </div>
    )
}

export default StepProgressBar;