import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Bell,
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { setSelectedTask } from "../redux/slices/taskSlice";

/* ─────────────────────────────────────────────
   Flatten tasks safely
───────────────────────────────────────────── */
function flattenTasks(tasksState) {
  if (!tasksState) return [];
  if (Array.isArray(tasksState)) return tasksState;

  const raw = tasksState.tasks ?? tasksState;
  if (Array.isArray(raw)) return raw;

  if (raw && typeof raw === "object") {
    return [
      ...(Array.isArray(raw.todo) ? raw.todo : []),
      ...(Array.isArray(raw.in_progress) ? raw.in_progress : []),
      ...(Array.isArray(raw.done) ? raw.done : []),
    ];
  }
  return [];
}

/* ─────────────────────────────────────────────
   Mini Calendar
───────────────────────────────────────────── */
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay(); }

function MiniCalendar({ taskDates = [] }) {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const prev = () => setCur((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }));
  const next = () => setCur((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }));

  const days   = getDaysInMonth(cur.y, cur.m);
  const offset = getFirstDay(cur.y, cur.m);
  const cells  = Array(offset).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));

  const hasTask = (d) =>
    taskDates.some((td) => {
      const dt = new Date(td);
      return dt.getFullYear() === cur.y && dt.getMonth() === cur.m && dt.getDate() === d;
    });

  const isToday = (d) =>
    d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear();

  return (
    <div style={{ userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={prev} style={navBtn} aria-label="Previous month">
          <ChevronLeft size={13} />
        </button>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)" }}>
          {MONTHS[cur.m]} {cur.y}
        </span>
        <button onClick={next} style={navBtn} aria-label="Next month">
          <ChevronRight size={13} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--text-tertiary)", fontWeight: 700 }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((d, i) => (
          <div
            key={i}
            style={{
              height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8,
              fontSize: 11.5,
              fontWeight: isToday(d) ? 800 : 500,
              background: isToday(d) ? "var(--brand-primary)" : "transparent",
              color: !d ? "transparent" : isToday(d) ? "#fff" : "var(--text-secondary)",
              position: "relative",
              cursor: d ? "pointer" : "default",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { if (d && !isToday(d)) e.currentTarget.style.background = "var(--surface-hover)"; }}
            onMouseLeave={(e) => { if (d && !isToday(d)) e.currentTarget.style.background = "transparent"; }}
          >
            {d || ""}
            {d && hasTask(d) && (
              <span style={{
                position: "absolute", bottom: 3, left: "50%",
                transform: "translateX(-50%)",
                width: 5, height: 5, borderRadius: "50%",
                background: isToday(d) ? "rgba(255,255,255,0.85)" : "var(--brand-primary)",
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const navBtn = {
  width: 26, height: 26,
  border: "1px solid var(--border-subtle)",
  background: "var(--surface-base)",
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "var(--text-secondary)",
  borderRadius: 8,
  boxShadow: "var(--shadow-xs)",
};

/* ─────────────────────────────────────────────
   Reminders
───────────────────────────────────────────── */
const INITIAL_REMINDERS = [
  { id: 1, text: "Review PR for Feature X",  time: "Today, 3:00 PM",   done: false, priority: "high"   },
  { id: 2, text: "Team standup call",         time: "Today, 4:30 PM",   done: false, priority: "medium" },
  { id: 3, text: "Deploy staging build",      time: "Tomorrow, 10 AM",  done: false, priority: "low"    },
];

const PRIORITY_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#4f8ef7" };

function Reminders() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [newText, setNewText]     = useState("");
  const [adding, setAdding]       = useState(false);

  const toggle = (id) => setReminders((r) => r.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id) => setReminders((r) => r.filter((x) => x.id !== id));
  const add    = () => {
    if (!newText.trim()) return;
    setReminders((r) => [...r, { id: Date.now(), text: newText.trim(), time: "No due date", done: false, priority: "medium" }]);
    setNewText(""); setAdding(false);
  };

  return (
    <div>
      {reminders.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 0", borderBottom: "1px solid var(--border-subtle)", opacity: r.done ? 0.5 : 1 }}>
          <button onClick={() => toggle(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: r.done ? "var(--brand-primary)" : "var(--text-tertiary)", marginTop: 2, padding: 0, flexShrink: 0 }}>
            {r.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12.8, color: "var(--text-primary)", textDecoration: r.done ? "line-through" : "none", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
              {r.text}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <Clock size={10} color="var(--text-tertiary)" />
              <span style={{ fontSize: 10.8, color: "var(--text-tertiary)" }}>{r.time}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: PRIORITY_COLOR[r.priority] ?? "var(--text-tertiary)" }} />
            </div>
          </div>
          <button onClick={() => remove(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 0, flexShrink: 0, opacity: 0.8 }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {adding ? (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input
            autoFocus value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Reminder text…"
            style={{ flex: 1, background: "var(--surface-bg)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: "8px 10px", color: "var(--text-primary)", fontSize: 12.5, fontFamily: "inherit", outline: "none" }}
          />
          <button onClick={add} style={{ background: "var(--brand-primary)", border: "none", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
            Add
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px dashed var(--border-default)", borderRadius: 12, padding: "9px 10px", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 12.5, fontFamily: "inherit", width: "100%", justifyContent: "center" }}>
          <Plus size={14} /> Add reminder
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Today Summary
───────────────────────────────────────────── */
function TodaySummary({ allTasks }) {
  const counts = useMemo(() => {
    const now   = new Date();
    const start = new Date(now); start.setHours(0,0,0,0);
    let overdue = 0, dueToday = 0;
    allTasks.forEach(t => {
      if (t?.status === "done") return;
      if (t?.dueDate) {
        const dt = new Date(t.dueDate);
        if (dt < start) overdue++;
        else if (dt.toDateString() === now.toDateString()) dueToday++;
      }
    });
    return { overdue, dueToday };
  }, [allTasks]);

  const box = (label, value, tone) => {
    const t = tone === "bad"
      ? { bg: "rgba(239,68,68,0.10)",  bd: "rgba(239,68,68,0.20)",  fg: "#f87171"  }
      : tone === "warn"
      ? { bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.22)", fg: "#fbbf24"  }
      : { bg: "var(--surface-bg)",     bd: "var(--border-subtle)",   fg: "var(--text-primary)" };
    return (
      <div style={{ padding: 10, borderRadius: 14, border: `1px solid ${t.bd}`, background: t.bg }}>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 700 }}>{label}</div>
        <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900, color: t.fg }}>{value}</div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {box("Overdue",   counts.overdue,   counts.overdue   ? "bad"  : "base")}
      {box("Due Today", counts.dueToday,  counts.dueToday  ? "warn" : "base")}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Upcoming Tasks
───────────────────────────────────────────── */
const PRIORITY_BG = { high: "rgba(239,68,68,0.15)", medium: "rgba(245,158,11,0.15)", low: "rgba(79,142,247,0.12)" };
const PRIORITY_FG = { high: "#f87171", medium: "#fbbf24", low: "#4f8ef7" };

function dueLabel(d) {
  const diff = Math.ceil((new Date(d) - Date.now()) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, color: "#ef4444" };
  if (diff === 0) return { label: "Due today",                  color: "#f59e0b" };
  if (diff === 1) return { label: "Due tomorrow",               color: "#f59e0b" };
  return           { label: `Due in ${diff}d`,                  color: "var(--text-tertiary)" };
}

function UpcomingTasks({ allTasks, onSelect }) {
  const upcoming = useMemo(() =>
    allTasks
      .filter((t) => t?.dueDate && t?.status !== "done")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6),
    [allTasks]
  );

  if (!upcoming.length) {
    return <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", textAlign: "center", padding: "12px 0" }}>No upcoming tasks 🎉</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {upcoming.map((t) => {
        const due = dueLabel(t.dueDate);
        return (
          <button key={t._id} onClick={() => onSelect?.(t)}
            style={{ textAlign: "left", padding: "10px", borderRadius: 14, background: "var(--surface-bg)", border: "1px solid var(--border-subtle)", cursor: "pointer", width: "100%" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {t.title}
              </p>
              {t.priority && (
                <span style={{ fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: PRIORITY_BG[t.priority] ?? "transparent", color: PRIORITY_FG[t.priority] ?? "var(--text-tertiary)", flexShrink: 0 }}>
                  {t.priority}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Clock size={12} color="var(--text-tertiary)" />
              <span style={{ fontSize: 11.5, color: due.color, fontWeight: 650 }}>{due.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Selected Task Preview (replaces TaskDetailPanel)
───────────────────────────────────────────── */
function SelectedTaskPreview({ task, onClose }) {
  if (!task) return null;

  const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  const priorityColors = {
    urgent: { bg: "rgba(239,68,68,0.1)",  text: "#f87171" },
    high:   { bg: "rgba(245,158,11,0.1)", text: "#fbbf24" },
    medium: { bg: "rgba(79,142,247,0.1)", text: "#7eb3f8" },
    low:    { bg: "rgba(100,116,139,0.1)",text: "#8b97b0" },
  };
  const pc = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, flex: 1 }}>
          {task.title}
        </h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}>
          ×
        </button>
      </div>

      {/* Priority + Status */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: pc.bg, color: pc.text, fontSize: 11, fontWeight: 700 }}>
          {task.priority}
        </span>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: "var(--surface-hover)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 700 }}>
          {task.status?.replace("_", " ")}
        </span>
        {isOverdue && (
          <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 11, fontWeight: 700 }}>
            Overdue
          </span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", lineHeight: 1.6, padding: "10px 12px", background: "var(--surface-bg)", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
          {task.description}
        </p>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-primary), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 800 }}>
            {task.assignee.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}>Assignee</p>
            <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{task.assignee.name}</p>
          </div>
        </div>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: isOverdue ? "rgba(239,68,68,0.08)" : "var(--surface-bg)", border: `1px solid ${isOverdue ? "rgba(239,68,68,0.2)" : "var(--border-subtle)"}` }}>
          <Clock size={13} color={isOverdue ? "#f87171" : "var(--text-tertiary)"} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: isOverdue ? "#f87171" : "var(--text-secondary)" }}>
            {new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      )}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {task.tags.map((tag, i) => (
            <span key={i} style={{ padding: "2px 10px", borderRadius: 20, background: "rgba(139,92,246,0.1)", color: "#a78bfa", fontSize: 11, fontWeight: 600, border: "1px solid rgba(139,92,246,0.2)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Comments count */}
      {task.comments?.length > 0 && (
        <div style={{ padding: "8px 12px", borderRadius: 10, background: "var(--surface-bg)", border: "1px solid var(--border-subtle)", fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>
          💬 {task.comments.length} comment{task.comments.length > 1 ? "s" : ""} — click card to view
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section wrapper
───────────────────────────────────────────── */
 
function Section({ icon: IconComp, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginTop: 18 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "0 0 10px 0", width: "100%" }}
      >
        <IconComp size={14} color="var(--brand-primary)" />
        <span style={{ fontSize: 11.5, fontWeight: 900, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", flex: 1, textAlign: "left" }}>
          {title}
        </span>
        <ChevronLeft size={13} color="var(--text-tertiary)" style={{ transform: open ? "rotate(-90deg)" : "rotate(180deg)", transition: "transform 0.2s ease" }} />
      </button>
      {open && children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function RightPanel() {
  const dispatch   = useDispatch();
  const tasksSlice = useSelector((s) => s.tasks);
  const selectedTask = tasksSlice?.selectedTask ?? null;

  const allTasks  = useMemo(() => flattenTasks(tasksSlice), [tasksSlice]);
  const taskDates = useMemo(() => allTasks.filter((t) => t?.dueDate).map((t) => t.dueDate), [allTasks]);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? 56 : 300,
      flexShrink: 0,
      borderLeft: "1px solid var(--border-subtle)",
      background: "var(--surface-base)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.2s ease",
    }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 2,
        padding: "14px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--surface-base)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      }}>
        {!collapsed ? (
          <div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Insights</div>
            <div style={{ marginTop: 3, fontSize: 13, fontWeight: 900, color: "var(--text-primary)" }}>Context panel</div>
          </div>
        ) : <div style={{ width: 1 }} />}

        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--border-subtle)", background: "var(--surface-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div style={{ padding: "14px", overflowY: "auto", flex: 1 }}>
          {selectedTask ? (
            <>
              <SelectedTaskPreview
                task={selectedTask}
                onClose={() => dispatch(setSelectedTask(null))}
              />
              <div style={{ height: 1, background: "var(--border-subtle)", margin: "16px 0" }} />
              <Section icon={Clock} title="Upcoming Tasks" defaultOpen={true}>
                <UpcomingTasks allTasks={allTasks} onSelect={(t) => dispatch(setSelectedTask(t))} />
              </Section>
            </>
          ) : (
            <>
              <TodaySummary allTasks={allTasks} />
              <Section icon={Clock} title="Upcoming Tasks" defaultOpen={true}>
                <UpcomingTasks allTasks={allTasks} onSelect={(t) => dispatch(setSelectedTask(t))} />
              </Section>
              <div style={{ height: 1, background: "var(--border-subtle)", margin: "14px 0" }} />
              <Section icon={CalendarDays} title="Calendar" defaultOpen={true}>
                <MiniCalendar taskDates={taskDates} />
              </Section>
              <div style={{ height: 1, background: "var(--border-subtle)", margin: "14px 0" }} />
              <Section icon={Bell} title="Reminders" defaultOpen={false}>
                <Reminders />
              </Section>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
