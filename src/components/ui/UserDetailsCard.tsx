import {
  FaUser,
  FaEnvelope,
  FaWallet,
  FaIdCard,
  FaShieldAlt,
  FaUserCircle,
} from "react-icons/fa";
import { compressAddress } from "../../utils/format";
import { useEffect, useState } from "react";
import { getProfile, uploadProfilePicture } from "../../api/api";
import { FaUpload } from "react-icons/fa6";
import { type User } from "../../types/types";

const UserDetailsCard = ({ user }: any) => {
  if (!user) return null;

  const [ userProfile, setUserProfile ] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState(user.dp || "");
  const [isUploading, setIsUploading] = useState(false);
  const ipfs_microservice_url = import.meta.env.VITE_IPFS_MICROSERVICE_URL;

  const getUserProfile =async()=>{
    const profile = await getProfile();
    setUserProfile(profile);
  }

  useEffect(()=>{
    getUserProfile();
  },[user]);

  if(!userProfile) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadProfilePicture(file);
      console.log(res);
      setUploadedUrl(res.dp);
      setFile(null);
      alert("Profile picture uploaded!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const lastname = userProfile.name.split(" ")[userProfile.name.split(" ").length-1];

  return (
    <section className="w-full px-6 md:px-16 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto md:px-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg relative">
              {uploadedUrl || userProfile.profilePicture ? (
                <img
                  src={`${ipfs_microservice_url}/file/${userProfile.profilePicture}` || `${ipfs_microservice_url}/file/${uploadedUrl}`}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <FaUserCircle className="w-16 h-16 text-white" />
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full cursor-pointer shadow-md hover:bg-green-400 transition">
                <FaUpload className="text-white w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome, {lastname}!
              </h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <FaShieldAlt className="text-emerald-600" />
                KYC verified & secure
              </p>
            </div>
          </div>
          {file && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-emerald-50 transition-colors">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <FaUser className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Full Name
                </p>
                <p className="text-xs md:text-sm font-semibold text-gray-900">
                  {userProfile.name}
                </p>
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
                <p className="text-xs md:text-sm font-semibold text-gray-900 break-all">
                  {userProfile.email}
                </p>
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
                <p className="text-xs md:text-sm font-mono font-semibold text-gray-800 truncate">
                  {compressAddress(userProfile.walletAddress ?? "")}
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
                <p className="text-xs md:text-sm font-semibold text-gray-900">
                  {userProfile.nic}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserDetailsCard;