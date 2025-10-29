import { FaRegFileAlt } from "react-icons/fa";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { useState } from "react";

const GetStartedCard = () => {
  const [isLocked] = useState(true);

  return (
    <div className="bg-white border border-green-100 shadow-md hover:shadow-xl transition rounded-2xl p-8 max-w-xs w-full flex flex-col justify-between text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 rounded-full bg-green-50">
          {isLocked ? (
            <FaLock className="text-red-500 text-2xl" />
          ) : (
            <FaLockOpen className="text-green-600 text-2xl" />
          )}
        </div>
        <h3 className="text-xl font-bold text-green-900 mt-2">
          Register a Deed
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Restricted to authorized administrators and officials.
          {!isLocked && " You have access to proceed."}
        </p>
      </div>

      <button
        disabled={isLocked}
        className={`mt-8 flex items-center justify-center gap-2 px-4 py-2 rounded-lg w-full font-semibold transition ${
          isLocked
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700 shadow-md"
        }`}
      >
        <FaRegFileAlt />
        Register Now
      </button>
    </div>
  );
};

export default GetStartedCard;
