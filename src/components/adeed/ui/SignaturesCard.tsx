import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import type { IDeed } from "../../../types/responseDeed";
import { shortAddress } from "../../../utils/format";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

interface SignaturesCardProps {
  signatures: ISignatures;
  deed: IDeed;
}

const SignaturesCard = ({ signatures, deed }: SignaturesCardProps) => {
  return (
    <div className="rounded-xl border border-gray-200 p-5 bg-white">
      <h3 className="font-bold text-gray-900 mb-4">Signatures</h3>
      <div className="space-y-3">
        {[
          { label: "Surveyor", value: signatures.surveyor, assigned: deed.surveyAssigned },
          { label: "Notary", value: signatures.notary, assigned: deed.notaryAssigned },
          { label: "IVSL", value: signatures.ivsl, assigned: deed.ivslAssigned },
        ].map((sig) => (
          <div key={sig.label} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">{sig.label}</span>
              {sig.value ? (
                <FaCheckCircle className="text-emerald-600" size={20} />
              ) : (
                <FaTimesCircle className="text-gray-400" size={20} />
              )}
            </div>
            {sig.assigned && (
              <div className="text-xs text-gray-500 mt-2">{shortAddress(sig.assigned)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignaturesCard;