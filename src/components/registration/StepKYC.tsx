import { FaIdCard } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

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
    const { t } = useLanguage();
    
    return (
        <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
                <FaIdCard className="text-green-700" />
                <h2 className="text-lg font-bold text-[#00420A]">{t("registration.step2Title")}</h2>
            </div>

            <input
                type="text"
                placeholder={t("registration.nicNumber")}
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:ring-2 focus:ring-green-600 outline-none text-[#00420A]"
            />

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#00420A] mb-1">
                        {t("registration.nicFrontSide")}
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
                        {nicFrontSide ? t("registration.changeFile") : t("registration.chooseFile")}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                        {nicFrontSide ? nicFrontSide.name : t("registration.uploadNicFront")}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#00420A] mb-1">
                        {t("registration.nicBackSide")}
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
                        {nicBackSide ? t("registration.changeFile") : t("registration.chooseFile")}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                        {nicBackSide ? nicBackSide.name : t("registration.uploadNicBack")}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#00420A] mb-1">
                        {t("registration.yourFrontImage")}
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
                        {userFrontImage ? t("registration.changeFile") : t("registration.chooseFile")}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                        {userFrontImage
                            ? userFrontImage.name
                            : t("registration.uploadYourFront")}
                    </p>
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <button
                    onClick={prevStep}
                    className="px-4 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
                >
                    {t("registration.back")}
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
                    {t("registration.submitForKYC")}
                </button>
            </div>
        </div>
    );
};

export default StepKYC;
