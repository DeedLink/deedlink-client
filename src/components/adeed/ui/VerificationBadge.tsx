import { useState, useEffect } from "react";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";

interface VerificationBadgeProps {
  onChainData: any;
  offChainData: any;
  compareFn: (onChain: any, offChain: any) => boolean;
  label?: string;
}

type VerificationStatus = "loading" | "verified" | "mismatch" | "error";

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  onChainData,
  offChainData,
  compareFn,
  label = "Verification"
}) => {
  const [status, setStatus] = useState<VerificationStatus>("loading");

  useEffect(() => {
    if (onChainData === undefined || offChainData === undefined) {
      setStatus("loading");
      return;
    }

    if (onChainData === null || offChainData === null) {
      setStatus("error");
      return;
    }

    try {
      const matches = compareFn(onChainData, offChainData);
      setStatus(matches ? "verified" : "mismatch");
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
    }
  }, [onChainData, offChainData, compareFn]);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <FaSpinner className="animate-spin text-gray-400" size={16} />;
      case "verified":
        return <FaCheckCircle className="text-green-600" size={16} />;
      case "mismatch":
        return <FaTimesCircle className="text-red-600" size={16} />;
      case "error":
        return <FaTimesCircle className="text-gray-400" size={16} />;
    }
  };

  const getText = () => {
    switch (status) {
      case "loading":
        return "Verifying...";
      case "verified":
        return "Verified";
      case "mismatch":
        return "Mismatch";
      case "error":
        return "Error";
    }
  };

  const getColor = () => {
    switch (status) {
      case "loading":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "verified":
        return "bg-green-50 text-green-700 border-green-200";
      case "mismatch":
        return "bg-red-50 text-red-700 border-red-200";
      case "error":
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${getColor()}`}>
      {getIcon()}
      <span>{getText()}</span>
    </div>
  );
};

export default VerificationBadge;

