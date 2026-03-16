import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../redux/slices/taskSlice";
import { useSocket } from "../hooks/Usesocket";
import toast from "react-hot-toast";
import {
  X, Plus, Calendar, Tag, User, Flame, AlertCircle,
  Zap, Circle, Check, Loader2, AlignLeft, Type,
} from "lucide-react";
import { useThemeColors } from "../hooks/useTheme";

const PRIORITIES = [
  { value: "low",    label: "Low",    color: "#64748b", bg: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.3)",  glow: "rgba(100,116,139,0.18)", Icon: Circle     },
  { value: "medium", label: "Medium", color: "#818cf8", bg: "rgba(99,102,241,0.16)",  border: "rgba(99,102,241,0.32)",  glow: "rgba(99,102,241,0.22)",  Icon: Zap        },
  { value: "high",   label: "High",   color: "#fbbf24", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.3)",   glow: "rgba(245,158,11,0.18)",  Icon: AlertCircle },
  { value: "urgent", label: "Urgent", color: "#f87171", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.3)",    glow: "rgba(239,68,68,0.18)",   Icon: Flame       },
];

const STATUSES = [
  { value: "todo",        label: "To Do",       color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.28)", glow: "rgba(148,163,184,0.14)" },
  { value: "in_progress", label: "In Progress", color: "#fbbf24", bg: "rgba(245,158,11,0.13)",  border: "rgba(245,158,11,0.28)",  glow: "rgba(245,158,11,0.16)"  },
  { value: "done",        label: "Done",        color: "#34d399", bg: "rgba(16,185,129,0.13)",  border: "rgba(16,185,129,0.28)",  glow: "rgba(16,185,129,0.16)"  },
];

const TAG_COLORS = [
  { color: "#a78bfa", bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.3)" },
  { color: "#22d3ee", bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.3)"  },
  { color: "#34d399", bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.3)" },
  { color: "#fbbf24", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.3)" },
  { color: "#f87171", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.3)"  },
  { color: "#818cf8", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)" },
];

const SectionLabel = ({ icon: Icon, children, required, T }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.11em", color: T.muted, marginBottom: 8 }}>
    {Icon && <Icon size={10} color={T.muted} />}
    {children}
    {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
  </label>
);

const PillSelector = ({ options, value, onChange, disabled }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map((opt) => {
      const active = value === opt.value;
      const Icon = opt.Icon;
      return (
        <button key={opt.value} type="button" onClick={() => !disabled && onChange(opt.value)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, cursor: disabled ? "not-allowed" : "pointer", border: `1.5px solid ${active ? opt.border : "rgba(255,255,255,0.08)"}`, background: active ? opt.bg : "rgba(255,255,255,0.03)", color: active ? opt.color : "#94a3b8", fontSize: 12, fontWeight: 700, outline: "none", opacity: disabled ? 0.5 : 1, transition: "all 0.18s ease", boxShadow: active ? `inset 0 0 0 1px ${opt.glow}, 0 6px 18px ${opt.glow}` : "none", transform: active ? "translateY(-1px)" : "translateY(0)" }}>
          {Icon && <Icon size={11} />}
          {opt.label}
          {active && <span style={{ width: 14, height: 14, borderRadius: "50%", background: opt.color, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={8} color="#000" strokeWidth={3.5} /></span>}
        </button>
      );
    })}
  </div>
);

export default function CreateTaskModal({ initialStatus = "todo", initialDueDate = "", onClose }) {
  const T = useThemeColors();
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((s) => s.workspace);
  const { socket } = useSocket();

  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput]   = useState("");
  const [formData, setFormData]   = useState({ title: "", description: "", status: initialStatus, priority: "medium", assignee: "", dueDate: initialDueDate, tags: [] });

  const titleRef = useRef(null);
  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 140); }, []);

  const setField = (key, val) => setFormData((f) => ({ ...f, [key]: val }));

  const addTag = () => {
    const val = tagInput.trim().toLowerCase().replace(/^#+/, "");
    if (!val) return;
    const incoming = val.split(",").map((t) => t.trim()).filter(Boolean);
    setField("tags", [...new Set([...formData.tags, ...incoming])]);
    setTagInput("");
  };
  const removeTag = (tag) => setField("tags", formData.tags.filter((t) => t !== tag));
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && !tagInput && formData.tags.length) setField("tags", formData.tags.slice(0, -1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Task title is required"); return; }
    setIsLoading(true);
    const taskData = { title: formData.title.trim(), description: formData.description.trim(), status: formData.status, priority: formData.priority, workspaceId: currentWorkspace._id, tags: formData.tags };
    if (formData.assignee) taskData.assignee = formData.assignee;
    if (formData.dueDate)  taskData.dueDate  = formData.dueDate;
    const result = await dispatch(createTask(taskData));
    setIsLoading(false);
    if (result.type === "tasks/create/fulfilled") {
      if (socket) socket.emit("task:create", { workspaceId: currentWorkspace._id, task: result.payload });
      toast.success("Task created!");
      setTimeout(onClose, 300);
    } else {
      toast.error(result.payload || "Failed to create task");
    }
  };

  const selectedMember = currentWorkspace?.members?.find((m) => m.user._id === formData.assignee);
  const today = new Date().toISOString().split("T")[0];
  const canSubmit = formData.title.trim() && !isLoading;

  // Card wrapper uses T.s2 in light, dark surface in dark
  const cardBg     = T.s2;
  const cardBorder = T.border;
  const inputBg    = T.s3;
  const inputBorderColor = T.border2;

  return (
    <>
      <style>{`
        @keyframes ctm-backdrop { from{opacity:0} to{opacity:1} }
        @keyframes ctm-in { from{opacity:0;transform:translateY(28px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ctm-spin { to{transform:rotate(360deg)} }
        .ctm-input { width:100%; background:${inputBg}; border:1.5px solid ${inputBorderColor}; border-radius:12px; color:${T.text}; font-size:13.5px; font-family:inherit; outline:none; box-sizing:border-box; transition:border-color 0.2s,box-shadow 0.2s,background 0.2s; }
        .ctm-input::placeholder { color:${T.muted}; }
        .ctm-input:focus { border-color:rgba(99,102,241,0.45)!important; box-shadow:0 0 0 4px rgba(99,102,241,0.10)!important; }
        .ctm-scroll::-webkit-scrollbar{width:3px} .ctm-scroll::-webkit-scrollbar-track{background:transparent} .ctm-scroll::-webkit-scrollbar-thumb{background:${T.border2};border-radius:99px}
        select option { background:${T.s2}; color:${T.text}; }
      `}</style>

      {/* Backdrop */}
      <div onClick={!isLoading ? onClose : undefined}
        style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px", animation:"ctm-backdrop 0.22s ease both" }}>

        {/* Modal */}
        <div onClick={(e) => e.stopPropagation()}
          style={{ position:"relative", width:"100%", maxWidth:660, background:T.surface, borderRadius:26, border:`1px solid ${T.border2}`, boxShadow:"0 60px 130px rgba(0,0,0,0.25), 0 24px 48px rgba(0,0,0,0.15)", overflow:"hidden", animation:"ctm-in 0.28s cubic-bezier(0.22,1,0.36,1) both" }}>

          {/* Top accent line */}
          <div style={{ position:"absolute", top:0, left:"8%", right:"8%", height:1, background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.55),rgba(139,92,246,0.4),transparent)", zIndex:3 }} />

          {/* Header */}
          <div style={{ padding:"28px 28px 22px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:15 }}>
              <div style={{ width:46, height:46, borderRadius:15, background:"linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.18))", border:"1px solid rgba(99,102,241,0.30)", display:"grid", placeItems:"center", boxShadow:"0 12px 30px rgba(99,102,241,0.20)", flexShrink:0 }}>
                <Plus size={19} color="#818cf8" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                  <p style={{ fontSize:10, fontWeight:800, color:T.muted, textTransform:"uppercase", letterSpacing:"0.12em" }}>New Task</p>
                  <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:999, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)", color:"#818cf8" }}>{currentWorkspace?.name || "Workspace"}</span>
                </div>
                <h2 style={{ fontSize:19, fontWeight:800, color:T.text, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:5 }}>Create Task</h2>
                <p style={{ fontSize:12, color:T.muted, lineHeight:1.4 }}>Create and organize a new task for this workspace.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} disabled={isLoading}
              style={{ width:36, height:36, borderRadius:11, border:`1px solid ${T.border2}`, background:T.s2, color:T.muted, cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0, transition:"all 0.18s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background=T.s3; e.currentTarget.style.color=T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background=T.s2; e.currentTarget.style.color=T.muted; }}>
              <X size={15} />
            </button>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit}>
            <div className="ctm-scroll" style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:12, maxHeight:"calc(100vh - 250px)", overflowY:"auto" }}>

              {/* Basic Info */}
              <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <SectionLabel icon={Type} required T={T}>Title</SectionLabel>
                  <input ref={titleRef} type="text" value={formData.title} onChange={(e) => setField("title", e.target.value)} maxLength={200} disabled={isLoading} placeholder="e.g. Design homepage mockup" className="ctm-input" style={{ padding:"12px 15px", fontSize:14 }} />
                </div>
                <div>
                  <SectionLabel icon={AlignLeft} T={T}>Description</SectionLabel>
                  <textarea value={formData.description} onChange={(e) => setField("description", e.target.value)} rows={3} maxLength={2000} disabled={isLoading} placeholder="Add more context, links, or notes about this task…" className="ctm-input" style={{ padding:"12px 15px", resize:"vertical", minHeight:86, lineHeight:1.7 }} />
                </div>
              </div>

              {/* Priority + Status */}
              <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <SectionLabel icon={Flame} T={T}>Priority</SectionLabel>
                  <PillSelector options={PRIORITIES} value={formData.priority} onChange={(v) => setField("priority", v)} disabled={isLoading} />
                </div>
                <div style={{ height:1, background:T.border }} />
                <div>
                  <SectionLabel icon={Check} T={T}>Status</SectionLabel>
                  <PillSelector options={STATUSES} value={formData.status} onChange={(v) => setField("status", v)} disabled={isLoading} />
                </div>
              </div>

              {/* Assignee + Due Date */}
              <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:"16px 18px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div>
                    <SectionLabel icon={User} T={T}>Assignee</SectionLabel>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", display:"flex", alignItems:"center" }}>
                        {selectedMember
                          ? <div style={{ width:20, height:20, borderRadius:6, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"grid", placeItems:"center", color:"white", fontSize:9, fontWeight:800 }}>{selectedMember.user.name.charAt(0).toUpperCase()}</div>
                          : <User size={13} color={T.muted} />}
                      </div>
                      <select value={formData.assignee} onChange={(e) => setField("assignee", e.target.value)} disabled={isLoading} className="ctm-input" style={{ padding:"12px 12px 12px 38px", appearance:"none", cursor:"pointer" }}>
                        <option value="">Unassigned</option>
                        {currentWorkspace?.members?.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <SectionLabel icon={Calendar} T={T}>Due Date</SectionLabel>
                    <div style={{ position:"relative" }}>
                      <Calendar size={13} color={T.muted} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }} />
                      <input type="date" value={formData.dueDate} onChange={(e) => setField("dueDate", e.target.value)} disabled={isLoading} min={today} className="ctm-input" style={{ padding:"12px 12px 12px 34px", cursor:"pointer" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, padding:"16px 18px" }}>
                <SectionLabel icon={Tag} T={T}>Tags</SectionLabel>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", background:inputBg, border:`1.5px solid ${inputBorderColor}`, borderRadius:12, padding:"10px 14px", minHeight:50, cursor:"text", transition:"border-color 0.2s,box-shadow 0.2s" }}
                  onClick={() => document.getElementById('ctm-tag-input')?.focus()}
                  onFocus={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.45)'; e.currentTarget.style.boxShadow='0 0 0 4px rgba(99,102,241,0.10)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor=inputBorderColor; e.currentTarget.style.boxShadow='none'; }}>
                  {formData.tags.map((tag, i) => {
                    const c = TAG_COLORS[i % TAG_COLORS.length];
                    return (
                      <span key={tag} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 11px 5px 10px", borderRadius:999, background:c.bg, color:c.color, border:`1px solid ${c.border}`, fontSize:12, fontWeight:700, flexShrink:0 }}>
                        <span style={{ opacity:0.55, fontSize:11 }}>#</span>{tag}
                        <button type="button" onClick={() => removeTag(tag)} style={{ background:"none", border:"none", cursor:"pointer", color:c.color, padding:0, lineHeight:1, opacity:0.6, display:"flex", alignItems:"center" }}><X size={10} strokeWidth={2.5} /></button>
                      </span>
                    );
                  })}
                  <input id="ctm-tag-input" type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} onBlur={addTag} disabled={isLoading}
                    placeholder={formData.tags.length === 0 ? "design, frontend… (Enter to add)" : "Add more…"}
                    style={{ flex:1, minWidth:130, background:"none", border:"none", outline:"none", color:T.text, fontSize:13, fontFamily:"inherit", padding:"3px 0" }} />
                </div>
                <p style={{ fontSize:10.5, color:T.muted, marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
                  Press <kbd style={{ background:T.s3, border:`1px solid ${T.border2}`, borderRadius:5, padding:"1px 6px", fontSize:10, color:T.dim, fontFamily:"inherit" }}>Enter</kbd> or <kbd style={{ background:T.s3, border:`1px solid ${T.border2}`, borderRadius:5, padding:"1px 6px", fontSize:10, color:T.dim, fontFamily:"inherit" }}>,</kbd> to add · Backspace to remove last
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding:"16px 28px 24px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10 }}>
              <button type="button" onClick={onClose} disabled={isLoading}
                style={{ flex:1, height:48, borderRadius:14, border:`1.5px solid ${T.border2}`, background:T.s2, color:T.text2, fontSize:13.5, fontWeight:700, fontFamily:"inherit", cursor:"pointer", transition:"all 0.18s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background=T.s3; e.currentTarget.style.color=T.text; }}
                onMouseLeave={e => { e.currentTarget.style.background=T.s2; e.currentTarget.style.color=T.text2; }}>
                Cancel
              </button>
              <button type="submit" disabled={!canSubmit}
                style={{ flex:2.8, height:48, borderRadius:14, border:"none", background:canSubmit?"linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#4f7ef7 100%)":"rgba(99,102,241,0.15)", color:canSubmit?"white":T.muted, fontSize:14, fontWeight:800, fontFamily:"inherit", cursor:canSubmit?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.22s ease", opacity:!canSubmit?0.45:1, boxShadow:canSubmit?"0 14px 32px rgba(99,102,241,0.28)":"none" }}>
                {isLoading ? <><Loader2 size={16} style={{ animation:"ctm-spin 0.75s linear infinite" }} />Creating…</> : <><Plus size={16} strokeWidth={2.5} />Create Task</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}