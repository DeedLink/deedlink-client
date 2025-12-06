import { useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { useLoader } from "../../contexts/LoaderContext";
import { useAlert } from "../../contexts/AlertContext";
import { getItem } from "../../storage/storage";
import { type User } from "../../types/types";
import { LandUnitSelectItems } from "../ui/LandUnitSelectItems";
import { searchUsers } from "../../api/api";
import { reg_mintNFT } from "../../offonchaincalls/calls";
import { LAND_TYPES } from "../../constants/const";
import {
  SRI_LANKA_DISTRICTS,
  SRI_LANKA_DIVISIONS_BY_DISTRICT
} from "../../constants/sriLankaLocations";
import { useLanguage } from "../../contexts/LanguageContext";
import { sendStampFee } from "../../web3.0/stampService";
import { TOTAL_REGISTRATION_FEE, REGISTRATION_FEES } from "../../constants/const";

const LandRegistrationPopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const { account } = useWallet();
  const { showLoader, hideLoader } = useLoader();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const [user] = useState<User | null>(getItem("session", "user"));
  const [formData, setFormData] = useState({
    ownerWalletAddress: account,
    ownerFullName: user?.name,
    ownerNIC: user?.nic,
    ownerAddress: "",
    ownerPhone: "",
    landTitleNumber: "",
    landAddress: "",
    landArea: "",
    landSizeUnit: "Perches",
    landType: "Residential",
    surveyPlanNumber: "",
    propertyValue: 0,
    boundaries: "",
    district: "",
    division: "",
    deedNumber: "",
    notary: "",
    notaryName: "",
    IVSL: "",
    IVSLName: "",
    surveyor: "",
    surveyorName: "",
    registrationDate: "",
    deedDocument: null as File | null,
    titleDocument: null as File | null,
  });
  const [activeSection, setActiveSection] = useState<string | null>("owner");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);

  const [surveyorSuggestions, setSurveyorSuggestions] = useState<User[]>([]);
  const [notarySuggestions, setNotarySuggestions] = useState<User[]>([]);
  const [ivslSuggestions, setIvslSuggestions] = useState<User[]>([]);

  const [activeField, setActiveField] = useState<string | null>(null);
  const divisionOptions = formData.district
    ? SRI_LANKA_DIVISIONS_BY_DISTRICT[formData.district] ?? []
    : [];

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "district") {
      setFormData({ ...formData, district: value, division: "" });
      return;
    }
    if (name === "propertyValue") {
      const numValue = parseFloat(value) || 0;
      setFormData({ ...formData, [name]: numValue });
      return;
    }
    setFormData({ ...formData, [name]: value });

    if (["surveyorName", "notaryName", "IVSLName"].includes(name)) {
      if (value.trim().length < 2) {
        if (name === "surveyorName") setSurveyorSuggestions([]);
        if (name === "notaryName") setNotarySuggestions([]);
        if (name === "IVSLName") setIvslSuggestions([]);
        return;
      }

      setActiveField(name);

      try {
        const res = await searchUsers(value);
        const data: User[] = res;

        if (name === "surveyorName") setSurveyorSuggestions(data.filter(u=>u.role==="surveyor"));
        if (name === "notaryName") setNotarySuggestions(data.filter(u=>u.role==="notary"));
        if (name === "IVSLName") setIvslSuggestions(data.filter(u=>u.role==="IVSL"));
      } catch {
        if (name === "surveyorName") setSurveyorSuggestions([]);
        if (name === "notaryName") setNotarySuggestions([]);
        if (name === "IVSLName") setIvslSuggestions([]);
      }
    }																						
  };

  const handleSelect = (field: string, user: User) => {
      setFormData((prev) => ({
        ...prev,
        [`${field}`]: user.walletAddress,
        [`${field}Name`]: user.name
      }));
      if (field === "surveyor") setSurveyorSuggestions([]);
      if (field === "notary") setNotarySuggestions([]);
      if (field === "IVSL") setIvslSuggestions([]);
      setActiveField(null);
  };

  // Registration fee is constant: gov fee + IVSL fee + survey fee + notary fee
  const registrationFee = TOTAL_REGISTRATION_FEE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Land Registration Data:", formData);
    
    // Step 1: Pay registration fee
    if (!paymentTxHash) {
      setIsPaying(true);
      showLoader();
      try {
        const paymentResult = await sendStampFee(registrationFee.toFixed(4));
        if (!paymentResult.success) {
          throw new Error(paymentResult.error || "Payment failed");
        }
        setPaymentTxHash(paymentResult.txHash || null);
        showAlert({
          type: "success",
          title: t("deedRegistrationForm.paymentSuccessful"),
          htmlContent: (
            <div className="space-y-2">
              <p>{t("deedRegistrationForm.paymentSuccessful")}</p>
              {paymentResult.txHash && (
                <p className="text-xs text-gray-600 font-mono break-words">
                  TX: {paymentResult.txHash}
                </p>
              )}
            </div>
          ),
          confirmText: t("deedRegistrationForm.continue"),
          onConfirm: () => {
            hideLoader();
            setIsPaying(false);
          }
        });
        return; // User needs to confirm and submit again
      } catch (error: any) {
        console.error("Payment failed:", error);
        setIsPaying(false);
        hideLoader();
        showAlert({
          type: "error",
          title: t("deedRegistrationForm.paymentFailed"),
          htmlContent: (
            <div className="space-y-2">
              <p>{t("deedRegistrationForm.paymentFailed")}</p>
              <p className="text-sm text-gray-600 font-mono break-words">
                {error?.message || "Unknown error"}
              </p>
            </div>
          ),
          confirmText: t("deedRegistrationForm.ok")
        });
        return;
      }
    }
    
    // Step 2: Register deed after payment
    showLoader();
    try {
      await reg_mintNFT(account || "", formData);
      
      // Success: show alert, clear form, refresh page
      showAlert({
        type: "success",
        title: t("deedRegistrationForm.registrationSuccessful"),
        htmlContent: (
          <div className="space-y-2">
            <p>{t("deedRegistrationForm.registrationSuccessful")}</p>
            <p className="text-sm text-gray-600">{t("deedRegistrationForm.pageWillRefresh")}</p>
          </div>
        ),
        confirmText: t("deedRegistrationForm.ok"),
        onConfirm: () => {
          // Clear form
          setFormData({
            ownerWalletAddress: account,
            ownerFullName: user?.name,
            ownerNIC: user?.nic,
            ownerAddress: "",
            ownerPhone: "",
            landTitleNumber: "",
            landAddress: "",
            landArea: "",
            landSizeUnit: "Perches",
            landType: "Residential",
            surveyPlanNumber: "",
            propertyValue: 0,
            boundaries: "",
            district: "",
            division: "",
            deedNumber: "",
            notary: "",
            notaryName: "",
            IVSL: "",
            IVSLName: "",
            surveyor: "",
            surveyorName: "",
            registrationDate: "",
            deedDocument: null,
            titleDocument: null,
          });
          setPaymentTxHash(null);
          setIsPaying(false);
          
          // Close popup and refresh
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      });
    } catch (error: any) {
      console.error("Registration failed:", error);
      showAlert({
        type: "error",
        title: t("deedRegistrationForm.registrationFailed"),
        htmlContent: (
          <div className="space-y-2">
            <p>{t("deedRegistrationForm.registrationFailed")}</p>
            <p className="text-sm text-gray-600 font-mono break-words">
              {error?.message || "Unknown error"}
            </p>
          </div>
        ),
        confirmText: t("deedRegistrationForm.ok")
      });
    } finally {
      hideLoader();
    }
  };

  const renderAutocompleteInput = (
    field: "surveyor" | "notary" | "IVSL",
    placeholder: string,
    suggestions: User[]
  ) => (
    <div className="relative">
      <input
        name={`${field}Name`}
        placeholder={placeholder}
        value={formData[`${field}Name`]}
        onChange={handleChange}
        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
      {activeField === `${field}Name` && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-md">
          {suggestions.map((s) => (
            <li
              key={s._id}
              onClick={() => handleSelect(field, s)}
              className="px-4 py-2 hover:bg-green-100 cursor-pointer"
            >
              {s.name} {s.email && <span className="text-sm text-gray-500">({s.email})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="w-full h-full fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-[90%] max-w-3xl overflow-hidden">
        <div className="rounded-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-green-900 mb-2 text-center">
            {t("deedRegistrationForm.registerNewLand")}
          </h2>
          <p className="text-gray-700 text-sm mb-6 text-center">
            {t("deedRegistrationForm.provideDetails")}
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
            <div>
              <label className="text-lg font-semibold text-green-800 mb-2 flex justify-between items-center">
                {t("deedRegistrationForm.walletAddress")}
              </label>
              <input
                type="text"
                disabled
                placeholder={account || t("deedRegistrationForm.notConnected")}
                className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <h3
                onClick={() => toggleSection("owner")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("deedRegistrationForm.ownerDetails")}
                <span>{activeSection === "owner" ? "−" : "+"}</span>
              </h3>
              {activeSection === "owner" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="ownerFullName"
                    disabled={true}
                    placeholder={t("deedRegistrationForm.fullName")}
                    value={formData.ownerFullName || user?.name || ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 bg-gray-100 text-gray-500"
                    required
                  />
                  <input
                    name="ownerNIC"
                    disabled={true}
                    placeholder={t("deedRegistrationForm.nicNumber")}
                    value={formData.ownerNIC || user?.nic || ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 bg-gray-100 text-gray-500"
                    required
                  />
                  <input
                    name="ownerPhone"
                    placeholder={t("deedRegistrationForm.phoneNumber")}
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    name="ownerAddress"
                    placeholder={t("deedRegistrationForm.address")}
                    value={formData.ownerAddress}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 sm:col-span-2"
                  />
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("land")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("deedRegistrationForm.landDetails")}
                <span>{activeSection === "land" ? "−" : "+"}</span>
              </h3>
              {activeSection === "land" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="landTitleNumber"
                    placeholder={t("deedRegistrationForm.titleNumber")}
                    value={formData.landTitleNumber}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    name="landAddress"
                    placeholder={t("deedRegistrationForm.landAddress")}
                    value={formData.landAddress}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    name="landArea"
                    placeholder={t("deedRegistrationForm.landSize")}
                    value={formData.landArea}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <LandUnitSelectItems
                    formData={formData}
                    handleChange={handleChange}
                  />
                  <select
                    name="landType"
                    value={formData.landType}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 sm:col-span-2 bg-white"
                  >
                    {LAND_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    name="surveyPlanNumber"
                    placeholder={t("deedRegistrationForm.surveyPlanNumber")}
                    value={formData.surveyPlanNumber}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="propertyValue"
                    placeholder={t("deedRegistrationForm.propertyValue") + " (ETH)"}
                    value={formData.propertyValue || ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    name="boundaries"
                    placeholder={t("deedRegistrationForm.boundaries")}
                    value={formData.boundaries}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 sm:col-span-2"
                  />
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 bg-white"
                    required
                  >
                    <option value="">{t("deedRegistrationForm.selectDistrict")}</option>
                    {SRI_LANKA_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    disabled={!formData.district}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    required
                  >
                    <option value="">
                      {formData.district
                        ? t("deedRegistrationForm.selectDivision")
                        : t("deedRegistrationForm.selectDistrict")}
                    </option>
                    {divisionOptions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("support")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("deedRegistrationForm.supportingDetails")}
                <span>{activeSection === "support" ? "−" : "+"}</span>
              </h3>
              {activeSection === "support" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="deedNumber"
                    placeholder={t("deedRegistrationForm.deedNumber")}
                    value={formData.deedNumber}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 sm:col-span-2"
                  />

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      {t("deedRegistrationForm.uploadDeedDocument")}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deedDocument: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    />
                    {formData.deedDocument && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t("deedRegistrationForm.selected")}: {formData.deedDocument.name}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      {t("deedRegistrationForm.uploadTitleDocument")}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleDocument: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    />
                    {formData.titleDocument && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t("deedRegistrationForm.selected")}: {formData.titleDocument.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("authorities")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("deedRegistrationForm.relevantAuthorities")}
                <span>{activeSection === "authorities" ? "−" : "+"}</span>
              </h3>
              {activeSection === "authorities" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderAutocompleteInput(
                    "surveyor",
                    t("deedRegistrationForm.surveyor"),
                    surveyorSuggestions
                  )}
                  {renderAutocompleteInput("notary", t("deedRegistrationForm.notary"), notarySuggestions)}
                  {renderAutocompleteInput("IVSL", t("deedRegistrationForm.ivsl"), ivslSuggestions)}
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("payment")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                {t("deedRegistrationForm.registrationFee")}
                <span>{activeSection === "payment" ? "−" : "+"}</span>
              </h3>
              {activeSection === "payment" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("deedRegistrationForm.govFee")}:</span>
                      <span className="text-gray-900">{REGISTRATION_FEES.GOVERNMENT_FEE.toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("deedRegistrationForm.ivslFee")}:</span>
                      <span className="text-gray-900">{REGISTRATION_FEES.IVSL_FEE.toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("deedRegistrationForm.surveyFee")}:</span>
                      <span className="text-gray-900">{REGISTRATION_FEES.SURVEY_FEE.toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("deedRegistrationForm.notaryFee")}:</span>
                      <span className="text-gray-900">{REGISTRATION_FEES.NOTARY_FEE.toFixed(4)} ETH</span>
                    </div>
                    <div className="border-t border-yellow-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-bold">{t("deedRegistrationForm.totalRegistrationFee")}:</span>
                        <span className="text-green-700 font-bold text-lg">{registrationFee.toFixed(4)} ETH</span>
                      </div>
                    </div>
                  </div>
                  {paymentTxHash && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-700 font-medium mb-1">{t("deedRegistrationForm.paymentCompleted")}</p>
                      <p className="text-xs text-gray-600 font-mono break-words">TX: {paymentTxHash}</p>
                    </div>
                  )}
                  {!paymentTxHash && (
                    <p className="text-sm text-gray-600 italic">
                      {t("deedRegistrationForm.paymentRequired")}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                {t("deedRegistrationForm.cancel")}
              </button>
              <button
                type="submit"
                disabled={isPaying}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                {isPaying
                  ? t("deedRegistrationForm.processingPayment")
                  : paymentTxHash
                  ? t("deedRegistrationForm.submitForRegistration")
                  : t("deedRegistrationForm.payAndRegister")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandRegistrationPopup;
