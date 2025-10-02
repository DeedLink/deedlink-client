import { useState, useMemo } from "react";
import type { Deed, Owner, DeedRegisterStatus } from "../../types/types";

interface DeedTableProps {
  deeds: Deed[] | undefined;
  activeTab: DeedRegisterStatus;
  onView: (deed: Deed) => void;
}

const DeedTable = ({ deeds = [], activeTab, onView }: DeedTableProps) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("Pending");
  const pageSize = 5;

  const filteredDeeds = useMemo(() => {
    return deeds
      .filter((deed) => status === activeTab)
      .filter((deed) => {
        const ownerMatches = deed.owners.some((o: Owner) =>
          o.address.toLowerCase().includes(search.toLowerCase())
        );
        return (
          deed._id.toLowerCase().includes(search.toLowerCase()) ||
          deed.deedNumber.toLowerCase().includes(search.toLowerCase()) ||
          ownerMatches
        );
      });
  }, [deeds, activeTab, search]);

  const totalPages = Math.ceil(filteredDeeds.length / pageSize);
  const paginatedDeeds = filteredDeeds.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow border border-black/5 hover:shadow-xl transition overflow-hidden">
      <div className="mt-6 w-full max-w-5xl p-6 text-black rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-green-800">
            {activeTab} Deeds
          </h2>
          <input
            type="text"
            placeholder="🔍 Search deeds..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm lg:text-base">
            <thead className="sticky top-0 bg-green-100 text-green-900">
              <tr>
                <th className="px-4 py-3 text-left">Deed ID</th>
                <th className="px-4 py-3 text-left">Deed Number</th>
                <th className="px-4 py-3 text-left">Owners</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDeeds.length > 0 ? (
                paginatedDeeds.map((deed) => (
                  <tr
                    key={deed._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium">{deed._id}</td>
                    <td className="px-4 py-3">{deed.deedNumber}</td>
                    <td className="px-4 py-3">
                      {deed.owners.map((o) => o.address).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : status === "Approved"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onView(deed)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-gray-500 italic"
                  >
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
              <div
                key={deed._id}
                className="border rounded-xl p-4 shadow-sm bg-gray-50 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-green-800">
                    {deed.owners.map((o) => o.address).join(", ")}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : status === "Approved"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Deed ID:</span> {deed._id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Deed Number:</span>{" "}
                  {deed.deedNumber}
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => onView(deed)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow-md transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">No deeds found.</p>
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
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages || totalPages === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-700" />
    </div>
  );
};

export default DeedTable;
