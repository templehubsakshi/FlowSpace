// import { TrendingUp, TrendingDown } from "lucide-react";
// import { useState } from "react";

// const colorMap = {
//   blue:   { iconBg:'rgba(99,102,241,0.15)',  iconColor:'#818cf8', numColor:'#818cf8',  glowColor:'rgba(99,102,241,0.25)',  border:'rgba(99,102,241,0.15)'  },
//   green:  { iconBg:'rgba(16,185,129,0.15)',  iconColor:'#10b981', numColor:'#10b981',  glowColor:'rgba(16,185,129,0.25)',  border:'rgba(16,185,129,0.15)'  },
//   orange: { iconBg:'rgba(245,158,11,0.15)',  iconColor:'#f59e0b', numColor:'#f59e0b',  glowColor:'rgba(245,158,11,0.25)',  border:'rgba(245,158,11,0.15)'  },
//   red:    { iconBg:'rgba(239,68,68,0.15)',   iconColor:'#ef4444', numColor:'#ef4444',  glowColor:'rgba(239,68,68,0.25)',   border:'rgba(239,68,68,0.15)'   },
//   purple: { iconBg:'rgba(168,85,247,0.15)',  iconColor:'#a855f7', numColor:'#a855f7',  glowColor:'rgba(168,85,247,0.25)',  border:'rgba(168,85,247,0.15)'  },
// };

// export default function StatCard({ title, value, icon, color = "blue", trend, subtitle }) {
//   const [hovered, setHovered] = useState(false);
//   const c = colorMap[color] || colorMap.blue;

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         background: 'linear-gradient(145deg,#13151f,#0f1117)',
//         border: `1px solid ${hovered ? c.border : 'rgba(255,255,255,0.07)'}`,
//         borderRadius: 12,
//         padding: '13px 15px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: 12,
//         cursor: 'default',
//         transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
//         transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
//         boxShadow: hovered
//           ? `0 8px 30px rgba(0,0,0,0.35), 0 0 20px ${c.glowColor}`
//           : '0 2px 8px rgba(0,0,0,0.2)',
//       }}
//     >
//       {/* Icon */}
//       <div style={{
//         width:36, height:36, borderRadius:10, flexShrink:0,
//         background: c.iconBg,
//         display:'flex', alignItems:'center', justifyContent:'center',
//         color: c.iconColor,
//       }}>
//         {icon}
//       </div>

//       {/* Text */}
//       <div>
//         <div style={{ fontSize:11.5, color:'#6b7280', marginBottom:3, letterSpacing:'-0.01em' }}>
//           {title}
//         </div>
//         <div style={{
//           fontWeight:800, fontSize:28, lineHeight:1,
//           letterSpacing:'-0.04em', color: c.numColor,
//           fontFamily:"'Geist',sans-serif",
//         }}>
//           {value}
//         </div>
//         {subtitle && (
//           <div style={{ fontSize:11, color:'#6b7280', marginTop:3, letterSpacing:'-0.01em' }}>
//             {subtitle}
//           </div>
//         )}
//         {trend && (
//           <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
//             {trend.direction === 'up'
//               ? <TrendingUp size={13} color="#10b981"/>
//               : <TrendingDown size={13} color="#ef4444"/>
//             }
//             <span style={{ fontSize:11, fontWeight:600, color:'#6b7280' }}>{trend.value}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

const colorMap = {
  blue: {
    iconBg: "rgba(99,102,241,0.15)",
    iconColor: "#818cf8",
    numColor: "#818cf8",
    glowColor: "rgba(99,102,241,0.24)",
    border: "rgba(99,102,241,0.14)",
  },
  green: {
    iconBg: "rgba(16,185,129,0.15)",
    iconColor: "#10b981",
    numColor: "#10b981",
    glowColor: "rgba(16,185,129,0.24)",
    border: "rgba(16,185,129,0.14)",
  },
  orange: {
    iconBg: "rgba(245,158,11,0.15)",
    iconColor: "#f59e0b",
    numColor: "#f59e0b",
    glowColor: "rgba(245,158,11,0.24)",
    border: "rgba(245,158,11,0.14)",
  },
  red: {
    iconBg: "rgba(239,68,68,0.15)",
    iconColor: "#ef4444",
    numColor: "#ef4444",
    glowColor: "rgba(239,68,68,0.24)",
    border: "rgba(239,68,68,0.14)",
  },
  purple: {
    iconBg: "rgba(168,85,247,0.15)",
    iconColor: "#a855f7",
    numColor: "#a855f7",
    glowColor: "rgba(168,85,247,0.24)",
    border: "rgba(168,85,247,0.14)",
  },
};

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
  subtitle,
}) {
  const [hovered, setHovered] = useState(false);
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "linear-gradient(145deg,#13151f,#0f1117)",
        border: `1px solid ${hovered ? c.border : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        padding: "16px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        cursor: "default",
        minHeight: 104,
        transition: "transform 0.18s, box-shadow 0.18s, border-color 0.18s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 10px 34px rgba(0,0,0,0.34), 0 0 20px ${c.glowColor}`
          : "0 3px 10px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          flexShrink: 0,
          background: c.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: c.iconColor,
          boxShadow: hovered ? `0 0 16px ${c.glowColor}` : "none",
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11.5,
            color: "#6b7280",
            marginBottom: 6,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontWeight: 800,
            fontSize: 30,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            color: c.numColor,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {value}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: 11.5,
              color: "#6b7280",
              marginTop: 6,
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            {subtitle}
          </div>
        )}

        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            {trend.direction === "up" ? (
              <TrendingUp size={13} color="#10b981" />
            ) : (
              <TrendingDown size={13} color="#ef4444" />
            )}
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}