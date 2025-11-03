// import { useState } from "react";
// import { IoClose } from "react-icons/io5";
// import { useToast } from "../../../contexts/ToastContext";
// import { assignPoA } from "../../../web3.0/poaIntegration"; // <-- create this function in your web3.0 logic

// interface AssignPoAPopupProps {
//   isOpen: boolean;
//   tokenId: number;
//   onClose: () => void;
// }

// const AssignPoAPopup = ({ isOpen, tokenId, onClose }: AssignPoAPopupProps) => {
//   const { showToast } = useToast();

//   const [agentAddress, setAgentAddress] = useState("");
//   const [right, setRight] = useState("SIGN");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleAssign = async () => {
//     if (!agentAddress || !startDate || !endDate || !right)
//       return showToast("Please fill all fields", "info");

//     const start = Math.floor(new Date(startDate).getTime() / 1000);
//     const end = Math.floor(new Date(endDate).getTime() / 1000);

//     if (end <= start) return showToast("End date must be after start date", "info");

//     try {
//       setLoading(true);
//       const res = await assignPoA(tokenId, agentAddress, right, true, start, end);
//       showToast(res.message || "Power of Attorney assigned successfully", "success");
//       onClose();
//     } catch (err: any) {
//       console.error(err);
//       showToast(err.message || "Failed to assign Power of Attorney", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
//       >
//         <div className="flex items-center justify-between border-b pb-3">
//           <h2 className="text-xl font-bold text-gray-800">Assign Power of Attorney</h2>
//           <button onClick={onClose}>
//             <IoClose size={24} className="text-gray-600 hover:text-black" />
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">
//               Agent Address
//             </label>
//             <input
//               type="text"
//               value={agentAddress}
//               onChange={(e) => setAgentAddress(e.target.value)}
//               className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//               placeholder="0x..."
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-1">
//               Right Type
//             </label>
//             <select
//               value={right}
//               onChange={(e) => setRight(e.target.value)}
//               className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//             >
//               <option value="SIGN">SIGN</option>
//               <option value="TRANSFER">TRANSFER</option>
//               <option value="FRACTIONALIZE">FRACTIONALIZE</option>
//               <option value="PAY_RENT">PAY_RENT</option>
//             </select>
//           </div>

//           <div className="flex gap-4">
//             <div className="flex-1">
//               <label className="block text-sm font-semibold text-gray-700 mb-1">
//                 Start Date
//               </label>
//               <input
//                 type="datetime-local"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//               />
//             </div>

//             <div className="flex-1">
//               <label className="block text-sm font-semibold text-gray-700 mb-1">
//                 End Date
//               </label>
//               <input
//                 type="datetime-local"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
//               />
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={handleAssign}
//           disabled={loading}
//           className={`w-full py-3 rounded-xl font-semibold text-white ${
//             loading
//               ? "bg-gray-400"
//               : "bg-gradient-to-r from-yellow-600 to-amber-600 hover:shadow-lg"
//           }`}
//         >
//           {loading ? "Assigning..." : "Assign Power of Attorney"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AssignPoAPopup;
