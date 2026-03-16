import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MessageSquare, AlertCircle, GripVertical, Trash2, Eye } from 'lucide-react';
import { memo, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useThemeColors } from '../hooks/useTheme';

const PRIORITY = {
  low:    { dot:'#94a3b8', label:'Low',    color:'#94a3b8', glow:'rgba(148,163,184,0.35)', border:'rgba(148,163,184,0.2)'  },
  medium: { dot:'#6366f1', label:'Medium', color:'#818cf8', glow:'rgba(99,102,241,0.35)',  border:'rgba(99,102,241,0.2)'   },
  high:   { dot:'#f59e0b', label:'High',   color:'#fbbf24', glow:'rgba(245,158,11,0.35)',  border:'rgba(245,158,11,0.2)'   },
  urgent: { dot:'#ef4444', label:'Urgent', color:'#f87171', glow:'rgba(239,68,68,0.4)',    border:'rgba(239,68,68,0.25)'   },
};
const TAG_COLORS = {
  documentation: { bg:'rgba(59,130,246,0.15)',  color:'#93c5fd', border:'rgba(59,130,246,0.25)' },
  backend:       { bg:'rgba(59,130,246,0.15)',  color:'#93c5fd', border:'rgba(59,130,246,0.25)' },
  security:      { bg:'rgba(239,68,68,0.15)',   color:'#fca5a5', border:'rgba(239,68,68,0.25)'  },
  bug:           { bg:'rgba(239,68,68,0.15)',   color:'#fca5a5', border:'rgba(239,68,68,0.25)'  },
  testing:       { bg:'rgba(245,158,11,0.15)',  color:'#fcd34d', border:'rgba(245,158,11,0.25)' },
  ux:            { bg:'rgba(168,85,247,0.15)',  color:'#d8b4fe', border:'rgba(168,85,247,0.25)' },
  design:        { bg:'rgba(168,85,247,0.15)',  color:'#d8b4fe', border:'rgba(168,85,247,0.25)' },
  frontend:      { bg:'rgba(6,182,212,0.15)',   color:'#67e8f9', border:'rgba(6,182,212,0.25)'  },
  api:           { bg:'rgba(16,185,129,0.15)',  color:'#6ee7b7', border:'rgba(16,185,129,0.25)' },
};
const getTag = t => TAG_COLORS[t?.toLowerCase()] ?? { bg:'rgba(99,102,241,0.15)', color:'#a5b4fc', border:'rgba(99,102,241,0.25)' };

function TaskCard({ task, onClick, onDelete, workspaceId }) {
  const T = useThemeColors();
  const [hovered, setHovered] = useState(false);
  const { user }  = useSelector(s => s.auth);
  const isMobile  = useMemo(() => window.innerWidth < 768, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  const p         = PRIORITY[task.priority] ?? PRIORITY.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const canDelete = task.createdBy === user?._id || user?.role === 'admin';
  const showAct   = isMobile || hovered;

  const handleDelete = async e => {
    e.stopPropagation();
    if (window.confirm(`Delete "${task.title}"?`))
      if (onDelete) await onDelete(task._id, workspaceId);
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} onClick={onClick}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        opacity: isDragging ? 0.4 : 1,
        background: hovered ? T.s3 : T.s2,
        border: `1px solid ${hovered ? p.border : T.border}`,
        borderRadius: 12, padding: '13px 14px 11px', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        boxShadow: hovered
          ? `0 0 0 1px ${p.border}, 0 10px 36px rgba(0,0,0,0.15), 0 0 20px ${p.glow}`
          : `0 2px 8px rgba(0,0,0,0.06)`,
      }}>

      {/* Action buttons */}
      <div style={{ position:'absolute', top:9, right:9, zIndex:10, display:'flex', alignItems:'center', gap:4, opacity:showAct?1:0, transform:showAct?'translateY(0)':'translateY(-4px)', transition:'opacity 0.15s, transform 0.15s' }}>
        <button onClick={e=>{e.stopPropagation();onClick();}}
          style={{ width:25, height:25, borderRadius:7, border:'none', cursor:'pointer', background:'rgba(99,102,241,0.9)', color:'white', display:'grid', placeItems:'center', boxShadow:'0 2px 8px rgba(99,102,241,0.5)', transition:'transform 0.1s' }}
          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.12)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
        ><Eye size={11}/></button>
        {canDelete && (
          <button onClick={handleDelete}
            style={{ width:25, height:25, borderRadius:7, border:'none', cursor:'pointer', background:'rgba(239,68,68,0.9)', color:'white', display:'grid', placeItems:'center', boxShadow:'0 2px 8px rgba(239,68,68,0.45)', transition:'transform 0.1s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.12)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          ><Trash2 size={11}/></button>
        )}
        <div style={{ padding:'4px 2px', opacity:0.3, cursor:'grab' }}>
          <GripVertical size={11} color={T.dim}/>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:2 }}>
        {/* Priority row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:p.dot, boxShadow:`0 0 6px ${p.glow}` }}/>
            <span style={{ fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:p.color, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{p.label}</span>
          </div>
          {isOverdue && (
            <div style={{ display:'flex', alignItems:'center', gap:3, background:'rgba(239,68,68,0.13)', border:'1px solid rgba(239,68,68,0.28)', borderRadius:20, padding:'2px 7px' }}>
              <AlertCircle size={9} color="#ef4444"/>
              <span style={{ fontSize:9.5, fontWeight:700, color:'#ef4444' }}>Overdue</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontWeight:600, fontSize:13.5, lineHeight:1.4, letterSpacing:'-0.025em', color:T.text, marginBottom:task.description?5:0, paddingRight:showAct?72:0, overflow:'hidden', display:'-webkit-box', WebkitBoxOrient:'vertical', WebkitLineClamp:2, fontFamily:"'Inter', sans-serif" }}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p style={{ fontSize:12, color:T.muted, lineHeight:1.5, marginBottom:9, letterSpacing:'-0.01em', overflow:'hidden', display:'-webkit-box', WebkitBoxOrient:'vertical', WebkitLineClamp:2 }}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10, marginTop:task.description?0:8 }}>
            {task.tags.slice(0,3).map((tag,i) => {
              const ts = getTag(tag);
              return <span key={i} style={{ padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:600, background:ts.bg, color:ts.color, border:`1px solid ${ts.border}` }}>{tag}</span>;
            })}
            {task.tags.length > 3 && <span style={{ padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:600, background:T.border, color:T.muted, border:`1px solid ${T.border2}` }}>+{task.tags.length-3}</span>}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:9, borderTop:`1px solid ${T.border}`, marginTop:task.tags?.length?0:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {task.assignee && (
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#6366f1,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9.5, fontWeight:700, color:'white', boxShadow:'0 0 0 1.5px rgba(99,102,241,0.3)' }}>
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize:11.5, color:T.muted, fontWeight:500 }}>{task.assignee.name.split(' ')[0]}</span>
              </div>
            )}
            {task.comments?.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:3, color:T.muted }}>
                <MessageSquare size={10.5}/><span style={{ fontSize:11, fontWeight:600 }}>{task.comments.length}</span>
              </div>
            )}
          </div>
          {task.dueDate && (
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:500, background:isOverdue?'rgba(239,68,68,0.13)':T.border, color:isOverdue?'#ef4444':T.muted, border:`1px solid ${isOverdue?'rgba(239,68,68,0.28)':T.border2}` }}>
              <Clock size={9.5}/>
              {new Date(task.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(TaskCard);