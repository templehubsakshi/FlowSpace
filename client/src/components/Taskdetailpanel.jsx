// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { setSelectedTask } from "../redux/slices/taskSlice";
// import {
//   X, Clock, Tag, User, MessageSquare,
//   Circle, CheckCircle2, Zap, Flame, AlertCircle,
//   Send,
// } from "lucide-react";

// const PRIORITY_CONFIG = {
//   low:    { bg: "rgba(100,116,139,0.1)",  text: "#8b97b0", border: "rgba(100,116,139,0.2)",  label: "Low"    },
//   medium: { bg: "rgba(79,142,247,0.1)",   text: "#7eb3f8", border: "rgba(79,142,247,0.22)",  label: "Medium" },
//   high:   { bg: "rgba(245,158,11,0.1)",   text: "#fbbf24", border: "rgba(245,158,11,0.22)",  label: "High"   },
//   urgent: { bg: "rgba(239,68,68,0.1)",    text: "#f87171", border: "rgba(239,68,68,0.22)",   label: "Urgent" },
// };

// const PRIORITY_ICONS = { urgent: Flame, high: AlertCircle, medium: Zap, low: Circle };

// const STATUS_CONFIG = {
//   todo:        { label: "To Do",       bg: "rgba(100,116,139,0.1)", text: "#8b97b0" },
//   in_progress: { label: "In Progress", bg: "rgba(245,158,11,0.1)",  text: "#fbbf24" },
//   done:        { label: "Done",        bg: "rgba(16,185,129,0.1)",  text: "#34d399" },
// };

// const TAG_COLORS = [
//   { bg: "rgba(139,92,246,0.1)",  text: "#a78bfa", border: "rgba(139,92,246,0.2)" },
//   { bg: "rgba(6,182,212,0.1)",   text: "#22d3ee", border: "rgba(6,182,212,0.2)"  },
//   { bg: "rgba(16,185,129,0.1)",  text: "#34d399", border: "rgba(16,185,129,0.2)" },
//   { bg: "rgba(245,158,11,0.1)",  text: "#fbbf24", border: "rgba(245,158,11,0.2)" },
//   { bg: "rgba(239,68,68,0.1)",   text: "#f87171", border: "rgba(239,68,68,0.2)"  },
// ];

// export default function TaskDetailPanel({ task, onAddComment, workspaceMembers = [] }) {
//   const dispatch = useDispatch();
//   const [comment, setComment] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   if (!task) return null;

//   const priority  = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
//   const status    = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo;
//   const PIcon     = PRIORITY_ICONS[task.priority]  || Circle;
//   const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

//   const handleComment = async () => {
//     if (!comment.trim() || submitting) return;
//     setSubmitting(true);
//     try {
//       await onAddComment?.(task._id, comment.trim());
//       setComment("");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

//       {/* ── Header ── */}
//       <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
//         <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.4, flex: 1, letterSpacing: "-0.2px" }}>
//           {task.title}
//         </h3>
//         <button
//           onClick={() => dispatch(setSelectedTask(null))}
//           style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid var(--border-subtle)", background: "var(--surface-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", flexShrink: 0 }}
//           onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
//           onMouseLeave={e => { e.currentTarget.style.background = "var(--surface-bg)";    e.currentTarget.style.color = "var(--text-tertiary)"; }}
//         >
//           <X size={13} />
//         </button>
//       </div>

//       {/* ── Priority + Status badges ── */}
//       <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
//         <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: priority.bg, color: priority.text, border: `1px solid ${priority.border}`, fontSize: 11, fontWeight: 700 }}>
//           <PIcon size={10} />
//           {priority.label}
//         </span>
//         <span style={{ padding: "3px 10px", borderRadius: 20, background: status.bg, color: status.text, fontSize: 11, fontWeight: 700 }}>
//           {status.label}
//         </span>
//         {isOverdue && (
//           <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, fontWeight: 700 }}>
//             Overdue
//           </span>
//         )}
//       </div>

//       {/* ── Description ── */}
//       {task.description && (
//         <div style={{ marginBottom: 14, padding: "10px 12px", background: "var(--surface-bg)", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
//           <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>
//             {task.description}
//           </p>
//         </div>
//       )}

//       {/* ── Meta: assignee + due date ── */}
//       <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
//         {/* Assignee */}
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface-hover)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//             <User size={11} color="var(--text-tertiary)" />
//           </div>
//           <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 600, width: 60, flexShrink: 0 }}>Assignee</span>
//           {task.assignee ? (
//             <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//               <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-primary), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
//                 {task.assignee.name?.charAt(0).toUpperCase()}
//               </div>
//               <span style={{ fontSize: 12.5, color: "var(--text-primary)", fontWeight: 600 }}>
//                 {task.assignee.name}
//               </span>
//             </div>
//           ) : (
//             <span style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "1px 8px", borderRadius: 20, background: "var(--surface-hover)", border: "1px solid var(--border-subtle)" }}>
//               Unassigned
//             </span>
//           )}
//         </div>

//         {/* Due date */}
//         {task.dueDate && (
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface-hover)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//               <Clock size={11} color={isOverdue ? "#f87171" : "var(--text-tertiary)"} />
//             </div>
//             <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 600, width: 60, flexShrink: 0 }}>Due date</span>
//             <span style={{ fontSize: 12.5, fontWeight: 600, color: isOverdue ? "#f87171" : "var(--text-primary)" }}>
//               {new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* ── Tags ── */}
//       {task.tags?.length > 0 && (
//         <div style={{ marginBottom: 14 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
//             <Tag size={12} color="var(--text-tertiary)" />
//             <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Tags</span>
//           </div>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
//             {task.tags.map((tag, i) => {
//               const c = TAG_COLORS[i % TAG_COLORS.length];
//               return (
//                 <span key={i} style={{ padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontSize: 11, fontWeight: 600 }}>
//                   {tag}
//                 </span>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* ── Divider ── */}
//       <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0 14px" }} />

//       {/* ── Comments ── */}
//       <div>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
//           <MessageSquare size={13} color="var(--text-tertiary)" />
//           <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
//             Comments {task.comments?.length > 0 && `(${task.comments.length})`}
//           </span>
//         </div>

//         {/* Comment list */}
//         {task.comments?.length > 0 ? (
//           <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
//             {task.comments.map((c, i) => (
//               <div key={c._id || i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
//                 <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-primary), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
//                   {(c.user?.name || c.author?.name || "?").charAt(0).toUpperCase()}
//                 </div>
//                 <div style={{ flex: 1, background: "var(--surface-bg)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "8px 10px" }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
//                     <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
//                       {c.user?.name || c.author?.name || "User"}
//                     </span>
//                     {c.createdAt && (
//                       <span style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>
//                         {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
//                       </span>
//                     )}
//                   </div>
//                   <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
//                     {c.text || c.content}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 12, textAlign: "center", padding: "8px 0" }}>
//             No comments yet
//           </p>
//         )}

//         {/* Add comment input */}
//         {onAddComment && (
//           <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
//             <textarea
//               value={comment}
//               onChange={e => setComment(e.target.value)}
//               onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
//               placeholder="Add a comment…"
//               rows={2}
//               style={{
//                 flex: 1, resize: "none",
//                 background: "var(--surface-bg)",
//                 border: "1.5px solid var(--border-subtle)",
//                 borderRadius: 10, padding: "8px 10px",
//                 color: "var(--text-primary)", fontSize: 12.5,
//                 fontFamily: "inherit", outline: "none",
//                 lineHeight: 1.5,
//                 transition: "border-color 0.15s ease",
//               }}
//               onFocus={e => e.target.style.borderColor = "var(--brand-primary)"}
//               onBlur={e => e.target.style.borderColor = "var(--border-subtle)"}
//             />
//             <button
//               onClick={handleComment}
//               disabled={!comment.trim() || submitting}
//               style={{
//                 width: 34, height: 34, borderRadius: 10, flexShrink: 0,
//                 background: comment.trim() ? "var(--brand-primary)" : "var(--surface-hover)",
//                 border: "none", cursor: comment.trim() ? "pointer" : "not-allowed",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 color: comment.trim() ? "white" : "var(--text-tertiary)",
//                 transition: "all 0.15s ease",
//                 boxShadow: comment.trim() ? "0 2px 8px rgba(37,99,235,0.35)" : "none",
//               }}
//             >
//               <Send size={14} />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }