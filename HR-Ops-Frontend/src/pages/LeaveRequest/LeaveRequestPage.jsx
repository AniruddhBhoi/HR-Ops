
import { useEffect, useState } from "react";
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveRequestTable from "./LeaveRequestTable";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";

const LeaveRequestPage = () => {
  const { role, token } = useAuth();
  const [activeTab, setActiveTab] = useState("form"); // 'form' or 'list'
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch leave requests based on role
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        let endpoint =
          role === "admin" ? "/admin/leave-requests" : "/employee/my-leave-requests";
        const res = await axiosInstance.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(res);

        setLeaveRequests(res.data || []);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, [role, token]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ✅ Employee: handle new request submission
  const handleNewRequest = async (newRequest) => {
    try {
      const res = await axiosInstance.post("/employee/leave-requests", newRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests((prev) => [...prev, res.data.leaveRequest]);
      setActiveTab("list");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert("Failed to submit leave request.");
    }
  };
  // ✅ Admin: review request (approve/reject)
  const handleReview = async (id, status) => {
    try {
      await axiosInstance.put(
        `/admin/leave-requests/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from list immediately after review
      setLeaveRequests((prev) => prev.filter((req) => req._id !== id));

      // Show success message
      setSuccessMessage(`Leave request ${status.toLowerCase()}d successfully!`);
    } catch (error) {
      console.error("Error reviewing leave request:", error);
      alert("Failed to update leave request.");
    }
  };


  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading leave requests...⏳
      </div>
    );
  }

  // ---------------- EMPLOYEE VIEW ----------------
  if (role === "employee") {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="space-y-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Leave Requests</h1>
              <p className="text-blue-100">Submit and manage your leave requests.</p>
            </div>

            {/* Toggle Button */}
            <div className="w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => setActiveTab(activeTab === "form" ? "list" : "form")}
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-medium rounded-lg transition backdrop-blur-sm border border-white/30"
              >
                {activeTab === "form" ? "📋 View Requests" : "➕ Submit Leave"}
              </Button>
            </div>
          </div>

          {/* Conditional Rendering */}
          {activeTab === "form" ? (
            <LeaveRequestForm onSubmit={handleNewRequest} />
          ) : (
            <LeaveRequestTable leaveRequests={leaveRequests} />
          )}
        </div>
      </div>
    );
  }


  // ✅ Filter only pending requests
  if (role === "admin") {
    const pendingRequests = leaveRequests.filter((req) => req.status === "Pending");

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="space-y-6 md:space-y-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Pending Leave Requests</h1>
              <p className="text-blue-100">
                Review and approve or reject employee leave requests.
              </p>
            </div>
            <Button
              variant="ghost"
              className="px-4 py-2 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition w-full sm:w-auto"
              onClick={() => navigate("/all-requests")}
            >
              📋 View All Requests
            </Button>
          </div>

          {/* Success Message - Top Right */}
          {successMessage && (
            <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md max-w-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Leave Requests Table */}
          {pendingRequests.length === 0 ? (
            <div className="text-center text-gray-500 py-20 text-lg font-medium">
              No Leave Requests for now
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    {[
                      "Employee",
                      "Leave Type",
                      "Reason Type",
                      "From Date",
                      "To Date",
                      "From Time",
                      "To Time",
                      "Reason",
                      "Action",
                    ].map((head) => (
                      <th key={head} className="p-3 text-left whitespace-nowrap">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr
                      key={req._id}
                      className="border-t hover:bg-gray-50 transition duration-150"
                    >
                      <td className="p-3 whitespace-nowrap">
                        {req.employeeId?.name || "Unknown"}
                      </td>
                      <td className="p-3 capitalize whitespace-nowrap">{req.leaveType}</td>
                      <td className="p-3 capitalize whitespace-nowrap">{req.leaveReasonType || "N/A"}</td>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(req.fromDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {new Date(req.toDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {req.fromTime || "N/A"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {req.toTime || "N/A"}
                      </td>
                      <td className="p-3 cursor-pointer" onClick={() => setSelectedReason(req.reason)}>
                        <div className="line-clamp-3 hover:text-blue-600 transition-colors" title="Click to view full reason">
                          {req.reason}
                        </div>
                      </td>
                      <td className="p-3 flex gap-2 whitespace-nowrap">
                        <Button
                          onClick={() => handleReview(req._id, "Approved")}
                          variant="success"
                          size="sm"
                          className="px-3 py-1 text-xs"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(req._id, "Rejected")}
                          variant="danger"
                          size="sm"
                          className="px-3 py-1 text-xs"
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                <div className="max-h-[60vh] overflow-y-auto text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedReason}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }


  return null;
};

export default LeaveRequestPage;
