import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar with mobile state */}
            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            {/* Mobile Overlay: visible when sidebar is open on small screens */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

      {/* Main content shifted right by sidebar width ONLY on desktop */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-64 transition-all duration-300">
        <Navbar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
