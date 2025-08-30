import { FaIdCard } from "react-icons/fa";

type Props = {
    nic: string;
    setNic: (val: string) => void;
    setNicFrontSide: (file: File | null) => void;
    setNicBackSide: (file: File | null) => void;
    setUserFrontImage: (file: File | null) => void;
    nicFrontSide: File | null;
    nicBackSide: File | null;
    userFrontImage: File | null;
    canGoNext: () => boolean;
    nextStep: () => void;
    prevStep: () => void;
    submitForKYC: () => void;
};

const StepKYC = ({
    nic,
    setNic,
    setNicFrontSide,
    setNicBackSide,
    setUserFrontImage,
    nicFrontSide,
    nicBackSide,
    userFrontImage,
    canGoNext,
    nextStep,
    prevStep,
    submitForKYC
}: Props) => {
    return (
        <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
                <FaIdCard className="text-green-700" />
                <h2 className="text-lg font-bold text-[#00420A]">KYC Verification</h2>
            </div>

            <input
                type="text"
                placeholder="NIC Number"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
            />

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#00420A] mb-1">
                        NIC Front Side
                    </label>
                    <input
                        id="nicFrontInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                            setNicFrontSide(e.target.files ? e.target.files[0] : null)
                        }
                    />
                    <label
                        htmlFor="nicFrontInput"
                        className="cursor-pointer w-full inline-flex items-center justify-center border border-gray-300 rounded p-2 text-[#00420A] bg-white hover:bg-gray-100"
                    >
                        {nicFrontSide ? "Change File" : "Choose File"}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                        {nicFrontSide ? nicFrontSide.name : "Please upload NIC front side image"}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#00420A] mb-1">
                        NIC Back Side
                    </label>
                    <input
                        id="nicBackInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                            setNicBackSide(e.target.files ? e.target.files[0] : null)
                        }
                    />
                    <label
                        htmlFor="nicBackInput"
                        className="cursor-pointer w-full inline-flex items-center justify-center border border-gray-300 rounded p-2 text-[#00420A] bg-white hover:bg-gray-100"
                    >
                        {nicBackSide ? "Change File" : "Choose File"}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                        {nicBackSide ? nicBackSide.name : "Please upload NIC back side image"}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#00420A] mb-1">
                        Your Front Image / Video
                    </label>
                    <input
                        id="userFrontInput"
                        type="file"
                        accept="video/*,image/*"
                        className="hidden"
                        onChange={(e) =>
                            setUserFrontImage(e.target.files ? e.target.files[0] : null)
                        }
                    />
                    <label
                        htmlFor="userFrontInput"
                        className="cursor-pointer w-full inline-flex items-center justify-center border border-gray-300 rounded p-2 text-[#00420A] bg-white hover:bg-gray-100"
                    >
                        {userFrontImage ? "Change File" : "Choose File"}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                        {userFrontImage
                            ? userFrontImage.name
                            : "Please upload your front-facing image or video"}
                    </p>
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <button
                    onClick={prevStep}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
                >
                    Back
                </button>
                <button
                    onClick={()=>{
                      nextStep();
                      submitForKYC();
                    }}
                    disabled={!canGoNext()}
                    className={`px-4 py-2 rounded-lg ${
                        canGoNext()
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    Submit for KYC
                </button>
            </div>
        </div>
    );
};

export default StepKYC;
