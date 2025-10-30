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
      alert(err.response?.data?.message || "Upload failed");
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
    <section className="w-full py-8 md:py-12 bg-white px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded-lg p-6 md:p-8 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-emerald-500 overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <FaUserCircle className="w-16 h-16 md:w-20 md:h-20 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full cursor-pointer hover:bg-emerald-600 transition border-2 border-white">
                    <FaUpload className="text-white w-3 h-3 md:w-4 md:h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {userProfile.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <FaShieldAlt className="text-emerald-500" />
                  <span>KYC Verified</span>
                </div>
                {file && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full px-6 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Upload Picture"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 rounded-lg p-6 md:p-8 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Account Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-500 rounded flex-shrink-0">
                    <FaUser className="text-white text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Full Name
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-500 rounded flex-shrink-0">
                    <FaEnvelope className="text-white text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {userProfile.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-500 rounded flex-shrink-0">
                    <FaWallet className="text-white text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Wallet Address
                    </p>
                    <p className="text-sm font-mono font-medium text-gray-900 truncate">
                      {compressAddress(userProfile.walletAddress ?? "")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-500 rounded flex-shrink-0">
                    <FaIdCard className="text-white text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      National ID
                    </p>
                    <p className="text-sm font-medium text-gray-900">
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