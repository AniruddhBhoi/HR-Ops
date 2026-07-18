import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../Layout/MainLayout";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import LeaveRequestPage from "../pages/LeaveRequest/LeaveRequestPage";
import HolidayCalendarPage from "../pages/HolidayCalendar/HolidayCalendarPage";
import Attendance from "../pages/Attendance/Attendance";
import SalarySlip from "../pages/SalarySlips/SalarySlip";
import ErrorComponent from "../components/ErrorComponent";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/Login/ForgotPassword";

import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";
import { Toaster } from "react-hot-toast";
import AllLeaveRequests from "../pages/LeaveRequest/AllLeaveRequest"


// ✅ Admin Pages
import AddEmployeePage from "../pages/Employee/AddEmployeePage";
import EmployeeListPage from "../pages/Employee/EmployeeListPage";
import ErrorBoundary from "../components/ErrorBoundary";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          {/* 🔥 Global Toast Setup */}
          <Toaster
            position="top-right"
            toastOptions={{
              success: {
                style: { background: "#d1fae5", color: "#065f46" },
                iconTheme: { primary: "#059669", secondary: "#ffffff" },
              },
              error: {
                style: { background: "#fee2e2", color: "#991b1b" },
                iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
              },
            }}
          />
          <ErrorBoundary>

            <Routes>
              {/* 🌐 Public Routes */}
              <Route path="/login" element={<Login />} />


              {/* 🔒 Protected App Routes (uses MainLayout for all roles) */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }
              >
                {/* Shared Pages */}
                <Route path="" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="leave-request" element={<LeaveRequestPage />} />
                <Route path="holiday-calendar" element={<HolidayCalendarPage />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="all-requests" element={<AllLeaveRequests />} />
                <Route path="salary-slips" element={<SalarySlip />} />

                {/* 👑 Admin-only Pages */}
                <Route
                  path="admin/add-employee"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <AddEmployeePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/manage-holidays"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <HolidayCalendarPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/all-employees"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <EmployeeListPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="*"
                  element={<ErrorComponent message="Page not found" />}
                />
              </Route>

              {/* 🔁 Redirect unknown routes to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ErrorBoundary>

        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
