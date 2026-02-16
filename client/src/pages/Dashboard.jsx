import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { fetchWorkspaces } from "../redux/slices/workspaceSlice";
import toast from "react-hot-toast";
import useNotificationSocket from "../hooks/useNotificationSocket";
import Sidebar from "../components/Sidebar";
import { useWorkspaceSocket } from "../hooks/useWorkspaceSocket";
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

  // ✅ FIX: Check workspace condition and set initial modal state together
  // This avoids setState in useEffect
  useEffect(() => {
    const shouldShowModal = workspaces && workspaces.length === 0 && !currentWorkspace;
    if (shouldShowModal && !showCreateModal) {
      // Use a timeout to defer state update to next tick
      const timer = setTimeout(() => setShowCreateModal(true), 0);
      return () => clearTimeout(timer);
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
  <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1e] text-slate-800 dark:text-slate-100">
    <Sidebar />

    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Top Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0f172a]/95 backdrop-blur-sm">

        {/* Header Section */}
        <div className="px-10 py-5 flex justify-between items-center">

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentWorkspace?.name || "FlowSpace"}
            </h1>

            <p className="text-base text-slate-500 dark:text-slate-300 mt-1 leading-snug">
              {currentWorkspace?.description ||
                "Select a workspace to get started"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="
              flex items-center gap-2.5 px-5 py-2.5
              bg-gradient-to-r from-red-600 to-rose-600
              hover:from-red-500 hover:to-rose-500
              text-white text-sm font-semibold
              rounded-xl
              transition-all duration-300
              shadow-lg shadow-red-600/30
              hover:shadow-red-500/40
              hover:scale-105
              active:scale-95
            "
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

        </div>

        {/* Tabs */}
        {currentWorkspace && (
          <div className="px-10 flex gap-8 border-t border-slate-200 dark:border-slate-700/50">

            {[
              { key: "board", label: "Board", icon: LayoutDashboard },
              { key: "statistics", label: "Statistics", icon: BarChart3 },
              { key: "members", label: "Members", icon: Users },
            ].map(({ key, label, icon }) => {
              const IconComponent = icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`
                    relative flex items-center gap-2.5 py-4 text-base font-semibold
                    transition-colors duration-200
                    ${
                      activeTab === key
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5" />
                  {label}

                  {activeTab === key && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-10 py-10">
        {currentWorkspace ? (
          <>
            {activeTab === "board" && <KanbanBoard />}
            {activeTab === "statistics" && <StatisticsPanel />}
            {activeTab === "members" && <MembersPanel />}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-lg px-6">

              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6 shadow-xl shadow-blue-500/10">
                <Sparkles className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>

              <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                Welcome to FlowSpace
              </h2>

              <p className="text-slate-600 dark:text-slate-300 mb-8 text-base leading-relaxed font-medium">
                Create your first workspace to start organizing tasks,
                collaborating with your team, and tracking progress.
              </p>

              <button
                onClick={() => setShowCreateModal(true)}
                className="
                  inline-flex items-center gap-3 px-6 py-3.5
                  bg-gradient-to-r from-blue-600 to-blue-500
                  hover:from-blue-500 hover:to-blue-400
                  rounded-xl text-base font-semibold
                  transition-all duration-200
                  shadow-xl shadow-blue-600/30
                  hover:shadow-blue-500/40
                  hover:scale-105
                  text-white
                "
              >
                <Plus className="w-5 h-5" />
                Create Your First Workspace
              </button>

              <p className="text-slate-500 text-sm mt-6 font-medium">
                💡 You can create multiple workspaces for different projects
              </p>
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