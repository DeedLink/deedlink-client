import { FaRegFileAlt, FaLock, FaLockOpen, FaShieldAlt } from "react-icons/fa";
import { useState } from "react";

const GetStartedCard = () => {
  const [isLocked] = useState(true);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-3xl p-8 max-w-sm w-full flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-50"></div>
      
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className={`p-5 rounded-2xl ${isLocked ? 'bg-red-100' : 'bg-emerald-100'} shadow-lg`}>
          {isLocked ? (
            <FaLock className="text-red-600 text-3xl" />
          ) : (
            <FaLockOpen className="text-emerald-600 text-3xl" />
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Register a Deed
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {isLocked ? (
              <>
                <span className="flex items-center justify-center gap-2 mb-2">
                  <FaShieldAlt className="text-amber-500" />
                  <span className="font-semibold text-amber-600">Restricted Access</span>
                </span>
                Available only for authorized administrators and government officials.
              </>
            ) : (
              "You have the necessary permissions to register property deeds."
            )}
          </p>
        </div>

        {isLocked && (
          <div className="mt-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 text-center">
              Contact your administrator for access
            </p>
          </div>
        )}
      </div>

      <button
        disabled={isLocked}
        className={`mt-8 flex items-center justify-center gap-3 px-6 py-4 rounded-xl w-full font-bold text-lg transition-all duration-300 ${
          isLocked
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl hover:scale-105"
        }`}
      >
        <FaRegFileAlt className="text-xl" />
        Register Now
      </button>
    </div>
  );
};

export default GetStartedCard;