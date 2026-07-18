import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

// Dynamically determine BASE_URL based on current hostname
// Relative URL for Nginx proxy
const getBaseUrl = () => {
  return '';
};

const BASE_URL = getBaseUrl();

export const useLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all leave requests for logged-in employee
  const getMyLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/employee/my-leave-requests");

      setLeaveRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch Leave Requests Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch leave requests");
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit new leave request
  const submitLeave = async (formData) => {
    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/employee/leave-requests",
        formData
      );

      toast.success(response.data.message || "Leave request submitted successfully!");
      // 🔁 Refresh leave list after submission
      await getMyLeaveRequests();
      return response.data;
    } catch (error) {
      console.error("Leave Submit Error:", error);
      toast.error(error.response?.data?.message || "Failed to submit leave");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Auto-fetch leave requests on mount
  useEffect(() => {
    getMyLeaveRequests();
  }, []);

  return { leaveRequests, submitLeave, getMyLeaveRequests, loading };
};
