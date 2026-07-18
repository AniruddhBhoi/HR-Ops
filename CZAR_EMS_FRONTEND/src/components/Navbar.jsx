import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "./LogoutModal";
import Button from "./Button";

import NotificationDropdown from "./NotificationDropdown";
import { useNotification } from "../context/NotificationContext";

const Navbar = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get initials for avatar
  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U";

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 md:px-6 py-3 relative">
      {/* Left side: Hamburger (Mobile) */}
      <Button onClick={onMenuClick} variant="ghost" size="icon" className="md:hidden text-gray-600 text-2xl">
        ☰
      </Button>

      {/* Right side: User info (Justify end on desktop, but we use justify-between for mobile layout) */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notification */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-lg text-gray-600 hover:text-blue-600 transition relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
          <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>

        {/* User profile + logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role || "user"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow-md">
            {initials}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={() => setShowLogoutModal(true)}
          variant="danger"
          size="sm"
          className="text-sm font-medium px-3 py-1.5 border-none"
        >
          Logout
        </Button>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
};

export default Navbar;
