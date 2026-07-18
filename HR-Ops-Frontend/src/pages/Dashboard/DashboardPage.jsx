import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useEmployeeProfile } from "../../hooks/useEmployeeProfile";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
// import Button from "../../components/Button";

const DashboardPage = () => {
  const { profile: employeeProfile, loading } = useEmployeeProfile();
  const { role } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [employeesOnLeave, setEmployeesOnLeave] = useState([]);
  const [expandedReasons, setExpandedReasons] = useState({});
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    onLeaveToday: 0,
    leaveRequests: [], // This will hold PENDING requests
    upcomingBirthdays: [],
    attendanceSummary: { present: 0, absent: 0 },
  });

  // ✅ Fetch admin dashboard data (only if role = admin)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axiosInstance.get("/admin/admin-dashboard");
        setAdminStats(response.data);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
      }
    };
    if (role === "admin") fetchAdminData();
  }, [role]);

  // ✅ Fetch employees on leave today
  const fetchEmployeesOnLeave = async () => {
    try {
      const response = await axiosInstance.get("/admin/leave-requests");
      const allRequests = response.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeLeaves = allRequests.filter(request => {
        if (request.status !== "Approved") return false;
        const fromDate = new Date(request.fromDate);
        const toDate = new Date(request.toDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return today >= fromDate && today <= toDate;
      });

      setEmployeesOnLeave(activeLeaves);
    } catch (err) {
      console.error("Error fetching employees on leave:", err);
      setEmployeesOnLeave([]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading dashboard...⏳
      </div>
    );
  }

  if (role !== "admin" && !employeeProfile) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        No profile found.
      </div>
    );
  }

  // ---------------- ADMIN DASHBOARD ----------------
  if (role === "admin") {
    const { totalEmployees, onLeaveToday, leaveRequests, upcomingBirthdays } = adminStats;

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header */}
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1">
              Welcome, Admin 👋
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Here's what's happening today.</p>
          </div>

          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { title: "Total Employees", value: totalEmployees, color: "bg-blue-500", icon: "👥" },
              { title: "On Leave Today", value: onLeaveToday, color: "bg-yellow-500", icon: "🏖️" },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  if (item.title === "Total Employees") navigate("/admin/all-employees");
                  else if (item.title === "On Leave Today") {
                    setShowLeaveModal(true);
                    fetchEmployeesOnLeave();
                  }
                }}
                className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg transform hover:scale-105 transition cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{item.title}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{item.value}</p>
                  </div>
                  <div className={`${item.color} p-2 sm:p-3 rounded-full text-white text-lg sm:text-xl`}>
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Leave Requests Section */}
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
              Pending Leave Requests
            </h3>
            {!leaveRequests || leaveRequests.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">No pending leave requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-2 sm:p-3 text-left uppercase">Employee</th>
                      <th className="p-2 sm:p-3 text-left uppercase hidden sm:table-cell">Type</th>
                      <th className="p-2 sm:p-3 text-left uppercase">Dates</th>
                      <th className="p-2 sm:p-3 text-left uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-2 sm:p-3 font-medium">{r.employeeName || r.employeeId?.name}</td>
                        <td className="p-2 sm:p-3 hidden sm:table-cell">{r.leaveType}</td>
                        <td className="p-2 sm:p-3">
                          {new Date(r.fromDate).toLocaleDateString()} - {new Date(r.toDate).toLocaleDateString()}
                        </td>
                        <td className="p-2 sm:p-3 text-yellow-600 font-semibold">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Birthdays */}
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
              Upcoming Birthdays 🎂
            </h3>
            {!upcomingBirthdays || upcomingBirthdays.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">No upcoming birthdays.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingBirthdays.map((emp, i) => (
                  <li key={i} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium text-gray-700">{emp.name}</span>
                    <span className="text-gray-500 text-sm">{emp.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Modal for Employees On Leave Today */}
          {showLeaveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/20" onClick={() => setShowLeaveModal(false)}></div>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-gray-800">Employees On Leave Today ({employeesOnLeave.length})</h3>
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  {employeesOnLeave.length === 0 ? (
                    <p className="text-center text-gray-500">No one is on Leave Today</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employeesOnLeave.map((emp, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{emp.employeeId?.name || "Employee"}</td>
                            <td className="py-2">{emp.leaveType}</td>
                            <td className="py-2 text-gray-600">{emp.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- EMPLOYEE DASHBOARD ----------------
  const { leaveRequests: empLeaves = [], availableLeaves = 0 } = employeeProfile || {};

  const empSummary = {
    pending: empLeaves.filter(r => r.status === "Pending").length,
    approved: empLeaves.filter(r => r.status === "Approved" && r.leaveReasonType?.toLowerCase() !== "sitevisit").length,
    rejected: empLeaves.filter(r => r.status === "Rejected").length,
  };

  const totalApprovedDays = empLeaves
    .filter(r => r.status === "Approved" && r.leaveReasonType?.toLowerCase() !== "sitevisit")
    .reduce((sum, r) => sum + (r.days || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-600">Hello, {employeeProfile.name}!</h2>
          <p className="text-gray-600">Welcome to your dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-500 text-bold">Available Leave</p>
            <p className="text-3xl font-bold text-blue-600">{availableLeaves} days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-500 text-bold">Approved Leave</p>
            <p className="text-3xl font-bold text-green-600">{totalApprovedDays} days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-500 text-bold">Unpaid Leave</p>
            <p className="text-3xl font-bold text-red-600">
              {Math.max(0, totalApprovedDays - availableLeaves)} days
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Pending  Request", val: empSummary.pending, color: "text-yellow-600" },
            { label: "Approved  Request", val: empSummary.approved, color: "text-green-600" },
            { label: "Rejected Request", val: empSummary.rejected, color: "text-red-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-gray-500 text-xs uppercase">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;