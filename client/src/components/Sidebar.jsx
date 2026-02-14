import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import NotificationDrawer from "./NotificationDrawer";

export default function Sidebar() {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(true);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false); // 🔔 ADD

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Tasks", path: "/tasks" },
    { name: "Analytics", path: "/analytics" },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`h-screen bg-[#0F172A] text-white flex flex-col
        ${isOpen ? "w-64" : "w-20"} transition-all duration-300`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-lg font-semibold">
            {isOpen ? "FlowSpace" : "FS"}
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white"
          >
            ☰
          </button>
        </div>

        {/* Workspace */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className="w-full text-left text-sm text-gray-300 hover:text-white"
          >
            Workspace ▾
          </button>

          {showWorkspaceDropdown && (
            <div className="mt-2 space-y-2 text-sm text-gray-400">
              <p className="cursor-pointer hover:text-white">My Workspace</p>
              <p className="cursor-pointer hover:text-white">Team Workspace</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-sm
              ${
                location.pathname === item.path
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* 🔔 FOOTER WITH NOTIFICATION BELL */}
        <div className="border-t border-gray-800 p-4 space-y-3">

          <NotificationBell
            isOpen={notificationsOpen}
            onToggle={() => setNotificationsOpen(!notificationsOpen)}
          />

          <p className="text-xs text-gray-500 text-center">
            FlowSpace v1.0.0
          </p>
        </div>
      </aside>

      {/* 🔔 NOTIFICATION DRAWER (OUTSIDE SIDEBAR) */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
