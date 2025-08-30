import { FaUserCircle } from "react-icons/fa";

const AlreadyHaveAnAccount = () => {
  return (
    <div className="flex justify-center">
      <div className="flex items-start gap-3">
        <FaUserCircle className="text-[#00420A] text-5xl" />
        <h2 className="text-[#00420A] text-lg font-semibold leading-snug">
          Already have a registered account for this wallet address
        </h2>
      </div>
    </div>
  );
};

export default AlreadyHaveAnAccount;
