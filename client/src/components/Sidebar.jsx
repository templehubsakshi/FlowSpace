import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../redux/slices/workspaceSlice";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import WorkspaceSettingsModal from "./WorkspaceSettingsModal";
import ThemeToggle from "./ThemeToggle";
import { Plus, Check, Users, Settings } from "lucide-react";

/* ─── Workspace gradient palette ─── */
const WS_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#0ea5e9,#06b6d4)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#a855f7,#6366f1)',
];

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const dispatch = useDispatch();
  const { workspaces, currentWorkspace } = useSelector(s => s.workspace);
  const { user }                          = useSelector(s => s.auth);

  const [showCreateModal,   setShowCreateModal]   = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [hoveredGear,       setHoveredGear]       = useState(false);

  const handleWsChange = (ws) => {
    dispatch(setCurrentWorkspace(ws));
    onMobileClose();
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <>
      {/* ════════ SIDEBAR ════════ */}
      <aside
        style={{
          width: 220, minWidth: 220, height: '100vh',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          position: 'fixed', top: 0, left: 0, zIndex: 50,
          fontFamily: "'Inter', sans-serif",
          transform: mobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >

        {/* ── Logo ── */}
        <div style={{
          padding: '16px 16px 14px',
          display: 'flex', alignItems: 'center', gap: 9,
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{
            fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            FlowSpace
          </span>
        </div>

        {/* ── WORKSPACES label ── */}
        <div style={{
          padding: '13px 16px 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.13em', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', flexShrink: 0,
        }}>
          <span>Workspaces</span>
          <button
            onClick={() => setShowCreateModal(true)}
            title="New workspace"
            style={{
              width: 20, height: 20, borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', color: 'var(--text-tertiary)',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface3)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface2)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <Plus size={11} strokeWidth={2.5}/>
          </button>
        </div>

        {/* ── Workspace list ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '3px 0' }}>
          {workspaces.length > 0 ? workspaces.map((ws, i) => {
            const isActive = currentWorkspace?._id === ws._id;
            return (
              <div
                key={ws._id}
                onClick={() => handleWsChange(ws)}
                className="ws-item"
                style={{ background: isActive ? 'rgba(99,102,241,0.10)' : 'transparent' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: 5, bottom: 5, width: 3,
                    background: 'linear-gradient(180deg,#6366f1,#818cf8)',
                    borderRadius: '0 3px 3px 0',
                    boxShadow: '2px 0 8px rgba(99,102,241,0.5)',
                  }}/>
                )}

                {/* Workspace icon */}
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: WS_GRADIENTS[i % WS_GRADIENTS.length],
                  display: 'grid', placeItems: 'center',
                  fontWeight: 700, fontSize: 12, color: 'white',
                  boxShadow: isActive ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
                }}>
                  {ws.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + members */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: isActive ? 600 : 500, fontSize: 13,
                    letterSpacing: '-0.025em',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                  }}>
                    {ws.name}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-tertiary)',
                    marginTop: 1.5, letterSpacing: '-0.01em', lineHeight: 1,
                  }}>
                    {ws.members?.length || 0} members
                  </div>
                </div>

                {/* Settings + check for active workspace */}
                {isActive && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setShowSettingsModal(true); }}
                      title="Workspace settings"
                      onMouseEnter={() => setHoveredGear(true)}
                      onMouseLeave={() => setHoveredGear(false)}
                      style={{
                        width: 20, height: 20, borderRadius: 5,
                        background: hoveredGear
                          ? 'rgba(99,102,241,.28)'
                          : 'rgba(99,102,241,.12)',
                        border: '1px solid rgba(99,102,241,.25)',
                        display: 'grid', placeItems: 'center',
                        cursor: 'pointer', color: '#818cf8',
                        transition: 'background 0.15s', flexShrink: 0,
                      }}
                    >
                      <Settings size={10} strokeWidth={2} />
                    </button>
                    <Check size={12} color="#6366f1" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{
              padding: '24px 16px', fontSize: 12.5,
              color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.6,
            }}>
              No workspaces yet.<br/>
              <span
                onClick={() => setShowCreateModal(true)}
                style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}
              >
                Create one →
              </span>
            </div>
          )}
        </div>

        {/* ══ FOOTER ══ */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '10px 10px 12px', flexShrink: 0,
        }}>

          {/* Invite Members */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 8px', borderRadius: 8,
              color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13,
              fontWeight: 500, letterSpacing: '-0.01em',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface2)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <Users size={14} style={{ opacity: 0.75 }}/>
            Invite Members
          </div>

          {/* ✅ Theme toggle — now actually works */}
          <div style={{ padding: '5px 8px' }}>
            <ThemeToggle />
          </div>

          {/* User profile row */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 8px 4px', borderRadius: 9,
              transition: 'background 0.12s', cursor: 'default',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#6366f1,#ec4899)',
              display: 'grid', placeItems: 'center',
              fontWeight: 700, fontSize: 12, color: 'white',
              boxShadow: '0 0 0 2px rgba(99,102,241,0.3)',
            }}>
              {userInitial}
            </div>

            {/* Name + email */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.015em',
                color: 'var(--text-primary)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                lineHeight: 1.3,
              }}>
                {user?.name}
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text-tertiary)',
                letterSpacing: '-0.01em', marginTop: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                lineHeight: 1,
              }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {showCreateModal && (
        <CreateWorkspaceModal onClose={() => setShowCreateModal(false)}/>
      )}
      {showSettingsModal && currentWorkspace && (
        <WorkspaceSettingsModal onClose={() => setShowSettingsModal(false)}/>
      )}
    </>
  );
}