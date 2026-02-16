import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { fetchWorkspaces } from "../redux/slices/workspaceSlice";
import toast from "react-hot-toast";
import useNotificationSocket from "../hooks/useNotificationSocket";
import { useWorkspaceSocket } from "../hooks/useWorkspaceSocket";

import Sidebar from "../components/Sidebar";
import MembersPanel from "../components/MembersPanel";
import KanbanBoard from "../components/KanbanBoard";
import StatisticsPanel from "../components/StatisticsPanel";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";

import {
  LogOut,
  LayoutDashboard,
  Users,
  BarChart3,
  Plus,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentWorkspace, workspaces } = useSelector(
    (state) => state.workspace
  );

  const [activeTab, setActiveTab] = useState("board");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useNotificationSocket();
  useWorkspaceSocket(currentWorkspace?._id);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (
      workspaces &&
      workspaces.length === 0 &&
      !currentWorkspace &&
      !showCreateModal
    ) {
      setShowCreateModal(true);
    }
  }, [workspaces, currentWorkspace, showCreateModal]);

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (result.type === "auth/logout/fulfilled") {
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top Navigation */}
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          
          {/* Header */}
          <div className="px-8 py-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentWorkspace?.name || "FlowSpace"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {currentWorkspace?.description ||
                  "Select a workspace to get started"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Tabs */}
          {currentWorkspace && (
            <div className="px-8 flex gap-6 border-t border-slate-200 dark:border-slate-800">
              {[
                { key: "board", label: "Board", icon: LayoutDashboard },
                { key: "statistics", label: "Statistics", icon: BarChart3 },
                { key: "members", label: "Members", icon: Users },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative flex items-center gap-2 py-3 text-sm font-semibold transition-colors ${
                    activeTab === key
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {activeTab === key && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Page Content */}
        <div className="flex-1 overflow-auto px-8 py-8">
          {currentWorkspace ? (
            <>
              {activeTab === "board" && <KanbanBoard />}
              {activeTab === "statistics" && <StatisticsPanel />}
              {activeTab === "members" && <MembersPanel />}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center rounded-xl bg-blue-500/10">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  Welcome to FlowSpace
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                  Create your first workspace to start managing projects.
                </p>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
