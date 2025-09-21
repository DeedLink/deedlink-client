import { CgChevronDown } from "react-icons/cg";

interface SelectItemsProps {
    formData: {
        landSizeUnit: string;
    };
    options?: string[];
    handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const LandUnitSelectItems: React.FC<SelectItemsProps> = ({ formData, handleChange, options }) => {
    return (
        <div className="relative">
            <select
                name="landSizeUnit"
                value={formData.landSizeUnit}
                onChange={handleChange}
                className="w-full border appearance-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
            >
                <option value="" disabled>Select Land Size Unit</option>
                {options ? options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                )) : (
                    <>
                        <option value="Sqft">Square Feet (sqft)</option>
                        <option value="Sqm">Square Meters (sqm)</option>
                        <option value="Perches">Perches (perc)</option>
                        <option value="Acres">Acres (acre)</option>
                        <option value="Hectares">Hectares (hectare)</option>
                    </>
                )}
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                <CgChevronDown size={20} />
            </span>
        </div>
    );
}