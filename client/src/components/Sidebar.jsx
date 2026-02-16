import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../redux/slices/workspaceSlice";
import NotificationBell from "./NotificationBell";
import NotificationDrawer from "./NotificationDrawer";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import ThemeToggle from "./ThemeToggle";
import {
  LayoutDashboard,
  ChevronDown,
  Plus,
  Briefcase,
  Menu,
  X,
  Check,
} from "lucide-react";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { workspaces, currentWorkspace } = useSelector(
    (state) => state.workspace
  );
  const { user } = useSelector((state) => state.auth);

  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleWorkspaceChange = (workspace) => {
    dispatch(setCurrentWorkspace(workspace));
    setShowWorkspaceDropdown(false);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-xl shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-80
          bg-white dark:bg-slate-950
          text-slate-900 dark:text-slate-100
          border-r border-slate-200 dark:border-slate-800
          flex flex-col
          transition-transform duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                FlowSpace
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project Management
              </p>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className="w-full flex items-center justify-between p-3 
                       bg-slate-100 dark:bg-slate-900
                       hover:bg-slate-200 dark:hover:bg-slate-800
                       rounded-xl transition
                       border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Briefcase className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium truncate">
                {currentWorkspace?.name || "Select Workspace"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${
                showWorkspaceDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showWorkspaceDropdown && (
            <div className="mt-3 
                            bg-white dark:bg-slate-900
                            border border-slate-200 dark:border-slate-800
                            rounded-xl shadow-xl overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {workspaces.length > 0 ? (
                  workspaces.map((workspace) => (
                    <button
                      key={workspace._id}
                      onClick={() => handleWorkspaceChange(workspace)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left 
                        hover:bg-slate-100 dark:hover:bg-slate-800 transition
                        ${
                          currentWorkspace?._id === workspace._id
                            ? "bg-slate-100 dark:bg-slate-800"
                            : ""
                        }`}
                    >
                      <div className="w-8 h-8 
                                      bg-slate-200 dark:bg-slate-700
                                      rounded-lg flex items-center justify-center 
                                      text-xs font-semibold">
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {workspace.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {workspace.members?.length || 0} members
                        </p>
                      </div>

                      {currentWorkspace?._id === workspace._id && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No workspaces yet
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setShowWorkspaceDropdown(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                           bg-blue-600 hover:bg-blue-700 
                           transition text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Workspace
              </button>
            </div>
          )}
        </div>

        {/* User */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 p-3 
                          bg-slate-100 dark:bg-slate-900
                          rounded-xl 
                          border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 
                            bg-slate-300 dark:bg-slate-700
                            rounded-lg flex items-center justify-center 
                            text-sm font-semibold">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <NotificationBell
              isOpen={notificationsOpen}
              onToggle={() => setNotificationsOpen(!notificationsOpen)}
            />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {showCreateModal && (
        <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} />
      )}

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
