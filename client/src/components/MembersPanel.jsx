import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeMember } from "../redux/slices/workspaceSlice";
import toast from "react-hot-toast";
import {
  Crown, Shield, User, Trash2, UserPlus,
  Users, Mail, Search, CheckCircle2, Briefcase, Calendar,
} from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";
import { useThemeColors } from "../hooks/useTheme";

const ROLES = {
  owner:  { label: "Owner",  icon: Crown,  color: '#f59e0b', bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.22)"  },
  admin:  { label: "Admin",  icon: Shield, color: '#818cf8', bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.22)"  },
  member: { label: "Member", icon: User,   color: '#94a3b8', bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.18)" },
};

const PALETTE = [
  { bg: "rgba(99,102,241,0.20)",  color: "#818cf8", glow: "rgba(99,102,241,0.30)"  },
  { bg: "rgba(16,185,129,0.20)",  color: "#34d399", glow: "rgba(16,185,129,0.30)"  },
  { bg: "rgba(245,158,11,0.20)",  color: "#fbbf24", glow: "rgba(245,158,11,0.30)"  },
  { bg: "rgba(168,85,247,0.20)",  color: "#c084fc", glow: "rgba(168,85,247,0.30)"  },
  { bg: "rgba(239,68,68,0.20)",   color: "#f87171", glow: "rgba(239,68,68,0.30)"   },
  { bg: "rgba(6,182,212,0.20)",   color: "#22d3ee", glow: "rgba(6,182,212,0.30)"   },
  { bg: "rgba(249,115,22,0.20)",  color: "#fb923c", glow: "rgba(249,115,22,0.30)"  },
  { bg: "rgba(236,72,153,0.20)",  color: "#f472b6", glow: "rgba(236,72,153,0.30)"  },
];

const avatarColor = (name = "", id = "") => {
  const hash = (name + id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
};
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const joinedText = (dateStr) => {
  if (!dateStr) return null;
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Joined today";
  if (days === 1) return "Joined yesterday";
  if (days < 30) return `Joined ${days}d ago`;
  return `Joined ${Math.floor(days / 30)}mo ago`;
};

function EmptyState({ T }) {
  return (
    <div style={{
      background: T.surfaceCard, border: `1px solid ${T.border}`,
      borderRadius: 16, boxShadow: '0 6px 28px rgba(0,0,0,0.1)',
      padding: "72px 24px", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 14, textAlign: "center",
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 16,
        background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.20)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Users size={26} color="#818cf8" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
        No workspace selected
      </h3>
      <p style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>
        Select a workspace from the sidebar.
      </p>
    </div>
  );
}

export default function MembersPanel() {
  const T = useThemeColors();
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector(s => s.workspace);
  const { user }             = useSelector(s => s.auth);
  const { tasks }            = useSelector(s => s.tasks);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [removingId, setRemovingId]           = useState(null);
  const [search, setSearch]                   = useState("");
  const [hoveredId, setHoveredId]             = useState(null);

  const taskCountByUser = useMemo(() => {
    const map = {};
    [...(tasks?.todo || []), ...(tasks?.in_progress || []), ...(tasks?.done || [])].forEach(t => {
      const uid = t.assignee?._id || t.assignee?.id;
      if (uid) map[uid] = (map[uid] || 0) + 1;
    });
    return map;
  }, [tasks]);

  const panel = {
    background: T.surfaceCard,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    boxShadow: '0 6px 28px rgba(0,0,0,0.08)',
  };

  if (!currentWorkspace) return <EmptyState T={T} />;

  const members = currentWorkspace.members || [];
  const myId    = user?.id || user?._id;
  const currentMember  = members.find(m => m.user._id === myId);
  const isAdminOrOwner = currentMember?.role === "admin" || currentMember?.role === "owner";

  const roleOrder = { owner: 0, admin: 1, member: 2 };
  const filtered  = members
    .filter(m =>
      m.user.name.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3));

  const ownerCount  = members.filter(m => m.role === "owner").length;
  const adminCount  = members.filter(m => m.role === "admin").length;
  const memberCount = members.filter(m => m.role === "member").length;

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    setRemovingId(memberId);
    const res = await dispatch(removeMember({ workspaceId: currentWorkspace._id, memberId }));
    setRemovingId(null);
    if (res.type === "workspace/removeMember/fulfilled") toast.success("Member removed");
    else toast.error(res.payload || "Failed to remove member");
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-0.03em", color: T.text, lineHeight: 1.2, margin: 0 }}>
              Team Members
            </h1>
            <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
              {members.length} member{members.length !== 1 ? "s" : ""} in{" "}
              <span style={{ color: T.text2, fontWeight: 600 }}>{currentWorkspace.name}</span>
            </p>
          </div>
          {isAdminOrOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 12, border: "none",
                cursor: "pointer", fontWeight: 700, fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
                color: "white", boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 26px rgba(99,102,241,0.50)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(99,102,241,0.35)"; }}
            >
              <UserPlus size={14} strokeWidth={2.5} />
              Invite Member
            </button>
          )}
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Owners",  value: ownerCount,  sub: "Full control",    color: '#f59e0b', bg: "rgba(245,158,11,0.10)", icon: <Crown size={16}/>  },
            { label: "Admins",  value: adminCount,  sub: "Can manage",      color: '#818cf8', bg: "rgba(99,102,241,0.10)", icon: <Shield size={16}/> },
            { label: "Members", value: memberCount, sub: "Standard access", color: T.dim,     bg: "rgba(148,163,184,0.10)", icon: <User size={16}/>  },
          ].map((s, i) => (
            <div key={i} style={{ ...panel, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.04em", lineHeight: 1.15 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Members list ── */}
        <div style={{ ...panel, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>Workspace Members</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                {filtered.length} member{filtered.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""}
              </div>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 8, background: T.s2, border: `1px solid ${T.border2}`, borderRadius: 10, padding: "7px 12px", width: 230, transition: "border-color 0.15s, box-shadow 0.15s" }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.40)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.boxShadow = "none"; }}
            >
              <Search size={13} color={T.muted} style={{ flexShrink: 0 }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search members…"
                style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 13, width: "100%", fontFamily: "'Inter', sans-serif" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 16, padding: "0 2px", lineHeight: 1 }}>×</button>}
            </div>
          </div>

          {/* Rows */}
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: T.muted, fontSize: 13 }}>
                No members match "{search}"
              </div>
            ) : filtered.map((member) => {
              const role       = ROLES[member.role] || ROLES.member;
              const RoleIcon   = role.icon;
              const av         = avatarColor(member.user.name, member.user._id);
              const isMe       = member.user._id === myId;
              const isRemoving = removingId === member.user._id;
              const isHov      = hoveredId === member.user._id;
              const taskCount  = taskCountByUser[member.user._id] || 0;
              const joined     = joinedText(member.joinedAt || member.createdAt || currentWorkspace.createdAt);

              return (
                <div key={member.user._id}
                  onMouseEnter={() => setHoveredId(member.user._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
                    borderRadius: 16,
                    background: isHov ? T.s3 : T.s2,
                    border: `1px solid ${isHov ? T.border2 : T.border}`,
                    transition: "all 0.15s",
                    boxShadow: isHov ? "0 4px 18px rgba(0,0,0,0.10)" : "none",
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%",
                      background: av.bg, border: `2px solid ${av.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, color: av.color, fontSize: 15,
                      boxShadow: isHov ? `0 0 18px ${av.glow}` : "none",
                      transition: "box-shadow 0.15s",
                    }}>
                      {initials(member.user.name)}
                    </div>
                    <span style={{
                      position: "absolute", bottom: 1, right: 1,
                      width: 11, height: 11, borderRadius: "50%",
                      background: '#10b981', border: `2px solid ${T.surface}`,
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{member.user.name}</span>
                      {isMe && (
                        <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.24)", color: '#818cf8', fontWeight: 700 }}>
                          You
                        </span>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: role.bg, border: `1px solid ${role.border}`, color: role.color, fontSize: 11, fontWeight: 700 }}>
                        <RoleIcon size={10} />
                        {role.label}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                      <Mail size={11} color={T.muted} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.user.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
                      {joined && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.muted }}>
                          <Calendar size={10} color={T.muted} />
                          {joined}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.muted }}>
                        <Briefcase size={10} color={T.muted} />
                        {taskCount} task{taskCount !== 1 ? "s" : ""} assigned
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  {isAdminOrOwner && member.role !== "owner" && !isMe && (
                    <button
                      onClick={() => handleRemove(member.user._id)}
                      disabled={isRemoving}
                      style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        border: `1px solid ${T.border}`, background: "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: isRemoving ? "not-allowed" : "pointer",
                        opacity: isRemoving ? 0.5 : 1, transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.10)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.35)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; }}
                    >
                      {isRemoving
                        ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #ef4444", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                        : <Trash2 size={13} color={T.red} />
                      }
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {members.length > 0 && (
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted }}>
                <CheckCircle2 size={13} color={T.green} />
                {members.length} total member{members.length !== 1 ? "s" : ""}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { key: "owner",  cfg: ROLES.owner,  count: ownerCount  },
                  { key: "admin",  cfg: ROLES.admin,  count: adminCount  },
                  { key: "member", cfg: ROLES.member, count: memberCount },
                ].filter(r => r.count > 0).map(({ key, cfg, count }) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 11.5, color: cfg.color, fontWeight: 600 }}>
                      <Icon size={10} />
                      {count} {cfg.label}{count !== 1 ? "s" : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {showInviteModal && <InviteMemberModal onClose={() => setShowInviteModal(false)} />}
    </>
  );
}