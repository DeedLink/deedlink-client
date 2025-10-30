import { useState, useMemo, useEffect } from "react";
import type { Owner, DeedRegisterStatus } from "../../types/types";
import { getSignatures } from "../../web3.0/contractService";
import type { IDeed } from "../../types/responseDeed";

interface ISignatures {
  surveyor: boolean;
  notary: boolean;
  ivsl: boolean;
  fully: boolean;
}

type DeedWithSigs = IDeed & {
  signatures?: ISignatures;
  registerStatus?: DeedRegisterStatus | "Pending" | "Approved" | "Rejected" | "All";
};

interface DeedTableProps {
  deeds: IDeed[] | undefined;
  activeTab: DeedRegisterStatus | "All" | "Approved" | "Pending" | "Rejected";
  onView: (deed: IDeed) => void;
}

const pageSize = 5;

const deriveRegisterStatus = (sigs?: ISignatures): "Approved" | "Pending" => {
  if (!sigs) return "Pending";
  if (sigs.fully) return "Approved";
  return "Pending";
};

const DeedTable = ({ deeds = [], activeTab, onView }: DeedTableProps) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deedsWithSigs, setDeedsWithSigs] = useState<DeedWithSigs[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadSignatures = async () => {
      if (!deeds || deeds.length === 0) {
        if (mounted) setDeedsWithSigs([]);
        return;
      }

      const results = await Promise.all(
        deeds.map(async (d) => {
          try {
            const sigs: ISignatures =
              d.tokenId !== undefined && d.tokenId !== null
                ? await getSignatures(d.tokenId)
                : { surveyor: false, notary: false, ivsl: false, fully: false };

            const status = deriveRegisterStatus(sigs);
            return { ...d, signatures: sigs, registerStatus: status } as DeedWithSigs;
          } catch (err) {
            const sigs = { surveyor: false, notary: false, ivsl: false, fully: false };
            return { ...d, signatures: sigs, registerStatus: deriveRegisterStatus(sigs) } as DeedWithSigs;
          }
        })
      );

      if (mounted) setDeedsWithSigs(results);
    };

    loadSignatures();
    return () => {
      mounted = false;
    };
  }, [deeds]);

  const filteredDeeds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deedsWithSigs.filter((d) => {
      if (activeTab !== "All" && d.registerStatus !== (activeTab as any)) return false;

      if (!q) return true;
      const ownerMatches = d.owners.some((o: Owner) => o.address.toLowerCase().includes(q));
      const idMatches = (d._id || "").toLowerCase().includes(q);
      const numberMatches = (d.deedNumber || "").toLowerCase().includes(q);
      return ownerMatches || idMatches || numberMatches;
    });
  }, [deedsWithSigs, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredDeeds.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedDeeds = filteredDeeds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusBadgeClasses = (status?: string) =>
    status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "Approved"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="w-full">
      <div className="w-full p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h2 className="text-xl font-bold text-gray-900">{activeTab} Deeds</h2>
          <input
            type="text"
            placeholder="🔍 Search deeds..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Deed Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDeeds.length > 0 ? (
                paginatedDeeds.map((deed) => (
                  <tr key={deed._id} className="border-b border-gray-100 hover:bg-emerald-50 transition">
                    <td className="px-4 py-4 font-medium text-gray-900">{deed.deedNumber}</td>
                    <td className="px-4 py-4 text-gray-700">{deed.district}</td>
                    <td className="px-4 py-4 text-gray-700">{deed.ownerFullName}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClasses(deed.registerStatus)}`}>
                        {deed.registerStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => onView(deed)} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No deeds found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {paginatedDeeds.length > 0 ? (
            paginatedDeeds.map((deed) => (
              <div key={deed._id} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-emerald-50 transition">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900">{deed.ownerFullName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClasses(deed.registerStatus)}`}>
                    {deed.registerStatus || "Pending"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Deed Number:</span> {deed.deedNumber}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-semibold">Location:</span> {deed.district}
                </p>
                <button 
                  onClick={() => onView(deed)} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-md transition"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No deeds found.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-4 py-2 rounded-md transition ${
                currentPage === 1 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-4 py-2 rounded-md transition ${
                currentPage === totalPages || totalPages === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeedTable;