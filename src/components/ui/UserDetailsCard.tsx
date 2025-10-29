import {
  FaUser,
  FaEnvelope,
  FaWallet,
  FaIdCard,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaUserCircle,
} from "react-icons/fa";

const UserDetailsCard = ({ user }: any) => {
  if (!user) return null;

  return (
    <section className="w-full px-6 md:px-16 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
              <FaUserCircle className="w-16 h-16 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome, {user.name.split(" ")[0]}!
              </h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <FaShieldAlt className="text-emerald-600" />
                Account verified & secure
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <FaUser className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Full Name
                </p>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <FaEnvelope className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-lg font-semibold text-gray-900 break-all text-sm">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <FaWallet className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Wallet
                </p>
                <p className="text-sm font-mono font-semibold text-gray-800 truncate">
                  {user.walletAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <FaIdCard className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  National ID
                </p>
                <p className="text-lg font-semibold text-gray-900">{user.nic}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserDetailsCard;