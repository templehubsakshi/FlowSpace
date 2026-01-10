import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { fetchWorkspaces } from '../redux/slices/workspaceSlice';
import toast from 'react-hot-toast';

import Sidebar from '../components/Sidebar';
import MembersPanel from '../components/MembersPanel';
import KanbanBoard from '../components/KanbanBoard'; 
import StatisticsPanel from '../components/StatisticsPanel';
import { LogOut, LayoutDashboard, Users, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [activeTab, setActiveTab] = useState('board');

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (result.type === 'auth/logout/fulfilled') {
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ✅ SKIP TO MAIN CONTENT */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-8 py-4 flex justify-between items-center">
            <div className="pl-12 lg:pl-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {currentWorkspace?.name || 'Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-xs sm:max-w-none">
                {currentWorkspace?.description || 'Select a workspace'}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {currentWorkspace && (
            <div className="px-4 sm:px-8 flex gap-2 sm:gap-4 border-t overflow-x-auto">
              <button
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 ${
                  activeTab === 'board'
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Board
              </button>

              <button
                onClick={() => setActiveTab('statistics')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 ${
                  activeTab === 'statistics'
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Statistics
              </button>

              <button
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 ${
                  activeTab === 'members'
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
                Members
              </button>
            </div>
          )}
        </nav>

        {/* ✅ MAIN CONTENT TARGET */}
        <div
          id="main-content"
          className="flex-1 overflow-hidden p-4 sm:p-8"
        >
          {currentWorkspace ? (
            <>
              {activeTab === 'board' && <KanbanBoard />}
              {activeTab === 'statistics' && <StatisticsPanel />}
              {activeTab === 'members' && <MembersPanel />}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-gray-600">Create or select a workspace</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
