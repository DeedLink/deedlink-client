import { FaLock, FaCheckCircle } from "react-icons/fa";

type Props = {
  password: string;
  setPassword: (val: string) => void;
  confirm: string;
  setConfirm: (val: string) => void;
  handleFinish: () => void;
  done: boolean;
  prevStep: () => void;
};

const StepPassword = ({
  password,
  setPassword,
  confirm,
  setConfirm,
  handleFinish,
  done,
  prevStep,
}: Props) => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FaLock className="text-green-700" />
        <h2 className="text-lg font-bold text-[#00420A]">Set Password</h2>
      </div>

      {!done ? (
        <>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
          />

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Finish
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <FaCheckCircle className="text-green-600 mx-auto text-3xl mb-3" />
          <h2 className="text-xl font-bold text-green-700">Registration Complete!</h2>
          <p className="text-gray-600 mt-2">You can now log in with your account.</p>
        </div>
      )}
    </div>
  );
};

export default StepPassword;
