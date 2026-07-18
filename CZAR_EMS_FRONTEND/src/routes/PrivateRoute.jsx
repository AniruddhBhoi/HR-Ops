import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  // 🚫 Not logged in
  if (!user) {
    // toast.error("Please log in to continue");
    return <Navigate to="/login" replace />;
  }

  // 🚫 Role not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    toast.error("Access denied — Admins only!");
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return children;
}
