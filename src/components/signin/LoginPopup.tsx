import { useState } from "react";
import { FaWallet, FaLock, FaCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useLogin } from "../../contexts/LoginContext";
import { useWallet } from "../../contexts/WalletContext";
import { compressAddress } from "../../utils/format";
import { loginUser } from "../../api/api";

const LoginPopup = () => {
  const { isOpen, closeLogin, setToken, setUser } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { account, connect } = useWallet();

  const handleLogin = async () => {
    try {
      if(account){
        console.log("Logging in:", { email, password, account });
        const walletAddress = account;
        const res = await loginUser({ email, password, walletAddress });
        if (res) {
          setUser(res.user);
          setToken(res.token);
          closeLogin();
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (!isOpen) return null;

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
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
        />

        <button
          onClick={connect}
          disabled={account != null}
          className={`w-full flex items-center justify-center gap-2 border border-green-600 py-2 rounded-lg transition cursor-pointer ${
            account
              ? "bg-green-600 text-white cursor-default"
              : "text-green-700 hover:bg-green-50"
          }`}
        >
          {account ? (
            <>
              <FaCheckCircle />
              {compressAddress(account)}
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
          disabled={!account || !email || !password}
          className={`w-full py-2 rounded-lg mt-4 transition ${
            (account && email && password)
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
