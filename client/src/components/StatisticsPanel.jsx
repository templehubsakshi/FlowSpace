import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { calculateStatistics } from "../redux/slices/statisticsSlice";
import ActivityFeed from "./ActivityFeed";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from "recharts";
import {
  CheckCircle2, Clock, AlertTriangle, Target, TrendingUp,
  Users, Sparkles, Activity, Calendar, ArrowUpRight,
  ArrowDownRight, Flame, Zap, Star,
} from "lucide-react";
import { useThemeColors } from "../hooks/useTheme";

function buildWeeklyData(tasks) {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = new Date();
  const result = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    return { day: days[d.getDay()], date: d.toDateString(), created: 0, completed: 0 };
  });
  tasks.forEach(task => {
    if (task.createdAt) {
      const slot = result.find(r => r.date === new Date(task.createdAt).toDateString());
      if (slot) slot.created++;
    }
    if (task.status === "done" && task.updatedAt) {
      const slot = result.find(r => r.date === new Date(task.updatedAt).toDateString());
      if (slot) slot.completed++;
    }
  });
  return result;
}

function ChartTip({ active, payload }) {
  const T = useThemeColors();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.s3, border: `1px solid ${T.border2}`, borderRadius: 12, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: T.text, boxShadow: "0 12px 30px rgba(0,0,0,0.2)" }}>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color || p.payload?.color, flexShrink: 0 }} />
          {p.name}: <span style={{ color: p.color || p.payload?.color, marginLeft: 2 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ title, value, icon, color = "blue", subtitle, trend }) {
  const T = useThemeColors();
  const [hov, setHov] = useState(false);
  const colors = {
    blue:   { bg: "rgba(99,102,241,0.15)",  ic: T.indigo2, num: T.indigo2, glow: "rgba(99,102,241,0.24)",  bd: "rgba(99,102,241,0.14)"  },
    green:  { bg: "rgba(16,185,129,0.15)",  ic: T.green,   num: T.green,   glow: "rgba(16,185,129,0.24)",  bd: "rgba(16,185,129,0.14)"  },
    orange: { bg: "rgba(245,158,11,0.15)",  ic: T.amber,   num: T.amber,   glow: "rgba(245,158,11,0.24)",  bd: "rgba(245,158,11,0.14)"  },
    red:    { bg: "rgba(239,68,68,0.15)",   ic: T.red,     num: T.red,     glow: "rgba(239,68,68,0.24)",   bd: "rgba(239,68,68,0.14)"   },
    purple: { bg: "rgba(168,85,247,0.15)",  ic: T.purple,  num: T.purple,  glow: "rgba(168,85,247,0.24)",  bd: "rgba(168,85,247,0.14)"  },
  };
  const c = colors[color] || colors.blue;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: T.surfaceCard, border: `1px solid ${hov ? c.bd : T.border}`, borderRadius: 16, padding: "18px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "default", minHeight: 108, transform: hov ? "translateY(-2px)" : "none", boxShadow: hov ? `0 12px 36px rgba(0,0,0,0.15), 0 0 24px ${c.glow}` : "0 3px 12px rgba(0,0,0,0.07)", transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s" }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.ic, boxShadow: hov ? `0 0 18px ${c.glow}` : "none", transition: "box-shadow 0.18s" }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 6, letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontWeight: 800, fontSize: 30, lineHeight: 1, letterSpacing: "-0.045em", color: c.num, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 6 }}>{subtitle}</div>}
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            {trend.up ? <ArrowUpRight size={12} color={T.green} /> : <ArrowDownRight size={12} color={T.red} />}
            <span style={{ fontSize: 11, fontWeight: 600, color: trend.up ? T.green : T.red }}>{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CardTitle({ children }) {
  const T = useThemeColors();
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.muted, marginBottom: 16 }}>{children}</div>;
}

function ProgressRow({ label, count, total, color }) {
  const T = useThemeColors();
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, gap: 8 }}>
        <span style={{ fontSize: 12.5, color: T.text2, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{count} <span style={{ color: T.muted, fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 7, background: T.s3, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: color, boxShadow: `0 0 10px ${color}55`, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

function Avatar({ name = "?", size = 28 }) {
  const T = useThemeColors();
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = ["#6366f1","#10b981","#f59e0b","#a855f7","#ef4444","#06b6d4","#f97316"];
  const idx = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % palette.length;
  const bg = palette[idx];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: bg + "28", border: `1px solid ${bg}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, color: bg }}>
      {initials}
    </div>
  );
}

function EmptyAnalytics() {
  const T = useThemeColors();
  return (
    <div style={{ background: T.surfaceCard, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 6px 28px rgba(0,0,0,0.08)", padding: "72px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.20)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(99,102,241,0.15)" }}>
        <TrendingUp size={28} color={T.indigo2} />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: T.text }}>No analytics yet</h3>
      <p style={{ fontSize: 13.5, color: T.muted }}>Create a few tasks to unlock insights.</p>
    </div>
  );
}

export default function StatisticsPanel() {
  const T = useThemeColors();
  const dispatch   = useDispatch();
  const { tasks }  = useSelector(s => s.tasks);
  const statistics = useSelector(s => s.statistics);
  const [range, setRange] = useState("This Week");
  const ranges = ["Today", "This Week", "This Month", "All Time"];

  const panel = { background: T.surfaceCard, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 6px 28px rgba(0,0,0,0.07)" };

  useEffect(() => { dispatch(calculateStatistics(tasks)); }, [tasks, dispatch]);

  const allTasks = useMemo(() => [...(tasks.todo||[]), ...(tasks.in_progress||[]), ...(tasks.done||[])], [tasks]);
  const weeklyData = useMemo(() => buildWeeklyData(allTasks), [allTasks]);

  const statusData = useMemo(() => [
    { name: "To Do",       value: statistics.tasksByStatus.todo,        color: T.muted   },
    { name: "In Progress", value: statistics.tasksByStatus.in_progress, color: T.indigo2 },
    { name: "Done",        value: statistics.tasksByStatus.done,        color: T.green   },
  ].filter(d => d.value > 0), [statistics, T]);

  const priorityData = useMemo(() => [
    { name: "Low",    value: statistics.tasksByPriority.low,    color: "#94a3b8" },
    { name: "Medium", value: statistics.tasksByPriority.medium, color: T.indigo2 },
    { name: "High",   value: statistics.tasksByPriority.high,   color: T.orange  },
    { name: "Urgent", value: statistics.tasksByPriority.urgent, color: T.red     },
  ].filter(d => d.value > 0), [statistics, T]);

  const topAssignee    = useMemo(() => statistics.tasksByAssignee?.length ? [...statistics.tasksByAssignee].sort((a, b) => b.completed - a.completed)[0] : null, [statistics]);
  const busiestPriority = useMemo(() => { const e = Object.entries(statistics.tasksByPriority||{}).sort((a,b)=>b[1]-a[1])[0]; return e&&e[1]>0 ? { name: e[0].charAt(0).toUpperCase()+e[0].slice(1), count: e[1] } : null; }, [statistics]);
  const pendingCount   = statistics.tasksByStatus.todo + statistics.tasksByStatus.in_progress;
  const velocity       = useMemo(() => Math.round(weeklyData.reduce((s,d)=>s+d.completed,0)/7*10)/10, [weeklyData]);

  if (statistics.totalTasks === 0) return <EmptyAnalytics />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-0.03em", color: T.text, lineHeight: 1.2, margin: 0 }}>Workspace Analytics</h1>
          <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{statistics.totalTasks} tasks · {statistics.tasksByAssignee?.length || 0} contributors</p>
        </div>
        <div style={{ display: "flex", background: T.s2, border: `1px solid ${T.border2}`, borderRadius: 12, padding: 4, gap: 2 }}>
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: "6px 13px", borderRadius: 9, border: "none", cursor: "pointer", background: range===r ? "linear-gradient(135deg,#6366f1,#818cf8)" : "transparent", color: range===r ? "white" : T.muted, fontSize: 12, fontWeight: 600, boxShadow: range===r ? "0 2px 12px rgba(99,102,241,0.38)" : "none", transition: "all 0.15s", fontFamily: "'Inter', sans-serif" }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <StatCard title="Total Tasks"      value={statistics.totalTasks}                  icon={<Target size={19}/>}       color="blue"                                      subtitle="Across workspace" />
        <StatCard title="Completion Rate"  value={`${statistics.completionRate}%`}         icon={<CheckCircle2 size={19}/>} color="green"                                     subtitle={`${statistics.tasksByStatus.done} tasks done`} />
        <StatCard title="In Progress"      value={statistics.tasksByStatus.in_progress}    icon={<Clock size={19}/>}        color="orange"                                    subtitle="Active tasks" />
        <StatCard title="Overdue"          value={statistics.overdueTasks}                 icon={<AlertTriangle size={19}/>}color={statistics.overdueTasks>0?"red":"purple"}   subtitle={statistics.overdueTasks>0?"Needs attention":"All on track"} />
      </div>

      {/* Quick Insights */}
      <div style={{ ...panel, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={15} color={T.indigo2} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>Quick Insights</div>
              <div style={{ fontSize: 11.5, color: T.muted }}>Snapshot · {range.toLowerCase()}</div>
            </div>
          </div>
          <div style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.20)", color: T.green2, fontSize: 11.5, fontWeight: 700 }}>{statistics.completionRate}% complete</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
          {[
            { label:"Top Contributor", value: topAssignee?topAssignee.name:"None yet",    sub: topAssignee?`${topAssignee.completed} tasks done`:"Assign tasks",  icon:<Star size={13}/>,  bg:"rgba(99,102,241,0.08)",  c:T.indigo2 },
            { label:"Busiest Priority",value: busiestPriority?busiestPriority.name:"None",sub: busiestPriority?`${busiestPriority.count} tasks`:"Add priorities", icon:<Flame size={13}/>, bg:"rgba(245,158,11,0.08)",  c:T.amber   },
            { label:"Pending Tasks",   value: String(pendingCount),                       sub: "todo + in progress",                                             icon:<Clock size={13}/>,  bg:"rgba(239,68,68,0.08)",   c:T.red     },
            { label:"Daily Velocity",  value: velocity===0?"0":`${velocity}/day`,         sub: "avg completions (7d)",                                           icon:<Zap size={13}/>,   bg:"rgba(168,85,247,0.08)",  c:T.purple  },
          ].map((ins,i) => (
            <div key={i} style={{ padding:"12px 14px", borderRadius:14, background:ins.bg, border:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:T.muted, marginBottom:8 }}>
                <span style={{ color:ins.c }}>{ins.icon}</span>{ins.label}
              </div>
              <div style={{ fontSize:16, fontWeight:800, color:T.text, letterSpacing:"-0.03em", lineHeight:1.2 }}>{ins.value}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>{ins.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion rate + Status donut */}
      <div style={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:14 }}>
        <div style={{ ...panel, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <CardTitle>Completion Rate</CardTitle>
              <div style={{ fontSize:34, fontWeight:800, color:T.green, letterSpacing:"-0.045em", lineHeight:1 }}>{statistics.completionRate}%</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:6 }}>{statistics.tasksByStatus.done} of {statistics.totalTasks} tasks completed</div>
            </div>
          </div>
          <div style={{ height:10, background:T.s3, borderRadius:999, overflow:"hidden", marginBottom:22 }}>
            <div style={{ height:"100%", width:`${statistics.completionRate}%`, borderRadius:999, background:"linear-gradient(90deg,#10b981,#34d399)", boxShadow:"0 0 14px rgba(16,185,129,0.35)", transition:"width 0.8s ease" }} />
          </div>
          <ProgressRow label="To Do"       count={statistics.tasksByStatus.todo}        total={statistics.totalTasks} color={T.muted}   />
          <ProgressRow label="In Progress" count={statistics.tasksByStatus.in_progress} total={statistics.totalTasks} color={T.indigo2} />
          <ProgressRow label="Done"        count={statistics.tasksByStatus.done}        total={statistics.totalTasks} color={T.green}   />
        </div>

        <div style={{ ...panel, padding:20 }}>
          <CardTitle>Status Breakdown</CardTitle>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", width:180, height:180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" outerRadius={82} innerRadius={52} paddingAngle={4} strokeWidth={0}>
                    {statusData.map((e,i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <span style={{ fontWeight:800, fontSize:30, color:T.text, letterSpacing:"-0.05em", lineHeight:1 }}>{statistics.totalTasks}</span>
                <span style={{ marginTop:4, fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Total</span>
              </div>
            </div>
            <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
              {statusData.map((d,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderRadius:12, background:T.s2, border:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, color:T.text2, fontSize:12.5, fontWeight:600 }}>
                    <span style={{ width:9, height:9, borderRadius:"50%", background:d.color, boxShadow:`0 0 8px ${d.color}88`, flexShrink:0 }} />{d.name}
                  </div>
                  <span style={{ fontSize:14, fontWeight:800, color:d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div style={{ ...panel, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Activity size={15} color={T.indigo2} />
            </div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:800, color:T.text, letterSpacing:"-0.02em" }}>Weekly Activity</div>
              <div style={{ fontSize:11.5, color:T.muted }}>Tasks created vs completed — last 7 days</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:16 }}>
            {[{label:"Created",color:T.indigo2},{label:"Completed",color:T.green}].map((l,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.muted }}>
                <span style={{ width:10, height:10, borderRadius:2, background:l.color, flexShrink:0 }} />{l.label}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyData} margin={{ top:4, right:4, bottom:0, left:-20 }}>
            <defs>
              <linearGradient id="gIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.indigo2} stopOpacity={0.25} /><stop offset="100%" stopColor={T.indigo2} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.green} stopOpacity={0.25} /><stop offset="100%" stopColor={T.green} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={T.border} vertical={false} />
            <XAxis dataKey="day" stroke={T.border} tick={{ fill:T.muted, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis stroke={T.border} tick={{ fill:T.muted, fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTip />} cursor={{ stroke:T.border2, strokeWidth:1 }} />
            <Area type="monotone" dataKey="created"   name="Created"   stroke={T.indigo2} strokeWidth={2} fill="url(#gIndigo)" dot={{ fill:T.indigo2, r:3, strokeWidth:0 }} activeDot={{ r:5 }} />
            <Area type="monotone" dataKey="completed" name="Completed" stroke={T.green}   strokeWidth={2} fill="url(#gGreen)"  dot={{ fill:T.green,   r:3, strokeWidth:0 }} activeDot={{ r:5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution charts */}
      {statusData.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div style={{ ...panel, padding:20 }}>
            <CardTitle>Task Distribution</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" outerRadius={88} paddingAngle={4} strokeWidth={0}>
                  {statusData.map((e,i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
              {statusData.map((d,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:T.muted }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:d.color }} />{d.name} · <span style={{ color:d.color, fontWeight:700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          {priorityData.length > 0 && (
            <div style={{ ...panel, padding:20 }}>
              <CardTitle>Priority Breakdown</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityData} barCategoryGap="28%" margin={{ top:4, right:4, bottom:0, left:-20 }}>
                  <CartesianGrid stroke={T.border} vertical={false} />
                  <XAxis dataKey="name" stroke={T.border} tick={{ fill:T.muted, fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke={T.border} tick={{ fill:T.muted, fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill:T.border }} />
                  <Bar dataKey="value" name="Tasks" radius={[8,8,0,0]}>{priorityData.map((e,i) => <Cell key={i} fill={e.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap" }}>
                {priorityData.map((d,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:T.muted }}>
                    <span style={{ width:10, height:10, borderRadius:2, background:d.color }} />{d.name} · <span style={{ color:d.color, fontWeight:700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Performance + Activity Feed */}
      <div style={{ display:"grid", gridTemplateColumns:"0.9fr 1.1fr", gap:14, alignItems:"start" }}>
        <div style={{ ...panel, padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"rgba(168,85,247,0.14)", border:"1px solid rgba(168,85,247,0.22)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Users size={15} color={T.purple} />
            </div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:800, color:T.text, letterSpacing:"-0.02em" }}>Team Performance</div>
              <div style={{ fontSize:11.5, color:T.muted }}>Completion by assignee</div>
            </div>
          </div>
          {statistics.tasksByAssignee?.length > 0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {statistics.tasksByAssignee.map((a,i) => {
                const pct = a.count ? Math.round((a.completed/a.count)*100) : 0;
                return (
                  <div key={i} style={{ padding:"13px 14px", borderRadius:14, background:T.s2, border:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9, gap:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <Avatar name={a.name} size={30} />
                        <div>
                          <div style={{ fontSize:12.5, fontWeight:700, color:T.text2 }}>{a.name}</div>
                          <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{a.completed} done · {a.count} total</div>
                        </div>
                      </div>
                      <div style={{ fontSize:12, fontWeight:800, color:T.purple }}>{pct}%</div>
                    </div>
                    <div style={{ height:7, background:T.s3, borderRadius:999, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, borderRadius:999, background:"linear-gradient(90deg,#8b5cf6,#ec4899)", boxShadow:"0 0 10px rgba(139,92,246,0.35)", transition:"width 0.7s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding:"24px 16px", borderRadius:14, background:T.s2, border:`1px solid ${T.border}`, textAlign:"center", color:T.muted, fontSize:12.5 }}>No assignee data yet</div>
          )}
        </div>

        <div style={{ ...panel, padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Calendar size={15} color={T.indigo2} />
            </div>
            <div>
              <div style={{ fontSize:13.5, fontWeight:800, color:T.text, letterSpacing:"-0.02em" }}>Recent Activity</div>
              <div style={{ fontSize:11.5, color:T.muted }}>Latest updates across the workspace</div>
            </div>
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}