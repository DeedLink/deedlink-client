import { useState } from "react";
import { FaWallet, FaLock, FaCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useLogin } from "../../contexts/LoginContext";

const LoginPopup = () => {
  const { isOpen, closeLogin } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  if (!isOpen) return null;

  const handleLogin = () => {
    console.log("Logging in:", { email, password, walletConnected });
  };

  const handleWalletConnect = () => {
    console.log("Connecting wallet...");
    setTimeout(() => {
      setWalletConnected(true);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={closeLogin}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeLogin}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <IoClose size={20} />
        </button>

        <div className="flex items-center justify-center gap-2 mb-6">
          <FaLock className="text-green-700" />
          <h2 className="text-xl font-bold text-[#00420A]">Secure Login</h2>
        </div>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-600 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-green-600 outline-none"
        />

        <button
          onClick={handleWalletConnect}
          disabled={walletConnected}
          className={`w-full flex items-center justify-center gap-2 border border-green-600 py-2 rounded-lg transition cursor-pointer ${
            walletConnected
              ? "bg-green-600 text-white cursor-default"
              : "text-green-700 hover:bg-green-50"
          }`}
        >
          {walletConnected ? (
            <>
              <FaCheckCircle />
              Wallet Connected
            </>
          ) : (
            <>
              <FaWallet />
              Connect Wallet
            </>
          )}
        </button>

        <button
          onClick={handleLogin}
          disabled={!walletConnected}
          className={`w-full py-2 rounded-lg mt-4 transition ${
            walletConnected
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
