// 📂 src/hooks/useEmployeeProfile.js

import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

// ✅ Hook to fetch employee profile
export const useEmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/employee/profile");
      // Handle different response structures
      const profileData = res.data?.employee || res.data?.data || res.data;
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, setProfile, refreshProfile: fetchProfile };
};

// ✅ Add New Employee
export const addNewEmployee = async (formData) => {
  try {
    const res = await axiosInstance.post("/admin/add-employee", formData);
    toast.success(res.data.message || "Employee created successfully");
    return res.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    toast.error(error.response?.data?.message || "Failed to create employee");
    throw error;
  }
};

// ✅ Fetch All Employees (Admin)
export const useEmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/admin/users", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employee list:", error);
      toast.error("Failed to load employee list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, refresh: fetchEmployees };
};
