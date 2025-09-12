import { useState } from "react";
import { useWallet } from "../../contexts/WalletContext";

const LandRegistrationPopup = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const { account } = useWallet();
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
    notaryName: "",
    registrationDate: "",
    deedDocument: null as File | null,
    titleDocument: null as File | null,
  });

  const [activeSection, setActiveSection] = useState<string | null>("owner");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Land Registration Data:", formData);
    onClose();
  };

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
            {/* Wallet Address */}
            <div>
              <label className="text-lg font-semibold text-green-800 mb-2 flex justify-between items-center">Wallet Address</label>
              <input
                type="text"
                disabled
                placeholder={account || "Not connected"}
                className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500"
              />
            </div>

            {/* Sections */}
            {/* Owner Details */}
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
                    placeholder="Full Name"
                    value={formData.ownerFullName}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    name="ownerNIC"
                    placeholder="NIC Number"
                    value={formData.ownerNIC}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
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

            {/* Land Details */}
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
                  <select
                    name="landSizeUnit"
                    value={formData.landSizeUnit}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option>Perches</option>
                    <option>Acres</option>
                    <option>Square Feet</option>
                  </select>
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

            {/* Supporting Details */}
            <div>
                <h3 onClick={() => toggleSection("support")} className="text-lg font-semibold text-green-800 mb-2 cursor-pointer flex justify-between items-center">
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
                        name="notaryName"
                        placeholder="Notary Name"
                        value={formData.notaryName}
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

                    {/* Deed Document Upload */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Upload Deed Document (optional)</label>
                        <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                            setFormData({ ...formData, deedDocument: e.target.files?.[0] || null })
                        }
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                        />
                        {formData.deedDocument && (
                        <p className="text-xs text-gray-500 mt-1">
                            Selected: {formData.deedDocument.name}
                        </p>
                        )}
                </div>

                {/* Title Document Upload */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Upload Title Document (optional)</label>
                    <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                        setFormData({ ...formData, titleDocument: e.target.files?.[0] || null })
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


            {/* Buttons */}
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
