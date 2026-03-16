import { useState, useRef } from "react";
import { X, Send, Calendar, User, Flag, Tag, MessageSquare, Clock, Flame, AlertCircle, Zap, Circle } from "lucide-react";
import MentionDropdown from "./MentionDropdown";
import { useThemeColors } from "../hooks/useTheme";

const PRIORITY = {
  low:    { color: "#64748b", bg: "rgba(100,116,139,0.13)", border: "rgba(100,116,139,0.22)", label: "Low",    Icon: Circle },
  medium: { color: "#818cf8", bg: "rgba(99,102,241,0.13)",  border: "rgba(99,102,241,0.22)",  label: "Medium", Icon: Zap },
  high:   { color: "#fbbf24", bg: "rgba(245,158,11,0.13)",  border: "rgba(245,158,11,0.22)",  label: "High",   Icon: AlertCircle },
  urgent: { color: "#f87171", bg: "rgba(239,68,68,0.13)",   border: "rgba(239,68,68,0.22)",   label: "Urgent", Icon: Flame },
};
const STATUS = {
  todo:        { color: "#64748b", bg: "rgba(100,116,139,0.13)", border: "rgba(100,116,139,0.2)", label: "To Do" },
  in_progress: { color: "#f59e0b", bg: "rgba(245,158,11,0.13)",  border: "rgba(245,158,11,0.2)",  label: "In Progress" },
  done:        { color: "#34d399", bg: "rgba(16,185,129,0.13)",  border: "rgba(16,185,129,0.2)",  label: "Done" },
};
const TAG_PALETTE = [
  { color: "#a78bfa", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.22)" },
  { color: "#22d3ee", bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.22)"  },
  { color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.22)" },
  { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.22)" },
  { color: "#f87171", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.22)"  },
];

const Pill = ({ label, color, bg, border, icon: Icon }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:999, background:bg, color, border:`1px solid ${border||"transparent"}`, fontSize:11.5, fontWeight:700 }}>
    {Icon && <Icon size={10} />}{label}
  </span>
);

export default function TaskDetailModal({ task, onClose, onAddComment, workspaceMembers = [] }) {
  const T = useThemeColors();
  const [comment, setComment]                     = useState("");
  const [submitting, setSubmitting]               = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery]           = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [mentionedUsers, setMentionedUsers]       = useState([]);
  const inputRef = useRef(null);

  if (!task) return null;

  const priority    = PRIORITY[task.priority]  || PRIORITY.medium;
  const statusStyle = STATUS[task.status]      || STATUS.todo;
  const isOverdue   = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  const handleCommentChange = (e) => {
    const text = e.target.value;
    setComment(text);
    const cursorPos = e.target.selectionStart;
    const before = text.slice(0, cursorPos);
    const lastAt = before.lastIndexOf("@");
    if (lastAt !== -1) {
      const after = before.slice(lastAt + 1);
      if (!after.includes(" ") && !after.includes("\n")) {
        setShowMentionDropdown(true); setMentionQuery(after); setMentionStartIndex(lastAt); return;
      }
    }
    setShowMentionDropdown(false); setMentionQuery(""); setMentionStartIndex(-1);
  };

  const handleMentionSelect = (member) => {
    if (mentionStartIndex === -1) return;
    const before = comment.slice(0, mentionStartIndex);
    const after  = comment.slice(inputRef.current.selectionStart);
    setComment(`${before}@${member.name} ${after}`);
    setShowMentionDropdown(false); setMentionQuery(""); setMentionStartIndex(-1);
    if (!mentionedUsers.find(u => u._id === member._id)) setMentionedUsers([...mentionedUsers, member]);
    setTimeout(() => { inputRef.current?.focus(); const pos = before.length + member.name.length + 2; inputRef.current?.setSelectionRange(pos, pos); }, 0);
  };

  const handleSubmit = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAddComment?.(task._id, comment.trim(), mentionedUsers.map(u => u._id));
      setComment(""); setMentionedUsers([]); setShowMentionDropdown(false); setMentionQuery(""); setMentionStartIndex(-1);
    } finally { setSubmitting(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };

 
  const MetaCard = ({ icon: IconComp, label, value, color: c, bg, border }) => (
    <div style={{ background:T.s2, border:`1px solid ${T.border2}`, borderRadius:14, padding:"13px 15px", display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <IconComp size={11} color={T.muted} />
        <span style={{ fontSize:10, color:T.muted, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.09em" }}>{label}</span>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:c||T.text, background:bg||"transparent", border:border?`1px solid ${border}`:"none", padding:bg?"3px 10px":0, borderRadius:bg?999:0, width:"fit-content" }}>
        {value}
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes tdm-in { from{opacity:0;transform:translateY(18px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .tdm-scroll::-webkit-scrollbar{width:4px} .tdm-scroll::-webkit-scrollbar-track{background:transparent} .tdm-scroll::-webkit-scrollbar-thumb{background:${T.border2};border-radius:99px}
        .tdm-close:hover { background:${T.s3}!important; color:${T.text}!important; }
        .tdm-send:not(:disabled):hover { filter:brightness(1.12); transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,0.35)!important; }
        .tdm-comment-input:focus { border-color:rgba(99,102,241,0.5)!important; box-shadow:0 0 0 3px rgba(99,102,241,0.10)!important; }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.50)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 20px", overflowY:"auto" }}>

        {/* Modal */}
        <div onClick={e => e.stopPropagation()}
          style={{ width:"100%", maxWidth:940, background:T.surface, border:`1px solid ${T.border2}`, borderRadius:24, boxShadow:"0 40px 100px rgba(0,0,0,0.20), 0 0 0 1px rgba(255,255,255,0.04) inset", overflow:"hidden", animation:"tdm-in 0.22s cubic-bezier(0.22,1,0.36,1) both" }}>

          {/* Header */}
          <div style={{ padding:"22px 24px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, background:T.s2 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:priority.color, boxShadow:`0 0 0 3px ${priority.bg}`, flexShrink:0 }} />
                <span style={{ fontSize:10.5, color:T.muted, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em" }}>Task Details</span>
              </div>
              <h2 style={{ fontSize:22, fontWeight:800, color:T.text, lineHeight:1.3, letterSpacing:"-0.03em", marginBottom:12 }}>{task.title}</h2>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                <Pill label={priority.label} color={priority.color} bg={priority.bg} border={priority.border} icon={priority.Icon} />
                <Pill label={statusStyle.label} color={statusStyle.color} bg={statusStyle.bg} border={statusStyle.border} />
                {isOverdue && <Pill label="Overdue" color="#f87171" bg="rgba(239,68,68,0.13)" border="rgba(239,68,68,0.22)" />}
              </div>
            </div>
            <button onClick={onClose} className="tdm-close"
              style={{ width:36, height:36, borderRadius:11, border:`1px solid ${T.border2}`, background:T.s2, color:T.muted, cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0, transition:"all 0.15s ease" }}>
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding:"22px 24px 24px", display:"flex", flexDirection:"column", gap:22 }}>

            {/* Top grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1.15fr 0.85fr", gap:20 }}>
              {/* Left */}
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                <div>
                  <p style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.09em", color:T.muted, marginBottom:10 }}>Description</p>
                  <div style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:16, padding:"14px 16px", minHeight:90 }}>
                    <p style={{ fontSize:13.5, color:T.text2, lineHeight:1.72, whiteSpace:"pre-wrap" }}>
                      {task.description || <span style={{ color:T.muted, fontStyle:"italic" }}>No description added yet.</span>}
                    </p>
                  </div>
                </div>
                {task.tags?.length > 0 && (
                  <div>
                    <p style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.09em", color:T.muted, marginBottom:10 }}>Tags</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                      {task.tags.map((tag, i) => {
                        const c = TAG_PALETTE[i % TAG_PALETTE.length];
                        return <span key={i} style={{ padding:"4px 11px", borderRadius:999, background:c.bg, color:c.color, border:`1px solid ${c.border}`, fontSize:11.5, fontWeight:700 }}>#{tag}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — meta */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <p style={{ fontSize:10.5, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.09em", color:T.muted, marginBottom:0 }}>Details</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <MetaCard icon={Flag}     label="Priority"    value={priority.label}    color={priority.color}    bg={priority.bg}     border={priority.border} />
                  <MetaCard icon={Tag}      label="Status"      value={statusStyle.label} color={statusStyle.color} bg={statusStyle.bg}   border={statusStyle.border} />
                  <MetaCard icon={User}     label="Assigned To" value={task.assignedTo?.name||task.assignee?.name||"Unassigned"} color={task.assignee||task.assignedTo?T.text:T.muted} />
                  <MetaCard icon={Calendar} label="Due Date"    value={task.dueDate?new Date(task.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"No due date"} color={isOverdue?"#f87171":task.dueDate?T.text:T.muted} />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height:1, background:T.border }} />

            {/* Comments */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <MessageSquare size={14} color={T.dim} />
                <h3 style={{ fontSize:13.5, fontWeight:800, color:T.text }}>Comments</h3>
                {task.comments?.length > 0 && (
                  <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999, background:T.s2, color:T.dim, border:`1px solid ${T.border2}` }}>{task.comments.length}</span>
                )}
              </div>

              {/* Comment list */}
              <div className="tdm-scroll" style={{ maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:16, paddingRight:2 }}>
                {task.comments?.length > 0 ? task.comments.map((c, i) => (
                  <div key={c._id||i} style={{ background:T.s2, border:`1px solid ${T.border}`, borderRadius:16, padding:"13px 15px", display:"flex", gap:11, alignItems:"flex-start" }}>
                    <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"grid", placeItems:"center", color:"white", fontSize:11, fontWeight:800 }}>
                      {(c.author?.name||c.user?.name||"?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <span style={{ fontSize:12.5, fontWeight:700, color:T.text }}>{c.author?.name||c.user?.name||"User"}</span>
                        {c.createdAt && <span style={{ fontSize:10.5, color:T.muted, marginLeft:"auto" }}>{new Date(c.createdAt).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>}
                      </div>
                      <p style={{ fontSize:13, color:T.text2, lineHeight:1.6 }}>{c.text||c.content}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign:"center", padding:"22px 16px", borderRadius:16, background:T.s2, border:`1px solid ${T.border}`, color:T.muted, fontSize:13 }}>
                    No comments yet. Be the first to add one.
                  </div>
                )}
              </div>

              {/* Add comment */}
              {onAddComment && (
                <div style={{ position:"relative" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                    <div style={{ flex:1, position:"relative" }}>
                      <input ref={inputRef} type="text" value={comment} onChange={handleCommentChange} onKeyDown={handleKeyDown}
                        placeholder="Write a comment… (type @ to mention)"
                        className="tdm-comment-input"
                        style={{ width:"100%", height:46, borderRadius:14, border:`1.5px solid ${T.border2}`, background:T.s2, color:T.text, padding:"0 14px", fontSize:13.5, outline:"none", transition:"border-color 0.15s,box-shadow 0.15s", boxSizing:"border-box" }} />
                      {showMentionDropdown && <MentionDropdown query={mentionQuery} members={workspaceMembers} onSelect={handleMentionSelect} onClose={() => setShowMentionDropdown(false)} />}
                    </div>
                    <button onClick={handleSubmit} disabled={!comment.trim()||submitting} className="tdm-send"
                      style={{ height:46, padding:"0 20px", borderRadius:14, border:"none", flexShrink:0, background:comment.trim()?"#6366f1":T.s2, color:comment.trim()?"white":T.muted, cursor:comment.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700, transition:"all 0.18s ease", boxShadow:comment.trim()?"0 4px 14px rgba(99,102,241,0.28)":"none" }}>
                      <Send size={14} />Send
                    </button>
                  </div>
                  {mentionedUsers.length > 0 && (
                    <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
                      <span style={{ fontSize:11, color:T.muted }}>Mentioning:</span>
                      {mentionedUsers.map(u => (
                        <span key={u._id} style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:999, background:"rgba(99,102,241,0.12)", color:"#818cf8", border:"1px solid rgba(99,102,241,0.2)" }}>@{u.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
