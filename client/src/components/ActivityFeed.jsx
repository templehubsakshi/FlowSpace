import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Edit, Trash2, MessageSquare, Clock } from 'lucide-react';
import { useThemeColors } from '../hooks/useTheme';

const TYPE_CFG = {
  created:   { Icon: Plus,          color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  updated:   { Icon: Edit,          color: '#6366f1', bg: 'rgba(99,102,241,0.10)'  },
  deleted:   { Icon: Trash2,        color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  commented: { Icon: MessageSquare, color: '#a855f7', bg: 'rgba(168,85,247,0.10)'  },
  default:   { Icon: Clock,         color: '#64748b', bg: 'rgba(100,116,139,0.10)' },
};
const PRIORITY_CFG = {
  urgent: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)'   },
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  low:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};
const GRADS = [
  'linear-gradient(135deg,#5b6af0,#7c3aed)',
  'linear-gradient(135deg,#ec4899,#a855f7)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
];
const grad = name => GRADS[(name?.charCodeAt(0) || 0) % GRADS.length];
const timeAgo = ts => {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(ts).toLocaleDateString();
};

export default function ActivityFeed() {
  const T = useThemeColors();
  const { tasks } = useSelector(s => s.tasks);

  const activities = useMemo(() => {
    const all = [...(tasks?.todo||[]), ...(tasks?.in_progress||[]), ...(tasks?.done||[])];
    return [...all]
      .sort((a,b) => new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt))
      .slice(0,10)
      .map(task => ({
        id: task._id,
        type: (!task.updatedAt||task.updatedAt===task.createdAt) ? 'created' : 'updated',
        task: task.title,
        user: task.creator?.name || 'Unknown',
        timestamp: task.updatedAt || task.createdAt,
        priority: task.priority,
      }));
  }, [tasks]);

  const card = {
    background: T.surfaceCard,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };

  if (activities.length === 0) {
    return (
      <div style={{ ...card, padding:'3rem 2rem', textAlign:'center' }}>
        <Clock style={{ width:40, height:40, color:T.muted, margin:'0 auto 12px' }} />
        <p style={{ fontSize:14, fontWeight:600, color:T.text2, marginBottom:4 }}>No Activity Yet</p>
        <p style={{ fontSize:12.5, color:T.muted }}>Task activities will appear here</p>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ display:'flex', alignItems:'center', gap:7, padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
        <Clock style={{ width:14, height:14, color:'#6366f1' }} />
        <p style={{ fontSize:13.5, fontWeight:700, color:T.text }}>Recent Activity</p>
      </div>
      <div style={{ padding:'8px 8px' }}>
        {activities.map(activity => {
          const tc = TYPE_CFG[activity.type] || TYPE_CFG.default;
          const pc = PRIORITY_CFG[activity.priority] || PRIORITY_CFG.low;
          const { Icon } = tc;
          return (
            <div key={activity.id}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, transition:'background 0.15s', cursor:'default' }}
              onMouseEnter={e => e.currentTarget.style.background = T.s2}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width:30, height:30, borderRadius:6, flexShrink:0, background:tc.bg, color:tc.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon style={{ width:13, height:13 }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12.5, color:T.text, lineHeight:1.4 }}>
                  <strong>{activity.user}</strong>{' '}{activity.type==='created'?'created':'updated'}{' '}
                  <span style={{ color:'#6366f1', fontWeight:600 }}>{activity.task}</span>
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                  <span style={{ fontSize:11, color:T.muted }}>{timeAgo(activity.timestamp)}</span>
                  {activity.priority && (
                    <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:20, background:pc.bg, color:pc.color, textTransform:'capitalize' }}>
                      {activity.priority}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background:grad(activity.user), display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white' }}>
                {activity.user.charAt(0).toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}