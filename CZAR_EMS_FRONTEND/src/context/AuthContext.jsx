import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // holds user info (admin/employee)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔍 Restore login session from localStorage
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to parse user:", err);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // ✅ Login: store user + token
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // ✅ Logout: clear session
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // ✅ Extract role safely (default: "Employee")
  const role = user?.role?.toLowerCase() || "employee";
  const token = localStorage.getItem("token");

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for accessing context
export const useAuth = () => useContext(AuthContext);

