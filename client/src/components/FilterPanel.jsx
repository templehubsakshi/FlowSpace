// // import { useSelector } from 'react-redux';
// // import { Filter, X, ChevronDown } from 'lucide-react';
// // import { useState, useRef, useEffect } from 'react';

// // const PRIORITIES = [
// //   { value: 'low',    label: 'Low',    color: 'var(--status-low)',    bg: 'var(--status-low-bg)' },
// //   { value: 'medium', label: 'Medium', color: 'var(--status-medium)', bg: 'var(--status-medium-bg)' },
// //   { value: 'high',   label: 'High',   color: 'var(--status-high)',   bg: 'var(--status-high-bg)' },
// //   { value: 'urgent', label: 'Urgent', color: '#f43f5e',              bg: 'rgba(244,63,94,0.1)' },
// // ];

// // const STATUSES = [
// //   { value: 'todo',        label: 'To Do',       color: 'var(--status-todo)',     bg: 'var(--status-todo-bg)' },
// //   { value: 'in_progress', label: 'In Progress', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
// //   { value: 'done',        label: 'Done',        color: 'var(--status-done)',     bg: 'var(--status-done-bg)' },
// // ];

// // const pillBtn = (active, color, bg) => ({
// //   padding: '4px 12px',
// //   borderRadius: 'var(--radius-full)',
// //   fontSize: 12, fontWeight: 600,
// //   cursor: 'pointer', border: `1px solid ${active ? color : 'var(--border-default)'}`,
// //   background: active ? bg : 'transparent',
// //   color: active ? color : 'var(--text-tertiary)',
// //   transition: 'var(--transition-fast)',
// //   fontFamily: 'inherit',
// // });

// // export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
// //   const { currentWorkspace } = useSelector(state => state.workspace);
// //   const [open, setOpen] = useState(false);
// //   const ref = useRef(null);

// //   useEffect(() => {
// //     const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
// //     document.addEventListener('mousedown', handler);
// //     return () => document.removeEventListener('mousedown', handler);
// //   }, []);

// //   const activeCount = Object.values(filters).filter(f => Array.isArray(f) ? f.length > 0 : f).length;

// //   const toggle = (key, val, current) => {
// //     const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
// //     onFilterChange(key, next);
// //   };

// //   return (
// //     <div style={{ position: 'relative' }} ref={ref}>

// //       {/* Toggle button */}
// //       <button
// //         onClick={() => setOpen(v => !v)}
// //         style={{
// //           display: 'flex', alignItems: 'center', gap: 6,
// //           padding: '7px 12px',
// //           background: open ? 'var(--surface-hover)' : 'var(--surface-sunken)',
// //           border: `1px solid ${open ? 'var(--border-strong)' : 'var(--border-default)'}`,
// //           borderRadius: 'var(--radius-md)',
// //           fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)',
// //           cursor: 'pointer', fontFamily: 'inherit',
// //           transition: 'var(--transition-fast)',
// //         }}
// //       >
// //         <Filter style={{ width: 13, height: 13 }} />
// //         Filters
// //         {activeCount > 0 && (
// //           <span style={{
// //             padding: '1px 7px', borderRadius: 'var(--radius-full)',
// //             background: 'var(--brand-primary)', color: 'white',
// //             fontSize: 10.5, fontWeight: 700,
// //           }}>
// //             {activeCount}
// //           </span>
// //         )}
// //         <ChevronDown style={{
// //           width: 13, height: 13,
// //           transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
// //           transition: 'transform 0.2s',
// //         }} />
// //       </button>

// //       {/* Dropdown panel */}
// //       {open && (
// //         <div style={{
// //           position: 'absolute', top: 'calc(100% + 8px)', right: 0,
// //           width: 300, zIndex: 999,
// //           background: 'var(--surface-overlay)',
// //           border: '1px solid var(--border-default)',
// //           borderRadius: 'var(--radius-lg)',
// //           boxShadow: 'var(--shadow-xl)',
// //           padding: 18,
// //           display: 'flex', flexDirection: 'column', gap: 16,
// //         }}>

// //           {/* Priority */}
// //           <div>
// //             <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
// //               Priority
// //             </p>
// //             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
// //               {PRIORITIES.map(opt => {
// //                 const active = filters.priorities.includes(opt.value);
// //                 return (
// //                   <button key={opt.value} onClick={() => toggle('priorities', opt.value, filters.priorities)}
// //                     style={pillBtn(active, opt.color, opt.bg)}
// //                     onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.color = opt.color; } }}
// //                     onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-tertiary)'; } }}
// //                   >
// //                     {opt.label}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>

// //           {/* Divider */}
// //           <div style={{ height: 1, background: 'var(--border-subtle)' }} />

// //           {/* Status */}
// //           <div>
// //             <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
// //               Status
// //             </p>
// //             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
// //               {STATUSES.map(opt => {
// //                 const active = filters.statuses.includes(opt.value);
// //                 return (
// //                   <button key={opt.value} onClick={() => toggle('statuses', opt.value, filters.statuses)}
// //                     style={pillBtn(active, opt.color, opt.bg)}
// //                     onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.color = opt.color; } }}
// //                     onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-tertiary)'; } }}
// //                   >
// //                     {opt.label}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>

// //           {/* Assignee */}
// //           {currentWorkspace?.members && (
// //             <>
// //               <div style={{ height: 1, background: 'var(--border-subtle)' }} />
// //               <div>
// //                 <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
// //                   Assignee
// //                 </p>
// //                 <select
// //                   value={filters.assignee || ''}
// //                   onChange={e => onFilterChange('assignee', e.target.value)}
// //                   style={{
// //                     width: '100%', padding: '7px 10px',
// //                     background: 'var(--surface-sunken)',
// //                     border: '1px solid var(--border-default)',
// //                     borderRadius: 'var(--radius-md)',
// //                     fontSize: 12.5, color: 'var(--text-primary)',
// //                     outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
// //                   }}
// //                 >
// //                   <option value="">All Members</option>
// //                   <option value="unassigned">Unassigned</option>
// //                   {currentWorkspace.members.map(m => (
// //                     <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
// //                   ))}
// //                 </select>
// //               </div>
// //             </>
// //           )}

// //           {/* Clear */}
// //           {activeCount > 0 && (
// //             <>
// //               <div style={{ height: 1, background: 'var(--border-subtle)' }} />
// //               <button
// //                 onClick={() => { onClearFilters(); setOpen(false); }}
// //                 style={{
// //                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
// //                   padding: '7px 12px',
// //                   background: 'var(--status-high-bg)',
// //                   border: '1px solid rgba(239,68,68,0.2)',
// //                   borderRadius: 'var(--radius-md)',
// //                   fontSize: 12.5, fontWeight: 600, color: 'var(--status-high)',
// //                   cursor: 'pointer', fontFamily: 'inherit',
// //                   transition: 'var(--transition-fast)',
// //                 }}
// //               >
// //                 <X style={{ width: 12, height: 12 }} />
// //                 Clear All Filters
// //               </button>
// //             </>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// import { useSelector } from 'react-redux';
// import { Filter, X, ChevronDown } from 'lucide-react';
// import { useState, useRef, useEffect } from 'react';

// const PRIORITIES = [
//   { value: 'low',    label: 'Low',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
//   { value: 'medium', label: 'Medium', color: '#6366f1', bg: 'rgba(99,102,241,0.14)' },
//   { value: 'high',   label: 'High',   color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
//   { value: 'urgent', label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.14)' },
// ];

// const STATUSES = [
//   { value: 'todo',        label: 'To Do',       color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
//   { value: 'in_progress', label: 'In Progress', color: '#6366f1', bg: 'rgba(99,102,241,0.14)' },
//   { value: 'done',        label: 'Done',        color: '#10b981', bg: 'rgba(16,185,129,0.14)' },
// ];

// const TOKENS = {
//   surface: '#0f1117',
//   surface2: '#141824',
//   surface3: '#1a1f30',
//   border: 'rgba(255,255,255,0.06)',
//   border2: 'rgba(255,255,255,0.10)',
//   border3: 'rgba(255,255,255,0.15)',
//   text: '#e2e8f0',
//   text2: '#cbd5e1',
//   muted: '#64748b',
//   dim: '#94a3b8',
//   accent: '#6366f1',
//   accent2: '#818cf8',
//   red: '#ef4444',
// };

// const sectionLabelStyle = {
//   fontSize: 11,
//   fontWeight: 700,
//   color: TOKENS.muted,
//   textTransform: 'uppercase',
//   letterSpacing: '0.08em',
//   marginBottom: 9,
// };

// const dividerStyle = {
//   height: 1,
//   background: TOKENS.border,
// };

// const pillBtn = (active, color, bg) => ({
//   padding: '5px 12px',
//   borderRadius: 999,
//   fontSize: 12,
//   fontWeight: 600,
//   cursor: 'pointer',
//   border: `1px solid ${active ? color : TOKENS.border2}`,
//   background: active ? bg : TOKENS.surface2,
//   color: active ? color : TOKENS.dim,
//   transition: 'all 0.15s ease',
//   fontFamily: 'inherit',
//   letterSpacing: '-0.01em',
// });

// export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
//   const { currentWorkspace } = useSelector(state => state.workspace);
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = e => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const activeCount =
//     (filters?.priorities?.length || 0) +
//     (filters?.statuses?.length || 0) +
//     (filters?.assignee ? 1 : 0);

//   const toggle = (key, val, current = []) => {
//     const next = current.includes(val)
//       ? current.filter(v => v !== val)
//       : [...current, val];

//     onFilterChange(key, next);
//   };

//   return (
//     <div style={{ position: 'relative', flexShrink: 0 }} ref={ref}>
//       <button
//         onClick={() => setOpen(v => !v)}
//         style={{
//           width: 34,
//           height: 34,
//           borderRadius: 9,
//           background: open
//             ? 'rgba(99,102,241,0.12)'
//             : activeCount > 0
//             ? 'rgba(99,102,241,0.12)'
//             : TOKENS.surface2,
//           border: `1px solid ${
//             open || activeCount > 0
//               ? 'rgba(99,102,241,0.28)'
//               : TOKENS.border2
//           }`,
//           display: 'grid',
//           placeItems: 'center',
//           cursor: 'pointer',
//           color: open || activeCount > 0 ? TOKENS.accent2 : TOKENS.dim,
//           position: 'relative',
//           transition: 'all 0.15s ease',
//         }}
//         onMouseEnter={e => {
//           if (!open && activeCount === 0) {
//             e.currentTarget.style.background = TOKENS.surface3;
//             e.currentTarget.style.borderColor = TOKENS.border3;
//             e.currentTarget.style.color = TOKENS.text;
//           }
//         }}
//         onMouseLeave={e => {
//           if (!open && activeCount === 0) {
//             e.currentTarget.style.background = TOKENS.surface2;
//             e.currentTarget.style.borderColor = TOKENS.border2;
//             e.currentTarget.style.color = TOKENS.dim;
//           }
//         }}
//         aria-label="Open filters"
//       >
//         <Filter size={14} strokeWidth={1.8} />
//         {activeCount > 0 && (
//           <div
//             style={{
//               position: 'absolute',
//               top: -5,
//               right: -5,
//               width: 16,
//               height: 16,
//               borderRadius: '50%',
//               background: TOKENS.accent,
//               fontSize: 9,
//               fontWeight: 700,
//               display: 'grid',
//               placeItems: 'center',
//               color: 'white',
//               border: `2px solid ${TOKENS.surface}`,
//               lineHeight: 1,
//             }}
//           >
//             {activeCount}
//           </div>
//         )}
//       </button>

//       {open && (
//         <div
//           style={{
//             position: 'absolute',
//             top: 'calc(100% + 10px)',
//             right: 0,
//             width: 340,
//             zIndex: 9999,
//             background: 'rgba(15,17,23,0.98)',
//             border: `1px solid ${TOKENS.border2}`,
//             borderRadius: 18,
//             boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
//             backdropFilter: 'blur(18px)',
//             WebkitBackdropFilter: 'blur(18px)',
//             padding: 16,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 14,
//             animation: 'fadeInScale 0.18s ease-out',
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//             <div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.text }}>
//                 Filters
//               </div>
//               <div style={{ fontSize: 11.5, color: TOKENS.muted, marginTop: 2 }}>
//                 Refine board tasks quickly
//               </div>
//             </div>

//             <button
//               onClick={() => setOpen(false)}
//               style={{
//                 width: 28,
//                 height: 28,
//                 borderRadius: 8,
//                 border: `1px solid ${TOKENS.border}`,
//                 background: TOKENS.surface2,
//                 color: TOKENS.dim,
//                 cursor: 'pointer',
//                 display: 'grid',
//                 placeItems: 'center',
//                 transition: 'all 0.15s ease',
//               }}
//               onMouseEnter={e => {
//                 e.currentTarget.style.background = TOKENS.surface3;
//                 e.currentTarget.style.color = TOKENS.text;
//               }}
//               onMouseLeave={e => {
//                 e.currentTarget.style.background = TOKENS.surface2;
//                 e.currentTarget.style.color = TOKENS.dim;
//               }}
//               aria-label="Close filters"
//             >
//               <X size={13} />
//             </button>
//           </div>

//           <div style={dividerStyle} />

//           <div>
//             <p style={sectionLabelStyle}>Priority</p>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
//               {PRIORITIES.map(opt => {
//                 const active = filters.priorities.includes(opt.value);
//                 return (
//                   <button
//                     key={opt.value}
//                     onClick={() => toggle('priorities', opt.value, filters.priorities)}
//                     style={pillBtn(active, opt.color, opt.bg)}
//                     onMouseEnter={e => {
//                       if (!active) {
//                         e.currentTarget.style.borderColor = opt.color;
//                         e.currentTarget.style.color = opt.color;
//                         e.currentTarget.style.background = TOKENS.surface3;
//                       }
//                     }}
//                     onMouseLeave={e => {
//                       if (!active) {
//                         e.currentTarget.style.borderColor = TOKENS.border2;
//                         e.currentTarget.style.color = TOKENS.dim;
//                         e.currentTarget.style.background = TOKENS.surface2;
//                       }
//                     }}
//                   >
//                     {opt.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <div style={dividerStyle} />

//           <div>
//             <p style={sectionLabelStyle}>Status</p>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
//               {STATUSES.map(opt => {
//                 const active = filters.statuses.includes(opt.value);
//                 return (
//                   <button
//                     key={opt.value}
//                     onClick={() => toggle('statuses', opt.value, filters.statuses)}
//                     style={pillBtn(active, opt.color, opt.bg)}
//                     onMouseEnter={e => {
//                       if (!active) {
//                         e.currentTarget.style.borderColor = opt.color;
//                         e.currentTarget.style.color = opt.color;
//                         e.currentTarget.style.background = TOKENS.surface3;
//                       }
//                     }}
//                     onMouseLeave={e => {
//                       if (!active) {
//                         e.currentTarget.style.borderColor = TOKENS.border2;
//                         e.currentTarget.style.color = TOKENS.dim;
//                         e.currentTarget.style.background = TOKENS.surface2;
//                       }
//                     }}
//                   >
//                     {opt.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {currentWorkspace?.members?.length > 0 && (
//             <>
//               <div style={dividerStyle} />

//               <div>
//                 <p style={sectionLabelStyle}>Assignee</p>
//                 <div style={{ position: 'relative' }}>
//                   <select
//                     value={filters.assignee || ''}
//                     onChange={e => onFilterChange('assignee', e.target.value)}
//                     style={{
//                       width: '100%',
//                       padding: '10px 38px 10px 12px',
//                       background: TOKENS.surface2,
//                       border: `1px solid ${TOKENS.border2}`,
//                       borderRadius: 12,
//                       fontSize: 12.5,
//                       color: TOKENS.text,
//                       outline: 'none',
//                       fontFamily: 'inherit',
//                       cursor: 'pointer',
//                       appearance: 'none',
//                       WebkitAppearance: 'none',
//                       MozAppearance: 'none',
//                     }}
//                   >
//                     <option value="">All Members</option>
//                     <option value="unassigned">Unassigned</option>
//                     {currentWorkspace.members.map(m => (
//                       <option key={m.user._id} value={m.user._id}>
//                         {m.user.name}
//                       </option>
//                     ))}
//                   </select>

//                   <ChevronDown
//                     size={14}
//                     style={{
//                       position: 'absolute',
//                       right: 12,
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       color: TOKENS.muted,
//                       pointerEvents: 'none',
//                     }}
//                   />
//                 </div>
//               </div>
//             </>
//           )}

//           {activeCount > 0 && (
//             <>
//               <div style={dividerStyle} />
//               <div style={{ display: 'flex', gap: 10 }}>
//                 <button
//                   onClick={() => {
//                     onClearFilters();
//                   }}
//                   style={{
//                     flex: 1,
//                     padding: '9px 12px',
//                     borderRadius: 12,
//                     border: `1px solid rgba(239,68,68,0.20)`,
//                     background: 'rgba(239,68,68,0.08)',
//                     color: TOKENS.red,
//                     fontSize: 12.5,
//                     fontWeight: 600,
//                     cursor: 'pointer',
//                     fontFamily: 'inherit',
//                     transition: 'all 0.15s ease',
//                   }}
//                   onMouseEnter={e => {
//                     e.currentTarget.style.background = 'rgba(239,68,68,0.14)';
//                   }}
//                   onMouseLeave={e => {
//                     e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
//                   }}
//                 >
//                   Clear all
//                 </button>

//                 <button
//                   onClick={() => setOpen(false)}
//                   style={{
//                     flex: 1,
//                     padding: '9px 12px',
//                     borderRadius: 12,
//                     border: '1px solid rgba(99,102,241,0.24)',
//                     background: 'rgba(99,102,241,0.14)',
//                     color: TOKENS.accent2,
//                     fontSize: 12.5,
//                     fontWeight: 600,
//                     cursor: 'pointer',
//                     fontFamily: 'inherit',
//                     transition: 'all 0.15s ease',
//                   }}
//                   onMouseEnter={e => {
//                     e.currentTarget.style.background = 'rgba(99,102,241,0.20)';
//                   }}
//                   onMouseLeave={e => {
//                     e.currentTarget.style.background = 'rgba(99,102,241,0.14)';
//                   }}
//                 >
//                   Apply
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import { useSelector } from 'react-redux';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useThemeColors } from '../hooks/useTheme';

const PRIORITIES = [
  { value: 'low',    label: 'Low',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  { value: 'medium', label: 'Medium', color: '#6366f1', bg: 'rgba(99,102,241,0.14)'  },
  { value: 'high',   label: 'High',   color: '#f59e0b', bg: 'rgba(245,158,11,0.14)'  },
  { value: 'urgent', label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.14)'   },
];
const STATUSES = [
  { value: 'todo',        label: 'To Do',       color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  { value: 'in_progress', label: 'In Progress', color: '#6366f1', bg: 'rgba(99,102,241,0.14)'  },
  { value: 'done',        label: 'Done',        color: '#10b981', bg: 'rgba(16,185,129,0.14)'  },
];

export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  const T = useThemeColors();
  const { currentWorkspace } = useSelector(state => state.workspace);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCount =
    (filters?.priorities?.length || 0) +
    (filters?.statuses?.length || 0) +
    (filters?.assignee ? 1 : 0);

  const toggle = (key, val, current = []) => {
    const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    onFilterChange(key, next);
  };

  const pillBtn = (active, color, bg) => ({
    padding: '5px 12px', borderRadius: 999,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${active ? color : T.border2}`,
    background: active ? bg : T.s2,
    color: active ? color : T.dim,
    transition: 'all 0.15s ease',
    fontFamily: 'inherit', letterSpacing: '-0.01em',
  });

  return (
    <div style={{ position: 'relative', flexShrink: 0 }} ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 34, height: 34, borderRadius: 9,
          background: open || activeCount > 0 ? 'rgba(99,102,241,0.12)' : T.s2,
          border: `1px solid ${open || activeCount > 0 ? 'rgba(99,102,241,0.28)' : T.border2}`,
          display: 'grid', placeItems: 'center', cursor: 'pointer',
          color: open || activeCount > 0 ? '#818cf8' : T.dim,
          position: 'relative', transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          if (!open && activeCount === 0) {
            e.currentTarget.style.background = T.s3;
            e.currentTarget.style.borderColor = T.border3;
            e.currentTarget.style.color = T.text;
          }
        }}
        onMouseLeave={e => {
          if (!open && activeCount === 0) {
            e.currentTarget.style.background = T.s2;
            e.currentTarget.style.borderColor = T.border2;
            e.currentTarget.style.color = T.dim;
          }
        }}
        aria-label="Open filters"
      >
        <Filter size={14} strokeWidth={1.8} />
        {activeCount > 0 && (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            width: 16, height: 16, borderRadius: '50%',
            background: '#6366f1', fontSize: 9, fontWeight: 700,
            display: 'grid', placeItems: 'center', color: 'white',
            border: `2px solid ${T.surface}`, lineHeight: 1,
          }}>
            {activeCount}
          </div>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 340, zIndex: 9999,
          background: T.surface,
          border: `1px solid ${T.border2}`,
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
          animation: 'fadeInScale 0.18s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Filters</div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>Refine board tasks quickly</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 28, height: 28, borderRadius: 8,
                border: `1px solid ${T.border}`, background: T.s2,
                color: T.dim, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.s3; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.s2; e.currentTarget.style.color = T.dim; }}
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Priority */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>Priority</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {PRIORITIES.map(opt => {
                const active = filters.priorities.includes(opt.value);
                return (
                  <button key={opt.value} onClick={() => toggle('priorities', opt.value, filters.priorities)} style={pillBtn(active, opt.color, opt.bg)}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.color = opt.color; e.currentTarget.style.background = T.s3; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.dim; e.currentTarget.style.background = T.s2; } }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Status */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>Status</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {STATUSES.map(opt => {
                const active = filters.statuses.includes(opt.value);
                return (
                  <button key={opt.value} onClick={() => toggle('statuses', opt.value, filters.statuses)} style={pillBtn(active, opt.color, opt.bg)}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.color = opt.color; e.currentTarget.style.background = T.s3; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = T.dim; e.currentTarget.style.background = T.s2; } }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {currentWorkspace?.members?.length > 0 && (
            <>
              <div style={{ height: 1, background: T.border }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>Assignee</p>
                <div style={{ position: 'relative' }}>
                  <select
                    value={filters.assignee || ''}
                    onChange={e => onFilterChange('assignee', e.target.value)}
                    style={{
                      width: '100%', padding: '10px 38px 10px 12px',
                      background: T.s2, border: `1px solid ${T.border2}`,
                      borderRadius: 12, fontSize: 12.5, color: T.text,
                      outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                      appearance: 'none', WebkitAppearance: 'none',
                    }}
                  >
                    <option value="">All Members</option>
                    <option value="unassigned">Unassigned</option>
                    {currentWorkspace.members.map(m => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
                </div>
              </div>
            </>
          )}

          {activeCount > 0 && (
            <>
              <div style={{ height: 1, background: T.border }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={onClearFilters}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.20)', background: 'rgba(239,68,68,0.08)', color: T.red, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                >
                  Clear all
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.24)', background: 'rgba(99,102,241,0.14)', color: '#818cf8', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.20)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.14)'}
                >
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}