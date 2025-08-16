const Step = ({ value, status}: { value: string; status: "done" | "progressing" | "none";}) => {
    const getBgColor = () => {
        if (status === "progressing") return "bg-blue-500";
        if (status === "done") return "bg-green-500";
        return "bg-gray-100";
    };

    return (
        <div className={`border w-10 h-10 border-black rounded-full relative flex items-center justify-center ${getBgColor()}`}      >
        <div className="absolute z-10 text-[#00420A]">{value}</div>
        {status === "progressing" && (
            <div className="absolute w-full h-full bg-yellow-500 animate-pulse rounded-full" />
        )}
        </div>
    );
};

export default Step;
