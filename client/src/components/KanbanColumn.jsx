import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useThemeColors } from '../hooks/useTheme';

const COL_CFG = {
  todo:        { dot:'#6b7280', dotShadow:'rgba(107,114,128,0.7)', label:'TO DO',       labelColor:'#9ca3af', badgeBg:'rgba(107,114,128,0.2)', badgeColor:'#9ca3af', badgeBorder:'rgba(107,114,128,0.28)', borderHover:'rgba(107,114,128,0.6)', addHoverBg:'rgba(107,114,128,0.08)', dropGlow:'rgba(107,114,128,0.3)' },
  in_progress: { dot:'#6366f1', dotShadow:'rgba(99,102,241,0.75)',  label:'IN PROGRESS', labelColor:'#818cf8', badgeBg:'rgba(99,102,241,0.18)',  badgeColor:'#818cf8', badgeBorder:'rgba(99,102,241,0.3)',  borderHover:'rgba(99,102,241,0.65)', addHoverBg:'rgba(99,102,241,0.08)',  dropGlow:'rgba(99,102,241,0.35)'  },
  done:        { dot:'#10b981', dotShadow:'rgba(16,185,129,0.75)',  label:'DONE',        labelColor:'#10b981', badgeBg:'rgba(16,185,129,0.18)',  badgeColor:'#10b981', badgeBorder:'rgba(16,185,129,0.3)',  borderHover:'rgba(16,185,129,0.6)', addHoverBg:'rgba(16,185,129,0.08)',  dropGlow:'rgba(16,185,129,0.3)'   },
};

export default function KanbanColumn({ status, title, tasks, onTaskClick, onAddTask, onDeleteTask, workspaceId }) {
  const T = useThemeColors();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const cfg = COL_CFG[status] ?? COL_CFG.todo;
  const [addHov, setAddHov] = useState(false);

  return (
    <div style={{
      flex: '1 1 0', minWidth: 240,
      display: 'flex', flexDirection: 'column',
      background: isOver ? `${T.s2}` : T.s2,
      border: `1.5px solid ${isOver ? cfg.borderHover : T.border2}`,
      borderRadius: 14, overflow: 'hidden',
      transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
      boxShadow: isOver
        ? `0 0 0 1px ${cfg.dot}33, 0 0 28px ${cfg.dropGlow}, 0 8px 32px rgba(0,0,0,0.2)`
        : `0 2px 12px rgba(0,0,0,0.06)`,
    }} role="region" aria-label={`${title} column`}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px 16px 0 16px', flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: cfg.dot, boxShadow: `0 0 ${isOver?'12px':'8px'} ${cfg.dotShadow}`, transition: 'box-shadow 0.18s' }}/>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: cfg.labelColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cfg.label}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 8px', borderRadius: 20, background: cfg.badgeBg, color: cfg.badgeColor, border: `1px solid ${cfg.badgeBorder}`, lineHeight: 1.6 }}>{tasks.length}</span>
      </div>

      {/* Add button */}
      <div style={{ padding: '10px 10px 6px', flexShrink: 0 }}>
        <button onClick={onAddTask} onMouseEnter={() => setAddHov(true)} onMouseLeave={() => setAddHov(false)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, cursor: 'pointer', background: addHov ? cfg.addHoverBg : T.border, border: `1.5px dashed ${addHov ? cfg.dot+'70' : T.border2}`, color: addHov ? cfg.labelColor : T.muted, fontSize: 12.5, fontWeight: 500, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' }}>
          <Plus size={13} strokeWidth={2.2}/> Add Task
        </button>
      </div>

      {/* Task list */}
      <div ref={setNodeRef}
        style={{ padding: '4px 10px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, background: isOver ? `${cfg.dot}08` : 'transparent', transition: 'background 0.18s', outline: isOver&&tasks.length===0 ? `2px dashed ${cfg.dot}55` : 'none', outlineOffset: -6, borderRadius: isOver&&tasks.length===0 ? 8 : 0, minHeight: 80 }}
        role="list" aria-label={`${title} tasks`}>
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? tasks.map(task => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} onDelete={onDeleteTask} workspaceId={workspaceId} />
          )) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:'36px 20px 28px', textAlign:'center', animation: isOver?'col-pulse 0.8s ease-in-out infinite alternate':'none' }}>
              <style>{`@keyframes col-pulse { from{opacity:0.5} to{opacity:1} }`}</style>
              <div style={{ width:40, height:40, borderRadius:11, background: isOver?`${cfg.dot}18`:T.border, border:`1px solid ${isOver?cfg.dot+'55':T.border2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'all 0.18s' }}>
                {status==='done'?'✅':status==='in_progress'?'⚡':'📋'}
              </div>
              <div>
                <p style={{ color:isOver?cfg.labelColor:T.muted, fontSize:12.5, fontWeight:600, marginBottom:3, transition:'color 0.18s' }}>{isOver?'Drop here':'No tasks yet'}</p>
                <p style={{ color:T.muted, fontSize:11.5 }}>{isOver?'':'Drag tasks here or create new ones'}</p>
              </div>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}