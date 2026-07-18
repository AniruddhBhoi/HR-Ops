import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { role } = useAuth();


  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/" },
    { id: "profile", label: "My Profile", icon: "👤", path: "/profile" },
    { id: "leave-request", label: "Leave Request", icon: "📝", path: "/leave-request" },
    { id: "holidays", label: "Holiday Calendar", icon: "📅", path: "/holiday-calendar" },
    { id: "attendance", label: "Attendance", icon: "⚙️", path: "/attendance" },

    // 👇 Admin-only items
    { id: "add-employee", label: "Employees", icon: "➕", path: "/admin/all-employees", role: "admin" },
  ];

  const filtered = menuItems.filter((item) => !item.role || item.role === role);

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-600 item-center">EMS</h2>
          {/* Close button for mobile */}
          <Button onClick={closeSidebar} variant="ghost" size="icon" className="md:hidden text-gray-500 text-2xl">
            ×
          </Button>
        </div>
        <nav className="space-y-2 flex-grow">
          {filtered.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${isActive
                  ? "bg-indigo-600 text-white scale-105"
                  : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <span>{item.icon}</span> <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
