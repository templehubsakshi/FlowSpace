import { useEffect, useState, useCallback } from "react";
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
import CalendarView from "../components/Calendarview";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";
import NotificationDrawer from "../components/NotificationDrawer";
import FilterPanel from "../components/FilterPanel";
import { LayoutDashboard, Users, BarChart3, CalendarDays, Plus, Zap, LogOut, Bell } from "lucide-react";

const TABS = [
  { key: 'board',      label: 'Board',      Icon: LayoutDashboard },
  { key: 'statistics', label: 'Statistics', Icon: BarChart3 },
  { key: 'members',    label: 'Members',    Icon: Users },
  { key: 'calendar',   label: 'Calendar',   Icon: CalendarDays },
];

// ─── Search Bar ───────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar"
      onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
      onBlurCapture={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}>
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="Search tasks, members…" />
      {value && (
        <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', lineHeight: 1, flexShrink: 0, fontSize: 16, padding: '0 2px', display: 'flex', alignItems: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      )}
    </div>
  );
}

// ─── Icon Button with badge ────────────────────────────────────
function IconBtn({ onClick, children, badge, title }) {
  return (
    <button onClick={onClick} title={title} className="icon-btn" style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
      {children}
      {badge > 0 && (
        <div className="notif-badge" style={{ animation: badge > 0 ? 'badgePop 0.3s cubic-bezier(.34,1.56,.64,1) both' : 'none' }}>
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </button>
  );
}

export default function Dashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { currentWorkspace, workspaces } = useSelector(s => s.workspace);
  const { isConnected } = useWorkspaceSocket(currentWorkspace?._id);
  const unreadCount = useSelector(s => s.notifications?.unreadCount ?? 0);

  const [activeTab,         setActiveTab]         = useState("board");
  const [showCreateModal,   setShowCreateModal]   = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [filters,           setFilters]           = useState({ priorities: [], statuses: [], assignee: '' });
  const [sidebarOpen,       setSidebarOpen]       = useState(false);

  useNotificationSocket();

  useEffect(() => { dispatch(fetchWorkspaces()); }, [dispatch]);

  // ✅ FIX: setState in effect — this is valid, condition prevents infinite loop
  useEffect(() => {
    if (workspaces?.length === 0 && !currentWorkspace && !showCreateModal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCreateModal(true);
    }
  }, [workspaces, currentWorkspace, showCreateModal]);

  const handleLogout = useCallback(async () => {
    const r = await dispatch(logout());
    if (r.type === 'auth/logout/fulfilled') {
      toast.success('Logged out successfully');
      navigate('/login');
    }
  }, [dispatch, navigate]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ priorities: [], statuses: [], assignee: '' });
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: 13.5, lineHeight: 1.5, letterSpacing: '-0.015em', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes badgePop { from { transform:scale(0); } to { transform:scale(1); } }
        @keyframes tabSlide { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .dash-tab-content { animation: tabSlide 0.18s ease both; }

        /* ── Mobile hamburger ── */
        .mob-menu-btn {
          display: none;
          position: fixed; top: 12px; left: 12px; z-index: 70;
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--brand-primary); border: none;
          cursor: pointer; color: white;
          align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(99,102,241,0.45);
          transition: all 0.15s;
        }
        .mob-menu-btn:hover { background: var(--accent2); transform: scale(1.05); }

        /* ── Sidebar overlay ── */
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 45;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
        }

        /* ── Dashboard layout responsive ── */
        .dash-sidebar-slot { width: 220px; flex-shrink: 0; }

        @media (max-width: 900px) {
          .dash-sidebar-slot { width: 0 !important; }
          .mob-menu-btn { display: flex !important; }
          .sidebar-overlay.open { display: block; }
          .dash-header { padding: 0 14px 0 60px !important; }
          .search-bar { width: 160px !important; }
          .connected-pill span { display: none; }
          .connected-pill { padding: 4px 8px !important; }
          .logout-label { display: none; }
        }

        @media (max-width: 640px) {
          .dash-header { height: auto !important; flex-wrap: wrap; padding: 10px 14px 10px 60px !important; gap: 8px !important; }
          .search-bar { width: 100% !important; order: 10; }
          .header-actions { gap: 6px !important; }
          .tab-bar { padding: 0 10px !important; overflow-x: auto; }
          .tab-btn { padding: 8px 10px !important; font-size: 11.5px !important; }
          .tab-btn span { display: none; }
        }
      `}</style>

      {/* Mobile hamburger */}
      <button className="mob-menu-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
        {sidebarOpen
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        }
      </button>

      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar slot */}
      <div className="dash-sidebar-slot">
        <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Header ── */}
        <header className="dash-header" style={{ minHeight: 58, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentWorkspace?.name || 'FlowSpace'}
            </h1>
            {currentWorkspace && (
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, letterSpacing: '-0.01em', lineHeight: 1 }}>
                {currentWorkspace.members?.length || 0} members
              </p>
            )}
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Connection pill */}
            <div className={`connected-pill ${isConnected ? 'on' : 'off'}`}>
              <div className="dot" />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>

            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <IconBtn onClick={() => setNotificationsOpen(o => !o)} badge={unreadCount} title="Notifications">
              <Bell size={14} strokeWidth={1.8} />
            </IconBtn>

            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: "'Inter', sans-serif", background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)', color: 'var(--red)', fontSize: 12, fontWeight: 600, transition: 'all 0.15s', letterSpacing: '-0.01em', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.18)'; }}>
              <LogOut size={11} strokeWidth={2} />
              <span className="logout-label">Logout</span>
            </button>
          </div>
        </header>

        {/* ── Tab bar ── */}
        {currentWorkspace && (
          <div className="tab-bar" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 22px', display: 'flex', alignItems: 'flex-end', flexShrink: 0, gap: 2 }}>
            {TABS.map(({ key, label, Icon: TabIcon }) => {
              const active = activeTab === key;
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`tab-btn${active ? ' active' : ''}`}>
                  <TabIcon size={13} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Tab content ── */}
        {currentWorkspace ? (
          <div key={activeTab} className="dash-tab-content" style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {activeTab === 'board'      && <KanbanBoard searchQuery={searchQuery} filters={filters} onFiltersChange={setFilters} />}
            {activeTab === 'statistics' && <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}><StatisticsPanel /></div>}
            {activeTab === 'members'    && <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}><MembersPanel /></div>}
            {activeTab === 'calendar'   && <div style={{ flex: 1, overflow: 'hidden', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}><CalendarView /></div>}
          </div>
        ) : (
          /* ── Empty / Welcome state ── */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 380, padding: '0 24px' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px', background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.15)' }}>
                <Zap size={30} color="#6366f1" />
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.025em', color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 10, lineHeight: 1.25 }}>
                Welcome to FlowSpace
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 28, lineHeight: 1.7 }}>
                Create your first workspace to start collaborating and managing tasks with your team.
              </p>
              <button onClick={() => setShowCreateModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', color: 'white', fontSize: 13.5, fontWeight: 600, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em', boxShadow: '0 4px 24px rgba(99,102,241,0.45)', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.45)'; }}>
                <Plus size={15} strokeWidth={2.5} /> Create Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} />}
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
