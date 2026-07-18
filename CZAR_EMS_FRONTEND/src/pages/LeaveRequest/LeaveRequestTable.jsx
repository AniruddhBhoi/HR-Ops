import { useState } from "react";
import { useLeaveRequest } from "../../hooks/useLeaveRequest"; // ✅ Import the custom hook
import Button from "../../components/Button";

const LeaveRequestTable = ({ leaveRequests: propsLeaveRequests, loading: propsLoading }) => {
  const { leaveRequests: hookLeaveRequests, loading: hookLoading } = useLeaveRequest();

  const leaveRequests = propsLeaveRequests || hookLeaveRequests || [];
  const loading = propsLoading !== undefined ? propsLoading : hookLoading;
  const [selectedReason, setSelectedReason] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading leave requests...⏳
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-blue-600">
        My Leave Requests
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Type", "From", "To", "Reason", "Status"].map((head) => (
                <th
                  key={head}
                  className="border border-gray-200 p-3 text-left font-medium text-gray-600 whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {leaveRequests.length > 0 ? (
              leaveRequests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="border p-3 whitespace-nowrap">{r.leaveType}</td>
                  <td className="border p-3 whitespace-nowrap">
                    {new Date(r.fromDate).toLocaleDateString()}
                  </td>
                  <td className="border p-3 whitespace-nowrap">
                    {new Date(r.toDate).toLocaleDateString()}
                  </td>
                  <td
                    className="border p-3 cursor-pointer"
                    onClick={() => setSelectedReason(r.reason)}
                  >
                    <div className="line-clamp-2 hover:text-blue-600 transition-colors" title="Click to view full reason">
                      {r.reason}
                    </div>
                  </td>
                  <td className="border p-3 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${r.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : r.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reason Modal */}
      {selectedReason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedReason(null)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 h-8 w-8 text-2xl"
              onClick={() => setSelectedReason(null)}
            >
              &times;
            </Button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Full Reason
            </h3>
            <div className=" overflow-y-auto text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selectedReason}
            </div>
            <div className="mt-6 text-right">
              <Button
                variant="primary"
                onClick={() => setSelectedReason(null)}
                className="px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestTable;
