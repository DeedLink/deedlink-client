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
import { useAlert } from "../../contexts/AlertContext";

const UserDetailsCard = ({ user }: any) => {
  if (!user) return null;

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState(user.dp || "");
  const [isUploading, setIsUploading] = useState(false);
  const { showAlert } = useAlert();
  const ipfs_microservice_url = import.meta.env.VITE_IPFS_MICROSERVICE_URL;

  const getUserProfile = async () => {
    const profile = await getProfile();
    setUserProfile(profile);
  };

  useEffect(() => {
    getUserProfile();
  }, [user]);

  if (!userProfile) return null;

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
      showAlert({
        type: "success",
        title: "Profile Picture Updated",
        message: "Profile Picture Updated Successfully",
        confirmText: "OK",
      });
    } catch (err: any) {
      console.error(err);
      showAlert({
        type: "error",
        title: "Upload Failed",
        message: err.response?.data?.message || "Failed to upload profile picture",
        confirmText: "OK"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const profileImage = file
    ? URL.createObjectURL(file)
    : uploadedUrl
    ? `${ipfs_microservice_url}/file/${uploadedUrl}`
    : userProfile.profilePicture
    ? `${ipfs_microservice_url}/file/${userProfile.profilePicture}`
    : "";

  //const lastname = userProfile.name.split(" ")[userProfile.name.split(" ").length - 1];

  return (
    <section className="w-full bg-gradient-to-br from-emerald-50 to-green-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-0">
            {/* Profile Section */}
            <div className="lg:col-span-4 bg-gradient-to-br from-emerald-600 to-green-700 p-6 md:p-8 flex flex-col items-center justify-center text-center text-white">
              <div className="relative mb-6">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 overflow-hidden shadow-xl">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaUserCircle className="w-20 h-20 md:w-24 md:h-24 text-white/80" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-2.5 bg-white rounded-full cursor-pointer hover:bg-emerald-50 transition shadow-lg border-2 border-emerald-600">
                  <FaUpload className="text-emerald-600 w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {userProfile.name}
              </h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <FaShieldAlt className="text-white" />
                <span className="text-sm font-medium">KYC Verified</span>
              </div>
              {file && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-6 w-full px-6 py-3 bg-white text-emerald-600 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isUploading ? "Uploading..." : "Upload Picture"}
                </button>
              )}
            </div>

            {/* Account Information Section */}
            <div className="lg:col-span-8 p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-emerald-100">
                Account Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                  <div className="p-3 bg-emerald-500 rounded-lg flex-shrink-0 shadow-md">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Full Name
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {userProfile.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                  <div className="p-3 bg-emerald-500 rounded-lg flex-shrink-0 shadow-md">
                    <FaEnvelope className="text-white text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Email Address
                    </p>
                    <p className="text-base font-semibold text-gray-900 break-all">
                      {userProfile.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                  <div className="p-3 bg-emerald-500 rounded-lg flex-shrink-0 shadow-md">
                    <FaWallet className="text-white text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Wallet Address
                    </p>
                    <p className="text-base font-mono font-semibold text-gray-900 break-all">
                      {compressAddress(userProfile.walletAddress ?? "")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                  <div className="p-3 bg-emerald-500 rounded-lg flex-shrink-0 shadow-md">
                    <FaIdCard className="text-white text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      National ID
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {userProfile.nic}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserDetailsCard;