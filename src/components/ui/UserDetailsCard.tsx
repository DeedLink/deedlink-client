import {
  FaUser,
  FaEnvelope,
  FaWallet,
  FaIdCard,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

const UserDetailsCard = ({ user }: any) => {
  if (!user) return null;

  return (
    <section className="w-full px-6 md:px-16 py-12 bg-green-50 border-t border-green-100">
      <div className="max-w-boundary mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-3xl font-bold text-green-900 flex items-center gap-2">
            <FaUser className="text-green-700" />
            Welcome, {user.name.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-gray-600 mt-2 md:mt-0">
            Here’s your account overview
          </p>
        </div>

        <div className="bg-white border border-green-100 shadow-lg hover:shadow-xl transition rounded-2xl p-8">
          <ul className="space-y-4 text-gray-800 text-sm md:text-base">
            <li className="flex items-center justify-between border-b border-green-50 pb-3">
              <div className="flex items-center gap-2">
                <FaUser className="text-green-700" />
                <span className="font-semibold text-green-800">Full Name:</span>
              </div>
              <span>{user.name}</span>
            </li>

            <li className="flex items-center justify-between border-b border-green-50 pb-3">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-green-700" />
                <span className="font-semibold text-green-800">Email:</span>
              </div>
              <span>{user.email}</span>
            </li>

            <li className="flex items-center justify-between border-b border-green-50 pb-3">
              <div className="flex items-center gap-2">
                <FaWallet className="text-green-700" />
                <span className="font-semibold text-green-800">Wallet:</span>
              </div>
              <span className="truncate max-w-[200px] text-gray-700 text-right">
                {user.walletAddress}
              </span>
            </li>

            <li className="flex items-center justify-between border-b border-green-50 pb-3">
              <div className="flex items-center gap-2">
                <FaIdCard className="text-green-700" />
                <span className="font-semibold text-green-800">NIC:</span>
              </div>
              <span>{user.nic}</span>
            </li>

            <li className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                {user.kycStatus === "verified" ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaClock className="text-yellow-500" />
                )}
                <span className="font-semibold text-green-800">KYC Status:</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  user.kycStatus === "verified"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {user.kycStatus}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default UserDetailsCard;
