const ProgressiveLine = ({status}: {status:"done" | "progressing" | "none"}) => {
  return (
    <div className="w-full h-[2px] bg-gray-200 relative max-w-40">
      <div
        className={`absolute top-0 left-0 h-full w-full transition-transform-all duration-75 ${
          status === "progressing" ? 'animate-pulse bg-yellow-500' : status === "done" ? 'animate-none bg-green-500' : 'animate-none bg-black-100'
        }`}
      ></div>
    </div>
  );
}

export default ProgressiveLine;