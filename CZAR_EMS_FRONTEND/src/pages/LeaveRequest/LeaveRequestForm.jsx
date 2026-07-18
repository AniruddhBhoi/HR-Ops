import { useState, useEffect, useRef } from "react";
import { useLeaveRequest } from "../../hooks/useLeaveRequest"; // ✅ import your hook
import { useEmployeeProfile } from "../../hooks/useEmployeeProfile"; // ✅ import profile hook
import Button from "../../components/Button";

const LeaveRequestForm = () => {
  const [formData, setFormData] = useState({
    leaveType: "fullDay",
    leaveReasonType: "casual",
    fromDate: "",
    toDate: "",
    fromTime: "",
    toTime: "",
    reason: "",
  });

  const { submitLeave, loading } = useLeaveRequest(); // ✅ use the custom hook
  const { profile, refreshProfile } = useEmployeeProfile(); // ✅ get employee profile for availableLeaves

  const toTimeRef = useRef(null);

  // Dynamically set min attribute for toTime input
  useEffect(() => {
    if (toTimeRef.current) {
      if (formData.fromDate === formData.toDate && formData.fromTime) {
        toTimeRef.current.min = formData.fromTime;
      } else {
        toTimeRef.current.min = "";
      }
    }
  }, [formData.fromDate, formData.toDate, formData.fromTime]);

  // ✅ Calculate number of leave days requested
  const calculateLeaveDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
    return diffDays;
  };

  const requestedDays = calculateLeaveDays(formData.fromDate, formData.toDate);
  const availableLeaves = profile?.availableLeaves || 0;
  const isInsufficientBalance = requestedDays > availableLeaves;
  const canApplyLeave = formData.leaveReasonType === 'siteVisit' || !isInsufficientBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitLeave(formData);
      setFormData({
        leaveType: "fullDay",
        leaveReasonType: "casual",
        fromDate: "",
        toDate: "",
        fromTime: "",
        toTime: "",
        reason: "",
      });
      // Refresh profile to update available leaves after submission
      await refreshProfile();
    } catch {
      // error handled inside hook (optional extra handling here)
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 mx-auto mt-4 sm:mt-6 md:mt-10">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
      >
        {/* Leave Type */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">Leave Type</label>
          <select
            value={formData.leaveType}
            onChange={(e) =>
              setFormData({ ...formData, leaveType: e.target.value })
            }
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="fullDay">Full Day Leave</option>
            <option value="halfDay">Half Day Leave</option>
            <option value="shortDay">Short Day Leave</option>
          </select>
        </div>

        {/* Leave Reason Type */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">Leave Reason Type</label>
          <select
            value={formData.leaveReasonType}
            onChange={(e) =>
              setFormData({ ...formData, leaveReasonType: e.target.value })
            }
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="medical">Medical Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="emergency">Emergency Leave</option>
            <option value="siteVisit">Site Visit Leave</option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">From Date</label>
          <input
            type="date"
            value={formData.fromDate}
            onChange={(e) =>
              setFormData({ ...formData, fromDate: e.target.value })
            }
            required
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">To Date</label>
          <input
            type="date"
            value={formData.toDate}
            onChange={(e) =>
              setFormData({ ...formData, toDate: e.target.value })
            }
            min={formData.fromDate}
            required
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* From Time */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">From Time</label>
          <input
            type="time"
            value={formData.fromTime}
            onChange={(e) => {
              const newFromTime = e.target.value;
              setFormData((prev) => {
                const updated = { ...prev, fromTime: newFromTime };
                // Clear toTime if it's now invalid
                if (prev.fromDate === prev.toDate && prev.toTime && prev.toTime < newFromTime) {
                  updated.toTime = "";
                }
                return updated;
              });
            }}
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* To Time */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">To Time</label>
          <input
            ref={toTimeRef}
            type="time"
            value={formData.toTime}
            onChange={(e) => {
              const newToTime = e.target.value;
              // Only allow if dates are different or toTime is after fromTime
              if (formData.fromDate !== formData.toDate || !formData.fromTime || newToTime >= formData.fromTime) {
                setFormData({ ...formData, toTime: newToTime });
              }
            }}
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Reason */}
        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700">Reason</label>
          <textarea
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            rows="3"
            required
            placeholder="Enter reason for leave..."
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 flex justify-end">
          <Button
            type="submit"
            isLoading={loading}
            variant="primary"
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base shadow-md"
          >
            Submit Leave
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;
