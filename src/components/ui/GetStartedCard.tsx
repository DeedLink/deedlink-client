import { FaRegFileAlt } from "react-icons/fa";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { useState } from "react";

const GetStartedCard = () => {
  const [isLocked, _setIsLocked] = useState(true);

  // const lockUnlock = (status: boolean) => {
  //   setIsLocked(!status);
  // };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-xs w-full text-center md:ml-auto border border-gray-200 h-fit min-h-[480px] flex flex-col justify-between">
      <div className="h-full min-h-80 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
          {isLocked ? (
            <FaLock className="text-red-600 text-xl" />
          ) : (
            <FaLockOpen className="text-green-600 text-xl" />
          )}
          <h3 className="text-lg font-bold text-black">Register a Deed</h3>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          This section is restricted to authorized administrators and
          government officials.  
          {!isLocked && " You have access to proceed."}
        </p>
      </div>

      <button
        disabled={isLocked}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow w-full transition ${
          isLocked
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        <FaRegFileAlt />
        Register a Deed
      </button>
    </div>
  );
};

export default GetStartedCard;
