import { useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getItem } from "../../storage/storage";
import { type User } from "../../types/types";
import { LandUnitSelectItems } from "../ui/LandUnitSelectItems";
import { searchUsers } from "../../api/api";
import { reg_mintNFT } from "../../offonchaincalls/calls";

const LandRegistrationPopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const { account } = useWallet();
  const [user] = useState<User | null>(getItem("session", "user"));
  const [formData, setFormData] = useState({
    ownerFullName: "",
    ownerNIC: "",
    ownerAddress: "",
    ownerPhone: "",
    landTitleNumber: "",
    landAddress: "",
    landArea: "",
    landSizeUnit: "Perches",
    landType: "",
    surveyPlanNumber: "",
    boundaries: "",
    district: "",
    division: "",
    deedNumber: "",
    notary: "",
    IVSL: "",
    surveyor: "",
    registrationDate: "",
    deedDocument: null as File | null,
    titleDocument: null as File | null,
  });
  const [activeSection, setActiveSection] = useState<string | null>("owner");

  const [surveyorSuggestions, setSurveyorSuggestions] = useState<User[]>([]);
  const [notarySuggestions, setNotarySuggestions] = useState<User[]>([]);
  const [ivslSuggestions, setIvslSuggestions] = useState<User[]>([]);

  const [activeField, setActiveField] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (["surveyor", "notary", "IVSL"].includes(name)) {
      if (value.trim().length < 2) {
        if (name === "surveyor") setSurveyorSuggestions([]);
        if (name === "notary") setNotarySuggestions([]);
        if (name === "IVSL") setIvslSuggestions([]);
        return;
      }

      setActiveField(name);

      try {
        const res = await searchUsers(value);
        const data: User[] = res;

        if (name === "surveyor") setSurveyorSuggestions(data.filter(u=>u.role==="surveyor"));
        if (name === "notary") setNotarySuggestions(data.filter(u=>u.role==="notary"));
        if (name === "IVSL") setIvslSuggestions(data.filter(u=>u.role==="IVSL"));
      } catch {
        if (name === "surveyor") setSurveyorSuggestions([]);
        if (name === "notary") setNotarySuggestions([]);
        if (name === "IVSL") setIvslSuggestions([]);
      }
    }																						
  };

  const handleSelect = (field: string, user: User) => {
    setFormData((prev) => ({ ...prev, [field]: user.name }));
    if (field === "surveyor") setSurveyorSuggestions([]);
    if (field === "notary") setNotarySuggestions([]);
    if (field === "IVSL") setIvslSuggestions([]);
    setActiveField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Land Registration Data:", formData);
    reg_mintNFT(account || "", formData);
    onClose();
  };

  const renderAutocompleteInput = (
    field: "surveyor" | "notary" | "IVSL",
    placeholder: string,
    suggestions: User[]
  ) => (
    <div className="relative">
      <input
        name={field}
        placeholder={placeholder}
        value={formData[field]}
        onChange={handleChange}
        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
      {activeField === field && suggestions.length > 0 && (
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
            Register New Land
          </h2>
          <p className="text-gray-700 text-sm mb-6 text-center">
            Please provide all required details to securely register your property.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
            <div>
              <label className="text-lg font-semibold text-green-800 mb-2 flex justify-between items-center">
                Wallet Address
              </label>
              <input
                type="text"
                disabled
                placeholder={account || "Not connected"}
                className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <h3
                onClick={() => toggleSection("owner")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                Owner Details
                <span>{activeSection === "owner" ? "−" : "+"}</span>
              </h3>
              {activeSection === "owner" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="ownerFullName"
                    disabled={true}
                    placeholder="Full Name"
                    value={formData.ownerFullName || user?.name || ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 bg-gray-100 text-gray-500"
                    required
                  />
                  <input
                    name="ownerNIC"
                    disabled={true}
                    placeholder="NIC Number"
                    value={formData.ownerNIC || user?.nic || ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 bg-gray-100 text-gray-500"
                    required
                  />
                  <input
                    name="ownerPhone"
                    placeholder="Phone Number"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    name="ownerAddress"
                    placeholder="Address"
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
                Land Details
                <span>{activeSection === "land" ? "−" : "+"}</span>
              </h3>
              {activeSection === "land" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="landTitleNumber"
                    placeholder="Title Number"
                    value={formData.landTitleNumber}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    name="landAddress"
                    placeholder="Land Address"
                    value={formData.landAddress}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    name="landArea"
                    placeholder="Land Size"
                    value={formData.landArea}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <LandUnitSelectItems
                    formData={formData}
                    handleChange={handleChange}
                  />
                  <input
                    name="landType"
                    placeholder="Land Type (e.g. Residential)"
                    value={formData.landType}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 sm:col-span-2"
                  />
                  <input
                    name="surveyPlanNumber"
                    placeholder="Survey Plan Number"
                    value={formData.surveyPlanNumber}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    name="boundaries"
                    placeholder="Boundaries (North, South, East, West)"
                    value={formData.boundaries}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 sm:col-span-2"
                  />
                  <input
                    name="district"
                    placeholder="District"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    name="division"
                    placeholder="Division / DS Division"
                    value={formData.division}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>

            <div>
              <h3
                onClick={() => toggleSection("support")}
                className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center"
              >
                Supporting Details
                <span>{activeSection === "support" ? "−" : "+"}</span>
              </h3>
              {activeSection === "support" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="deedNumber"
                    placeholder="Deed Number"
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
                      Upload Deed Document (optional)
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
                        Selected: {formData.deedDocument.name}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Upload Title Document (optional)
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
                        Selected: {formData.titleDocument.name}
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
                Relevant Authorities
                <span>{activeSection === "authorities" ? "−" : "+"}</span>
              </h3>
              {activeSection === "authorities" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderAutocompleteInput(
                    "surveyor",
                    "Surveyor",
                    surveyorSuggestions
                  )}
                  {renderAutocompleteInput("notary", "Notary", notarySuggestions)}
                  {renderAutocompleteInput("IVSL", "IVSL", ivslSuggestions)}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition"
              >
                Submit for Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandRegistrationPopup;
