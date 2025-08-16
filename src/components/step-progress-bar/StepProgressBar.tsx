import ProgressiveLine from "./ProgressiveLine";
import Step from "./Step";

interface StepProgressBarProps {
  steps: number;
  currentStep: number;
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full h-fit p-2 flex items-center justify-center">
      {Array.from({ length: steps }).map((_, index) => {
        const stepIndex = index + 1;

        let status: "done" | "progressing" | "none" = "none";
        if (stepIndex < currentStep) status = "done";
        else if (stepIndex === currentStep) status = "progressing";

        return (
          <div key={stepIndex} className="flex items-center w-fit border justify-center">
            <div className="">
            <Step value={stepIndex.toString()} status={status} />
            </div>
            {
                stepIndex < steps ?
                <div className="w-full min-w-10">
                    <ProgressiveLine status={status} />
                </div> : null
            }
          </div>
        );
      })}
    </div>
  );
};

export default StepProgressBar;
