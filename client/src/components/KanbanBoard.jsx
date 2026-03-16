// // import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
// // import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import {
// //   DndContext,
// //   DragOverlay,
// //   closestCorners,
// //   PointerSensor,
// //   KeyboardSensor,
// //   TouchSensor,
// //   useSensor,
// //   useSensors,
// // } from '@dnd-kit/core';
// // import {
// //   fetchTasks,
// //   optimisticMoveTask,
// //   moveTask,
// //   rollbackMoveTask,
// //   setSelectedTask,
// //   deleteTask,
// //   addComment,
// // } from '../redux/slices/taskSlice';
// // import { calculateStatistics } from '../redux/slices/statisticsSlice';
// // import KanbanColumn from './KanbanColumn';
// // import TaskCard from './TaskCard';
// // import SkeletonCard from './SkeletonCard';
// // import LoadingSpinner from './LoadingSpinner';
// // import toast from 'react-hot-toast';
// // import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
// // import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// // const CreateTaskModal = lazy(() => import('./CreateTaskModal'));
// // const TaskDetailModal = lazy(() => import('./TaskDetailModal'));

// // /* ─── Design tokens ─── */
// // const T = {
// //   bg: '#0b0d14',
// //   surface: '#0f1117',
// //   surface2: '#141824',
// //   surface3: '#1a1f30',
// //   border: 'rgba(255,255,255,0.06)',
// //   border2: 'rgba(255,255,255,0.10)',
// //   text: '#e2e8f0',
// //   text2: '#cbd5e1',
// //   muted: '#64748b',
// //   dim: '#94a3b8',
// //   green: '#10b981',
// //   green2: '#34d399',
// //   indigo: '#6366f1',
// //   indigo2: '#818cf8',
// //   red: '#ef4444',
// // };

// // /* ─── Custom donut tooltip ─── */
// // const DonutTooltip = ({ active, payload }) => {
// //   if (!active || !payload?.length) return null;

// //   return (
// //     <div
// //       style={{
// //         background: '#1a1f30',
// //         border: '1px solid rgba(255,255,255,0.10)',
// //         borderRadius: 9,
// //         padding: '5px 11px',
// //         fontSize: 11.5,
// //         fontWeight: 600,
// //         color: T.text,
// //         boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
// //       }}
// //     >
// //       {payload[0].name}:{' '}
// //       <span style={{ color: payload[0].payload.color }}>{payload[0].value}</span>
// //     </div>
// //   );
// // };

// // /* ─── Stat card — reusable for Overview section ─── */
// // function StatCard({ label, value, color, iconBg, Icon: IconComp }) {
// //   const [hov, setHov] = useState(false);

// //   return (
// //     <div
// //       onMouseEnter={() => setHov(true)}
// //       onMouseLeave={() => setHov(false)}
// //       style={{
// //         background: T.surface2,
// //         border: `1px solid ${hov ? T.border2 : T.border}`,
// //         borderRadius: 13,
// //         padding: '13px 15px',
// //         display: 'flex',
// //         alignItems: 'center',
// //         gap: 12,
// //         transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
// //         transform: hov ? 'translateY(-1px)' : 'none',
// //         boxShadow: hov ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
// //         cursor: 'default',
// //       }}
// //     >
// //       <div
// //         style={{
// //           width: 34,
// //           height: 34,
// //           borderRadius: 9,
// //           flexShrink: 0,
// //           background: iconBg,
// //           display: 'grid',
// //           placeItems: 'center',
// //           transition: 'box-shadow 0.15s',
// //           boxShadow: hov ? `0 0 14px ${iconBg}` : 'none',
// //         }}
// //       >
// //         <IconComp size={15} color={color} />
// //       </div>

// //       <div>
// //         <div
// //           style={{
// //             fontSize: 11,
// //             color: T.muted,
// //             marginBottom: 4,
// //             letterSpacing: '-0.01em',
// //             lineHeight: 1,
// //           }}
// //         >
// //           {label}
// //         </div>
// //         <div
// //           style={{
// //             fontWeight: 800,
// //             fontSize: 30,
// //             lineHeight: 1,
// //             fontFeatureSettings: "'tnum' 1",
// //             fontFamily: "'Plus Jakarta Sans', sans-serif",
// //             letterSpacing: '-0.03em',
// //             color,
// //           }}
// //         >
// //           {value}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════
// //    KANBAN BOARD
// // ══════════════════════════════════════════ */
// // export default function KanbanBoard({
// //   searchQuery = '',
// //   filters = { priorities: [], statuses: [], assignee: '' },
// // }) {
// //   const dispatch = useDispatch();
// //   const { currentWorkspace } = useSelector(s => s.workspace);
// //   const workspaceId = currentWorkspace?._id;
// //   const { socket, isConnected } = useWorkspaceSocket(workspaceId);
// //   const { tasks, selectedTask, isLoading } = useSelector(s => s.tasks);
// //   const statistics = useSelector(s => s.statistics);

// //   const [activeTask, setActiveTask] = useState(null);
// //   const [showCreateModal, setShowCreateModal] = useState(false);
// //   const [createModalStatus, setCreateModalStatus] = useState('todo');

// //   const workspaceMembers = useMemo(
// //     () =>
// //       currentWorkspace?.members?.map(m => ({
// //         _id: m.user?._id || m._id,
// //         name: m.user?.name || m.name,
// //       })) || [],
// //     [currentWorkspace?.members]
// //   );

// //   const sensors = useSensors(
// //     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
// //     useSensor(KeyboardSensor),
// //     useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
// //   );

// //   useEffect(() => {
// //     if (currentWorkspace?._id) {
// //       dispatch(fetchTasks(currentWorkspace._id));
// //     }
// //   }, [currentWorkspace, dispatch]);

// //   useEffect(() => {
// //     dispatch(calculateStatistics(tasks));
// //   }, [tasks, dispatch]);

// //   /* ─── Filter tasks ─── */
// //   const filteredTasks = useMemo(() => {
// //     const f = list =>
// //       list.filter(task => {
// //         if (searchQuery) {
// //           const q = searchQuery.toLowerCase();
// //           if (
// //             !task.title.toLowerCase().includes(q) &&
// //             !task.description?.toLowerCase().includes(q) &&
// //             !task.tags?.some(t => t.toLowerCase().includes(q))
// //           ) {
// //             return false;
// //           }
// //         }

// //         if (filters.priorities.length && !filters.priorities.includes(task.priority)) {
// //           return false;
// //         }

// //         if (filters.statuses.length && !filters.statuses.includes(task.status)) {
// //           return false;
// //         }

// //         if (filters.assignee) {
// //           if (filters.assignee === 'unassigned' && task.assignee) return false;
// //           if (
// //             filters.assignee !== 'unassigned' &&
// //             task.assignee?._id !== filters.assignee
// //           ) {
// //             return false;
// //           }
// //         }

// //         return true;
// //       });

// //     return {
// //       todo: f(tasks.todo || []),
// //       in_progress: f(tasks.in_progress || []),
// //       done: f(tasks.done || []),
// //     };
// //   }, [tasks, searchQuery, filters]);

// //   /* ─── DnD handlers ─── */
// //   const handleDragStart = useCallback(
// //     ({ active }) => {
// //       let found = null;

// //       Object.keys(tasks).forEach(status => {
// //         const task = tasks[status]?.find(t => t._id === active.id);
// //         if (task) found = task;
// //       });

// //       setActiveTask(found);
// //     },
// //     [tasks]
// //   );

// //   const handleDragEnd = useCallback(
// //     ({ active, over }) => {
// //       setActiveTask(null);
// //       if (!over) return;

// //       const taskId = active.id;
// //       let srcStatus;
// //       let srcIdx;

// //       Object.keys(tasks).forEach(status => {
// //         const index = tasks[status]?.findIndex(t => t._id === taskId);
// //         if (index !== -1) {
// //           srcStatus = status;
// //           srcIdx = index;
// //         }
// //       });

// //       let dstStatus;
// //       let dstIdx;

// //       if (['todo', 'in_progress', 'done'].includes(over.id)) {
// //         dstStatus = over.id;
// //         dstIdx = tasks[over.id]?.length || 0;
// //       } else {
// //         Object.keys(tasks).forEach(status => {
// //           const index = tasks[status]?.findIndex(t => t._id === over.id);
// //           if (index !== -1) {
// //             dstStatus = status;
// //             dstIdx = index;
// //           }
// //         });
// //       }

// //       if (!dstStatus || (srcStatus === dstStatus && srcIdx === dstIdx)) return;

// //       dispatch(
// //         optimisticMoveTask({
// //           taskId,
// //           sourceStatus: srcStatus,
// //           destinationStatus: dstStatus,
// //           sourceIndex: srcIdx,
// //           destinationIndex: dstIdx,
// //         })
// //       );

// //       toast.loading('Moving…', { id: taskId });

// //       dispatch(moveTask({ taskId, newStatus: dstStatus, newOrder: dstIdx })).then(res => {
// //         if (res.type.includes('fulfilled')) {
// //           toast.success('Moved!', { id: taskId });

// //           if (socket && isConnected) {
// //             socket.emit('task:move', {
// //               workspaceId,
// //               taskId,
// //               newStatus: dstStatus,
// //               oldStatus: srcStatus,
// //               newOrder: dstIdx,
// //             });
// //           }
// //         } else {
// //           toast.error('Move failed', { id: taskId });

// //           dispatch(
// //             rollbackMoveTask({
// //               taskId,
// //               sourceStatus: srcStatus,
// //               destinationStatus: dstStatus,
// //               sourceIndex: srcIdx,
// //             })
// //           );
// //         }
// //       });
// //     },
// //     [tasks, dispatch, socket, isConnected, workspaceId]
// //   );

// //   const handleTaskClick = useCallback(
// //     task => dispatch(setSelectedTask(task)),
// //     [dispatch]
// //   );

// //   const handleAddTask = useCallback(status => {
// //     setCreateModalStatus(status);
// //     setShowCreateModal(true);
// //   }, []);

// //   const handleDeleteTask = useCallback(
// //     async taskId => {
// //       const id = toast.loading('Deleting…');
// //       const result = await dispatch(deleteTask(taskId));

// //       if (result.type === 'tasks/delete/fulfilled') {
// //         if (socket && isConnected) {
// //           socket.emit('task:delete', { workspaceId, taskId });
// //         }
// //         toast.success('Task deleted', { id });
// //       } else {
// //         toast.error('Delete failed', { id });
// //       }
// //     },
// //     [dispatch, socket, isConnected, workspaceId]
// //   );

// //   const handleAddComment = useCallback(
// //     async (taskId, commentText, mentions = []) => {
// //       const id = toast.loading('Adding comment…');
// //       const result = await dispatch(
// //         addComment({ taskId, text: commentText, mentions })
// //       );

// //       if (result.type === 'tasks/addComment/fulfilled') {
// //         toast.success('Comment added', { id });

// //         if (socket && isConnected) {
// //           socket.emit('comment:add', {
// //             workspaceId,
// //             taskId,
// //             comment: result.payload.comment,
// //           });
// //         }
// //       } else {
// //         toast.error('Failed to add comment', { id });
// //       }
// //     },
// //     [dispatch, socket, isConnected, workspaceId]
// //   );

// //   /* ─── Right panel data ─── */
// //   const completionRate = statistics.completionRate || 0;

// //   const donutData = useMemo(
// //     () =>
// //       [
// //         {
// //           name: 'Done',
// //           value: statistics.tasksByStatus?.done || 0,
// //           color: T.green,
// //         },
// //         {
// //           name: 'In Progress',
// //           value: statistics.tasksByStatus?.in_progress || 0,
// //           color: T.indigo2,
// //         },
// //         {
// //           name: 'Overdue',
// //           value: statistics.overdueTasks || 0,
// //           color: T.red,
// //         },
// //       ].filter(d => d.value > 0),
// //     [statistics]
// //   );

// //   const totalTasks = statistics.totalTasks || 0;

// //   /* ════════════════════════════════════════
// //      RENDER
// //   ════════════════════════════════════════ */
// //   return (
// //     <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
// //       {/* ════════════════════
// //           KANBAN COLUMNS
// //       ════════════════════ */}
// //       <div
// //         style={{
// //           flex: 1,
// //           display: 'flex',
// //           gap: 14,
// //           padding: '18px 16px',
// //           overflowX: 'auto',
// //           overflowY: 'auto',
// //           alignItems: 'flex-start',
// //         }}
// //       >
// //         <DndContext
// //           sensors={sensors}
// //           collisionDetection={closestCorners}
// //           onDragStart={handleDragStart}
// //           onDragEnd={handleDragEnd}
// //         >
// //           <div
// //             style={{
// //               display: 'flex',
// //               gap: 14,
// //               alignItems: 'flex-start',
// //               width: '100%',
// //             }}
// //           >
// //             {isLoading ? (
// //               ['todo', 'in_progress', 'done'].map(col => (
// //                 <div
// //                   key={col}
// //                   style={{
// //                     flex: '1 1 0',
// //                     minWidth: 240,
// //                     background: '#12141f',
// //                     border: '1px solid rgba(255,255,255,0.10)',
// //                     borderRadius: 14,
// //                     padding: '15px 10px',
// //                     display: 'flex',
// //                     flexDirection: 'column',
// //                     gap: 10,
// //                   }}
// //                 >
// //                   <div
// //                     style={{
// //                       display: 'flex',
// //                       alignItems: 'center',
// //                       gap: 8,
// //                       padding: '0 6px 6px',
// //                     }}
// //                   >
// //                     <div
// //                       style={{
// //                         width: 8,
// //                         height: 8,
// //                         borderRadius: '50%',
// //                         background: '#1a1f30',
// //                       }}
// //                     />
// //                     <div
// //                       style={{
// //                         height: 10,
// //                         width: 70,
// //                         borderRadius: 4,
// //                         background: '#1a1f30',
// //                       }}
// //                     />
// //                     <div
// //                       style={{
// //                         height: 18,
// //                         width: 24,
// //                         borderRadius: 10,
// //                         background: '#1a1f30',
// //                       }}
// //                     />
// //                   </div>

// //                   {[1, 2, 3].map(i => (
// //                     <SkeletonCard key={i} />
// //                   ))}
// //                 </div>
// //               ))
// //             ) : (
// //               <>
// //                 <KanbanColumn
// //                   status="todo"
// //                   title="To Do"
// //                   tasks={filteredTasks.todo}
// //                   onTaskClick={handleTaskClick}
// //                   onAddTask={() => handleAddTask('todo')}
// //                   onDeleteTask={handleDeleteTask}
// //                   workspaceId={workspaceId}
// //                 />
// //                 <KanbanColumn
// //                   status="in_progress"
// //                   title="In Progress"
// //                   tasks={filteredTasks.in_progress}
// //                   onTaskClick={handleTaskClick}
// //                   onAddTask={() => handleAddTask('in_progress')}
// //                   onDeleteTask={handleDeleteTask}
// //                   workspaceId={workspaceId}
// //                 />
// //                 <KanbanColumn
// //                   status="done"
// //                   title="Done"
// //                   tasks={filteredTasks.done}
// //                   onTaskClick={handleTaskClick}
// //                   onAddTask={() => handleAddTask('done')}
// //                   onDeleteTask={handleDeleteTask}
// //                   workspaceId={workspaceId}
// //                 />
// //               </>
// //             )}
// //           </div>

// //           <DragOverlay
// //             dropAnimation={{
// //               duration: 180,
// //               easing: 'cubic-bezier(0.18,0.67,0.6,1.22)',
// //             }}
// //           >
// //             {activeTask && (
// //               <div
// //                 style={{
// //                   transform: 'rotate(1.5deg) scale(1.04)',
// //                   opacity: 0.96,
// //                   boxShadow:
// //                     '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(99,102,241,0.4)',
// //                   borderRadius: 13,
// //                   pointerEvents: 'none',
// //                 }}
// //               >
// //                 <TaskCard task={activeTask} />
// //               </div>
// //             )}
// //           </DragOverlay>
// //         </DndContext>
// //       </div>

// //       {/* ════════════════════
// //           RIGHT PANEL
// //       ════════════════════ */}
// //       <aside
// //         style={{
// //           width: 280,
// //           minWidth: 280,
// //           borderLeft: `1px solid ${T.border}`,
// //           background: T.surface,
// //           display: 'flex',
// //           flexDirection: 'column',
// //           padding: '18px 16px 20px',
// //           gap: 12,
// //           overflowY: 'auto',
// //           flexShrink: 0,
// //         }}
// //       >
// //         <p
// //           style={{
// //             fontWeight: 700,
// //             fontSize: 10,
// //             letterSpacing: '0.13em',
// //             textTransform: 'uppercase',
// //             fontFamily: "'Plus Jakarta Sans', sans-serif",
// //             color: T.muted,
// //             padding: '0 2px',
// //             marginTop: 2,
// //           }}
// //         >
// //           Overview
// //         </p>

// //         <StatCard
// //           label="Completed"
// //           value={statistics.tasksByStatus?.done || 0}
// //           color={T.green}
// //           iconBg="rgba(16,185,129,0.13)"
// //           Icon={CheckCircle2}
// //         />
// //         <StatCard
// //           label="In Progress"
// //           value={statistics.tasksByStatus?.in_progress || 0}
// //           color={T.indigo2}
// //           iconBg="rgba(99,102,241,0.13)"
// //           Icon={Clock}
// //         />
// //         <StatCard
// //           label="Overdue"
// //           value={statistics.overdueTasks || 0}
// //           color={T.red}
// //           iconBg="rgba(239,68,68,0.13)"
// //           Icon={AlertTriangle}
// //         />

// //         <div
// //           style={{
// //             background: T.surface2,
// //             border: `1px solid ${T.border}`,
// //             borderRadius: 13,
// //             padding: '13px 14px',
// //           }}
// //         >
// //           <div
// //             style={{
// //               display: 'flex',
// //               justifyContent: 'space-between',
// //               alignItems: 'baseline',
// //               marginBottom: 10,
// //             }}
// //           >
// //             <span
// //               style={{
// //                 fontSize: 12,
// //                 color: T.dim,
// //                 letterSpacing: '-0.01em',
// //                 fontFamily: "'Inter', sans-serif",
// //               }}
// //             >
// //               Completion Rate
// //             </span>
// //             <span
// //               style={{
// //                 fontWeight: 800,
// //                 fontSize: 19,
// //                 letterSpacing: '-0.02em',
// //                 fontFeatureSettings: "'tnum' 1",
// //                 fontFamily: "'Plus Jakarta Sans', sans-serif",
// //               }}
// //             >
// //               {completionRate}%
// //             </span>
// //           </div>

// //           <div
// //             style={{
// //               height: 5,
// //               background: T.surface3,
// //               borderRadius: 10,
// //               overflow: 'hidden',
// //             }}
// //           >
// //             <div
// //               style={{
// //                 height: '100%',
// //                 borderRadius: 10,
// //                 width: `${completionRate}%`,
// //                 background: `linear-gradient(90deg, ${T.green} 0%, ${T.green2} 100%)`,
// //                 boxShadow: `0 0 10px rgba(16,185,129,0.45)`,
// //                 transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
// //               }}
// //             />
// //           </div>
// //         </div>

// //         <p
// //           style={{
// //             fontWeight: 700,
// //             fontSize: 10,
// //             letterSpacing: '0.13em',
// //             textTransform: 'uppercase',
// //             fontFamily: "'Plus Jakarta Sans', sans-serif",
// //             color: T.muted,
// //             padding: '0 2px',
// //             marginTop: 2,
// //           }}
// //         >
// //           Task Status
// //         </p>

// //         <div
// //           style={{
// //             background: T.surface2,
// //             border: `1px solid ${T.border}`,
// //             borderRadius: 13,
// //             padding: '14px',
// //             display: 'flex',
// //             flexDirection: 'column',
// //             alignItems: 'center',
// //             gap: 14,
// //           }}
// //         >
// //           {donutData.length > 0 ? (
// //             <>
// //               <div style={{ position: 'relative', width: 130, height: 130 }}>
// //                 <ResponsiveContainer width="100%" height="100%">
// //                   <PieChart>
// //                     <Pie
// //                       data={donutData}
// //                       dataKey="value"
// //                       outerRadius={60}
// //                       innerRadius={40}
// //                       paddingAngle={3}
// //                       strokeWidth={0}
// //                     >
// //                       {donutData.map((entry, i) => (
// //                         <Cell key={i} fill={entry.color} stroke="transparent" />
// //                       ))}
// //                     </Pie>
// //                     <Tooltip content={<DonutTooltip />} />
// //                   </PieChart>
// //                 </ResponsiveContainer>

// //                 <div
// //                   style={{
// //                     position: 'absolute',
// //                     inset: 0,
// //                     display: 'flex',
// //                     flexDirection: 'column',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     pointerEvents: 'none',
// //                   }}
// //                 >
// //                   <span
// //                     style={{
// //                       fontWeight: 800,
// //                       fontSize: 26,
// //                       fontFeatureSettings: "'tnum' 1",
// //                       fontFamily: "'Plus Jakarta Sans', sans-serif",
// //                       letterSpacing: '-0.035em',
// //                       color: T.text,
// //                       lineHeight: 1,
// //                     }}
// //                   >
// //                     {totalTasks}
// //                   </span>
// //                   <span
// //                     style={{
// //                       fontSize: 8.5,
// //                       color: T.muted,
// //                       textTransform: 'uppercase',
// //                       letterSpacing: '0.06em',
// //                       marginTop: 3,
// //                     }}
// //                   >
// //                     Total
// //                   </span>
// //                 </div>
// //               </div>

// //               <div
// //                 style={{
// //                   width: '100%',
// //                   display: 'flex',
// //                   flexDirection: 'column',
// //                   gap: 7,
// //                 }}
// //               >
// //                 {donutData.map((d, i) => (
// //                   <div
// //                     key={i}
// //                     style={{
// //                       display: 'flex',
// //                       alignItems: 'center',
// //                       justifyContent: 'space-between',
// //                       fontSize: 12,
// //                     }}
// //                   >
// //                     <div
// //                       style={{
// //                         display: 'flex',
// //                         alignItems: 'center',
// //                         gap: 7,
// //                         color: T.dim,
// //                       }}
// //                     >
// //                       <div
// //                         style={{
// //                           width: 8,
// //                           height: 8,
// //                           borderRadius: '50%',
// //                           background: d.color,
// //                           boxShadow: `0 0 6px ${d.color}aa`,
// //                           flexShrink: 0,
// //                         }}
// //                       />
// //                       {d.name}
// //                     </div>
// //                     <span style={{ fontWeight: 600, color: T.text }}>{d.value}</span>
// //                   </div>
// //                 ))}
// //               </div>
// //             </>
// //           ) : (
// //             <p
// //               style={{
// //                 fontSize: 12.5,
// //                 color: T.muted,
// //                 textAlign: 'center',
// //                 padding: '20px 0',
// //               }}
// //             >
// //               No tasks yet
// //             </p>
// //           )}
// //         </div>
// //       </aside>

// //       <Suspense fallback={<LoadingSpinner fullScreen text="Loading…" />}>
// //         {showCreateModal && (
// //           <CreateTaskModal
// //             initialStatus={createModalStatus}
// //             onClose={() => setShowCreateModal(false)}
// //           />
// //         )}

// //         {selectedTask && (
// //           <TaskDetailModal
// //             task={selectedTask}
// //             onClose={() => dispatch(setSelectedTask(null))}
// //             onAddComment={handleAddComment}
// //             workspaceMembers={workspaceMembers}
// //           />
// //         )}
// //       </Suspense>
// //     </div>
// //   );
// // }
// import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
// import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   DndContext, DragOverlay, closestCorners,
//   PointerSensor, KeyboardSensor, TouchSensor,
//   useSensor, useSensors,
// } from '@dnd-kit/core';
// import {
//   fetchTasks, optimisticMoveTask, moveTask,
//   rollbackMoveTask, setSelectedTask, deleteTask, addComment,
// } from '../redux/slices/taskSlice';
// import { calculateStatistics } from '../redux/slices/statisticsSlice';
// import KanbanColumn from './KanbanColumn';
// import TaskCard from './TaskCard';
// import SkeletonCard from './SkeletonCard';
// import LoadingSpinner from './LoadingSpinner';
// import toast from 'react-hot-toast';
// import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
// import { useThemeColors } from '../hooks/useTheme';

// const CreateTaskModal = lazy(() => import('./CreateTaskModal'));
// const TaskDetailModal = lazy(() => import('./TaskDetailModal'));

// /* ─── Custom donut tooltip ─── */
// const DonutTooltip = ({ active, payload }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{
//       background: 'var(--surface-overlay)',
//       border: '1px solid var(--border-default)',
//       borderRadius: 9, padding: '5px 11px',
//       fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)',
//       boxShadow: 'var(--shadow-lg)',
//     }}>
//       {payload[0].name}:{' '}
//       <span style={{ color: payload[0].payload.color }}>{payload[0].value}</span>
//     </div>
//   );
// };

// /* ─── Stat card ─── */
// function StatCard({ label, value, color, iconBg, Icon: IconComp }) {
//   const T = useThemeColors();
//   const [hov, setHov] = useState(false);
//   return (
//     <div
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{
//         background: T.s2,
//         border: `1px solid ${hov ? T.border2 : T.border}`,
//         borderRadius: 13, padding: '13px 15px',
//         display: 'flex', alignItems: 'center', gap: 12,
//         transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
//         transform: hov ? 'translateY(-1px)' : 'none',
//         boxShadow: hov ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
//         cursor: 'default',
//       }}
//     >
//       <div style={{
//         width: 34, height: 34, borderRadius: 9, flexShrink: 0,
//         background: iconBg, display: 'grid', placeItems: 'center',
//         transition: 'box-shadow 0.15s',
//         boxShadow: hov ? `0 0 14px ${iconBg}` : 'none',
//       }}>
//         <IconComp size={15} color={color} />
//       </div>
//       <div>
//         <div style={{ fontSize: 11, color: T.muted, marginBottom: 4, lineHeight: 1 }}>
//           {label}
//         </div>
//         <div style={{
//           fontWeight: 800, fontSize: 30, lineHeight: 1,
//           fontFamily: "'Plus Jakarta Sans', sans-serif",
//           letterSpacing: '-0.03em', color,
//         }}>
//           {value}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ════════════════════════════════════════
//    KANBAN BOARD
// ════════════════════════════════════════ */
// export default function KanbanBoard({
//   searchQuery = '',
//   filters = { priorities: [], statuses: [], assignee: '' },
// }) {
//   const T = useThemeColors();
//   const dispatch = useDispatch();
//   const { currentWorkspace } = useSelector(s => s.workspace);
//   const workspaceId = currentWorkspace?._id;
//   const { socket, isConnected } = useWorkspaceSocket(workspaceId);
//   const { tasks, selectedTask, isLoading } = useSelector(s => s.tasks);
//   const statistics = useSelector(s => s.statistics);

//   const [activeTask, setActiveTask] = useState(null);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [createModalStatus, setCreateModalStatus] = useState('todo');

//   const workspaceMembers = useMemo(
//     () => currentWorkspace?.members?.map(m => ({
//       _id: m.user?._id || m._id,
//       name: m.user?.name || m.name,
//     })) || [],
//     [currentWorkspace?.members]
//   );

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
//     useSensor(KeyboardSensor),
//     useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
//   );

//   useEffect(() => {
//     if (currentWorkspace?._id) dispatch(fetchTasks(currentWorkspace._id));
//   }, [currentWorkspace, dispatch]);

//   useEffect(() => {
//     dispatch(calculateStatistics(tasks));
//   }, [tasks, dispatch]);

//   const filteredTasks = useMemo(() => {
//     const f = list => list.filter(task => {
//       if (searchQuery) {
//         const q = searchQuery.toLowerCase();
//         if (
//           !task.title.toLowerCase().includes(q) &&
//           !task.description?.toLowerCase().includes(q) &&
//           !task.tags?.some(t => t.toLowerCase().includes(q))
//         ) return false;
//       }
//       if (filters.priorities.length && !filters.priorities.includes(task.priority)) return false;
//       if (filters.statuses.length && !filters.statuses.includes(task.status)) return false;
//       if (filters.assignee) {
//         if (filters.assignee === 'unassigned' && task.assignee) return false;
//         if (filters.assignee !== 'unassigned' && task.assignee?._id !== filters.assignee) return false;
//       }
//       return true;
//     });
//     return {
//       todo: f(tasks.todo || []),
//       in_progress: f(tasks.in_progress || []),
//       done: f(tasks.done || []),
//     };
//   }, [tasks, searchQuery, filters]);

//   const handleDragStart = useCallback(({ active }) => {
//     let found = null;
//     Object.keys(tasks).forEach(status => {
//       const task = tasks[status]?.find(t => t._id === active.id);
//       if (task) found = task;
//     });
//     setActiveTask(found);
//   }, [tasks]);

//   const handleDragEnd = useCallback(({ active, over }) => {
//     setActiveTask(null);
//     if (!over) return;
//     const taskId = active.id;
//     let srcStatus, srcIdx;
//     Object.keys(tasks).forEach(status => {
//       const index = tasks[status]?.findIndex(t => t._id === taskId);
//       if (index !== -1) { srcStatus = status; srcIdx = index; }
//     });
//     let dstStatus, dstIdx;
//     if (['todo', 'in_progress', 'done'].includes(over.id)) {
//       dstStatus = over.id;
//       dstIdx = tasks[over.id]?.length || 0;
//     } else {
//       Object.keys(tasks).forEach(status => {
//         const index = tasks[status]?.findIndex(t => t._id === over.id);
//         if (index !== -1) { dstStatus = status; dstIdx = index; }
//       });
//     }
//     if (!dstStatus || (srcStatus === dstStatus && srcIdx === dstIdx)) return;
//     dispatch(optimisticMoveTask({ taskId, sourceStatus: srcStatus, destinationStatus: dstStatus, sourceIndex: srcIdx, destinationIndex: dstIdx }));
//     toast.loading('Moving…', { id: taskId });
//     dispatch(moveTask({ taskId, newStatus: dstStatus, newOrder: dstIdx })).then(res => {
//       if (res.type.includes('fulfilled')) {
//         toast.success('Moved!', { id: taskId });
//         if (socket && isConnected) socket.emit('task:move', { workspaceId, taskId, newStatus: dstStatus, oldStatus: srcStatus, newOrder: dstIdx });
//       } else {
//         toast.error('Move failed', { id: taskId });
//         dispatch(rollbackMoveTask({ taskId, sourceStatus: srcStatus, destinationStatus: dstStatus, sourceIndex: srcIdx }));
//       }
//     });
//   }, [tasks, dispatch, socket, isConnected, workspaceId]);

//   const handleTaskClick  = useCallback(task => dispatch(setSelectedTask(task)), [dispatch]);
//   const handleAddTask    = useCallback(status => { setCreateModalStatus(status); setShowCreateModal(true); }, []);
//   const handleDeleteTask = useCallback(async taskId => {
//     const id = toast.loading('Deleting…');
//     const result = await dispatch(deleteTask(taskId));
//     if (result.type === 'tasks/delete/fulfilled') {
//       if (socket && isConnected) socket.emit('task:delete', { workspaceId, taskId });
//       toast.success('Task deleted', { id });
//     } else toast.error('Delete failed', { id });
//   }, [dispatch, socket, isConnected, workspaceId]);

//   const handleAddComment = useCallback(async (taskId, commentText, mentions = []) => {
//     const id = toast.loading('Adding comment…');
//     const result = await dispatch(addComment({ taskId, text: commentText, mentions }));
//     if (result.type === 'tasks/addComment/fulfilled') {
//       toast.success('Comment added', { id });
//       if (socket && isConnected) socket.emit('comment:add', { workspaceId, taskId, comment: result.payload.comment });
//     } else toast.error('Failed to add comment', { id });
//   }, [dispatch, socket, isConnected, workspaceId]);

//   const completionRate = statistics.completionRate || 0;
//   const donutData = useMemo(() => [
//     { name: 'Done',        value: statistics.tasksByStatus?.done || 0,        color: T.green   },
//     { name: 'In Progress', value: statistics.tasksByStatus?.in_progress || 0, color: T.indigo2 },
//     { name: 'Overdue',     value: statistics.overdueTasks || 0,               color: T.red     },
//   ].filter(d => d.value > 0), [statistics, T]);
//   const totalTasks = statistics.totalTasks || 0;

//   return (
//     <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
//       {/* ── Kanban columns ── */}
//       <div style={{
//         flex: 1, display: 'flex', gap: 14,
//         padding: '18px 16px', overflowX: 'auto', overflowY: 'auto', alignItems: 'flex-start',
//       }}>
//         <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
//           <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: '100%' }}>
//             {isLoading ? (
//               ['todo', 'in_progress', 'done'].map(col => (
//                 <div key={col} style={{
//                   flex: '1 1 0', minWidth: 240,
//                   background: T.s2, border: `1px solid ${T.border2}`,
//                   borderRadius: 14, padding: '15px 10px',
//                   display: 'flex', flexDirection: 'column', gap: 10,
//                 }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 6px' }}>
//                     <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.s3 }} />
//                     <div style={{ height: 10, width: 70, borderRadius: 4, background: T.s3 }} />
//                     <div style={{ height: 18, width: 24, borderRadius: 10, background: T.s3 }} />
//                   </div>
//                   {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
//                 </div>
//               ))
//             ) : (
//               <>
//                 <KanbanColumn status="todo"        title="To Do"       tasks={filteredTasks.todo}        onTaskClick={handleTaskClick} onAddTask={() => handleAddTask('todo')}        onDeleteTask={handleDeleteTask} workspaceId={workspaceId} />
//                 <KanbanColumn status="in_progress" title="In Progress" tasks={filteredTasks.in_progress} onTaskClick={handleTaskClick} onAddTask={() => handleAddTask('in_progress')} onDeleteTask={handleDeleteTask} workspaceId={workspaceId} />
//                 <KanbanColumn status="done"        title="Done"        tasks={filteredTasks.done}        onTaskClick={handleTaskClick} onAddTask={() => handleAddTask('done')}        onDeleteTask={handleDeleteTask} workspaceId={workspaceId} />
//               </>
//             )}
//           </div>

//           <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
//             {activeTask && (
//               <div style={{
//                 transform: 'rotate(1.5deg) scale(1.04)', opacity: 0.96,
//                 boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(99,102,241,0.4)',
//                 borderRadius: 13, pointerEvents: 'none',
//               }}>
//                 <TaskCard task={activeTask} />
//               </div>
//             )}
//           </DragOverlay>
//         </DndContext>
//       </div>

//       {/* ── Right panel ── */}
//       <aside style={{
//         width: 280, minWidth: 280,
//         borderLeft: `1px solid ${T.border}`,
//         background: T.surface,
//         display: 'flex', flexDirection: 'column',
//         padding: '18px 16px 20px', gap: 12,
//         overflowY: 'auto', flexShrink: 0,
//       }}>
//         <p style={{
//           fontWeight: 700, fontSize: 10, letterSpacing: '0.13em',
//           textTransform: 'uppercase', color: T.muted, padding: '0 2px', marginTop: 2,
//         }}>
//           Overview
//         </p>

//         <StatCard label="Completed"  value={statistics.tasksByStatus?.done || 0}        color={T.green}   iconBg="rgba(16,185,129,0.13)"  Icon={CheckCircle2} />
//         <StatCard label="In Progress" value={statistics.tasksByStatus?.in_progress || 0} color={T.indigo2} iconBg="rgba(99,102,241,0.13)"  Icon={Clock} />
//         <StatCard label="Overdue"    value={statistics.overdueTasks || 0}               color={T.red}     iconBg="rgba(239,68,68,0.13)"   Icon={AlertTriangle} />

//         <div style={{
//           background: T.s2, border: `1px solid ${T.border}`,
//           borderRadius: 13, padding: '13px 14px',
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
//             <span style={{ fontSize: 12, color: T.dim }}>Completion Rate</span>
//             <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', color: T.text }}>
//               {completionRate}%
//             </span>
//           </div>
//           <div style={{ height: 5, background: T.s3, borderRadius: 10, overflow: 'hidden' }}>
//             <div style={{
//               height: '100%', borderRadius: 10, width: `${completionRate}%`,
//               background: `linear-gradient(90deg, ${T.green} 0%, ${T.green2} 100%)`,
//               boxShadow: `0 0 10px rgba(16,185,129,0.35)`,
//               transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
//             }} />
//           </div>
//         </div>

//         <p style={{
//           fontWeight: 700, fontSize: 10, letterSpacing: '0.13em',
//           textTransform: 'uppercase', color: T.muted, padding: '0 2px', marginTop: 2,
//         }}>
//           Task Status
//         </p>

//         <div style={{
//           background: T.s2, border: `1px solid ${T.border}`,
//           borderRadius: 13, padding: 14,
//           display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
//         }}>
//           {donutData.length > 0 ? (
//             <>
//               <div style={{ position: 'relative', width: 130, height: 130 }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={donutData} dataKey="value" outerRadius={60} innerRadius={40} paddingAngle={3} strokeWidth={0}>
//                       {donutData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
//                     </Pie>
//                     <Tooltip content={<DonutTooltip />} />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <div style={{
//                   position: 'absolute', inset: 0, display: 'flex',
//                   flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
//                 }}>
//                   <span style={{ fontWeight: 800, fontSize: 26, color: T.text, lineHeight: 1, letterSpacing: '-0.035em' }}>
//                     {totalTasks}
//                   </span>
//                   <span style={{ fontSize: 8.5, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>
//                     Total
//                   </span>
//                 </div>
//               </div>

//               <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
//                 {donutData.map((d, i) => (
//                   <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: T.dim }}>
//                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}aa`, flexShrink: 0 }} />
//                       {d.name}
//                     </div>
//                     <span style={{ fontWeight: 600, color: T.text }}>{d.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <p style={{ fontSize: 12.5, color: T.muted, textAlign: 'center', padding: '20px 0' }}>No tasks yet</p>
//           )}
//         </div>
//       </aside>

//       <Suspense fallback={<LoadingSpinner fullScreen text="Loading…" />}>
//         {showCreateModal && <CreateTaskModal initialStatus={createModalStatus} onClose={() => setShowCreateModal(false)} />}
//         {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => dispatch(setSelectedTask(null))} onAddComment={handleAddComment} workspaceMembers={workspaceMembers} />}
//       </Suspense>
//     </div>
//   );
// }
import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, KeyboardSensor, TouchSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  fetchTasks, optimisticMoveTask, moveTask,
  rollbackMoveTask, setSelectedTask, deleteTask, addComment,
} from '../redux/slices/taskSlice';
import { calculateStatistics } from '../redux/slices/statisticsSlice';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import SkeletonCard from './SkeletonCard';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useThemeColors } from '../hooks/useTheme';

const CreateTaskModal = lazy(() => import('./CreateTaskModal'));
const TaskDetailModal = lazy(() => import('./TaskDetailModal'));

/* ─── Custom donut tooltip ─── */
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-overlay)',
      border: '1px solid var(--border-default)',
      borderRadius: 9, padding: '5px 11px',
      fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {payload[0].name}:{' '}
      <span style={{ color: payload[0].payload.color }}>{payload[0].value}</span>
    </div>
  );
};

/* ─── Stat card ─── */
function StatCard({ label, value, color, iconBg, Icon: IconComp }) {
  const T = useThemeColors();
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.s2,
        border: `1px solid ${hov ? T.border2 : T.border}`,
        borderRadius: 13, padding: '13px 15px',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: iconBg, display: 'grid', placeItems: 'center',
        transition: 'box-shadow 0.15s',
        boxShadow: hov ? `0 0 14px ${iconBg}` : 'none',
      }}>
        <IconComp size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 4, lineHeight: 1 }}>
          {label}
        </div>
        <div style={{
          fontWeight: 800, fontSize: 30, lineHeight: 1,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.03em', color,
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   KANBAN BOARD
════════════════════════════════════════ */
export default function KanbanBoard({
  searchQuery = '',
  filters = { priorities: [], statuses: [], assignee: '' },
}) {
  const T = useThemeColors();
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const { currentWorkspace } = useSelector(s => s.workspace);
  const workspaceId = currentWorkspace?._id;
  const { socket, isConnected } = useWorkspaceSocket(workspaceId);
  const { tasks, selectedTask, isLoading } = useSelector(s => s.tasks);
  const statistics = useSelector(s => s.statistics);

  const [activeTask, setActiveTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState('todo');

  const workspaceMembers = useMemo(
    () => currentWorkspace?.members?.map(m => ({
      _id: m.user?._id || m._id,
      name: m.user?.name || m.name,
    })) || [],
    [currentWorkspace?.members]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    if (currentWorkspace?._id) dispatch(fetchTasks(currentWorkspace._id));
  }, [currentWorkspace, dispatch]);

  useEffect(() => {
    dispatch(calculateStatistics(tasks));
  }, [tasks, dispatch]);

  const filteredTasks = useMemo(() => {
    const f = list => list.filter(task => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !task.title.toLowerCase().includes(q) &&
          !task.description?.toLowerCase().includes(q) &&
          !task.tags?.some(t => t.toLowerCase().includes(q))
        ) return false;
      }
      if (filters.priorities.length && !filters.priorities.includes(task.priority)) return false;
      if (filters.statuses.length && !filters.statuses.includes(task.status)) return false;
      if (filters.assignee) {
        if (filters.assignee === 'unassigned' && task.assignee) return false;
        if (filters.assignee !== 'unassigned' && task.assignee?._id !== filters.assignee) return false;
      }
      return true;
    });
    return {
      todo: f(tasks.todo || []),
      in_progress: f(tasks.in_progress || []),
      done: f(tasks.done || []),
    };
  }, [tasks, searchQuery, filters]);

  const handleDragStart = useCallback(({ active }) => {
    let found = null;
    Object.keys(tasks).forEach(status => {
      const task = tasks[status]?.find(t => t._id === active.id);
      if (task) found = task;
    });
    setActiveTask(found);
  }, [tasks]);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null);
    if (!over) return;
    const taskId = active.id;
    let srcStatus, srcIdx;
    Object.keys(tasks).forEach(status => {
      const index = tasks[status]?.findIndex(t => t._id === taskId);
      if (index !== -1) { srcStatus = status; srcIdx = index; }
    });
    let dstStatus, dstIdx;
    if (['todo', 'in_progress', 'done'].includes(over.id)) {
      dstStatus = over.id;
      dstIdx = tasks[over.id]?.length || 0;
    } else {
      Object.keys(tasks).forEach(status => {
        const index = tasks[status]?.findIndex(t => t._id === over.id);
        if (index !== -1) { dstStatus = status; dstIdx = index; }
      });
    }
    if (!dstStatus || (srcStatus === dstStatus && srcIdx === dstIdx)) return;
    dispatch(optimisticMoveTask({ taskId, sourceStatus: srcStatus, destinationStatus: dstStatus, sourceIndex: srcIdx, destinationIndex: dstIdx }));
    toast.loading('Moving…', { id: taskId });
    dispatch(moveTask({ taskId, newStatus: dstStatus, newOrder: dstIdx })).then(res => {
      if (res.type.includes('fulfilled')) {
        toast.success('Moved!', { id: taskId });
        if (socket && isConnected) socket.emit('task:move', { workspaceId, taskId, newStatus: dstStatus, oldStatus: srcStatus, newOrder: dstIdx });
      } else {
        toast.error('Move failed', { id: taskId });
        dispatch(rollbackMoveTask({ taskId, sourceStatus: srcStatus, destinationStatus: dstStatus, sourceIndex: srcIdx }));
      }
    });
  }, [tasks, dispatch, socket, isConnected, workspaceId]);

  const handleTaskClick  = useCallback(task => dispatch(setSelectedTask(task)), [dispatch]);
  const handleAddTask    = useCallback(status => { setCreateModalStatus(status); setShowCreateModal(true); }, []);
  const handleDeleteTask = useCallback(async taskId => {
    const id = toast.loading('Deleting…');
    const result = await dispatch(deleteTask(taskId));
    if (result.type === 'tasks/delete/fulfilled') {
      if (socket && isConnected) socket.emit('task:delete', { workspaceId, taskId });
      toast.success('Task deleted', { id });
    } else toast.error('Delete failed', { id });
  }, [dispatch, socket, isConnected, workspaceId]);

  const handleAddComment = useCallback(async (taskId, commentText, mentions = []) => {
    const id = toast.loading('Adding comment…');
    const result = await dispatch(addComment({ taskId, text: commentText, mentions }));
    if (result.type === 'tasks/addComment/fulfilled') {
      toast.success('Comment added', { id });
      if (socket && isConnected) socket.emit('comment:add', { workspaceId, taskId, comment: result.payload.comment });
    } else toast.error('Failed to add comment', { id });
  }, [dispatch, socket, isConnected, workspaceId]);

  const completionRate = statistics.completionRate || 0;
  const donutData = useMemo(() => [
    { name: 'Done',        value: statistics.tasksByStatus?.done || 0,        color: T.green   },
    { name: 'In Progress', value: statistics.tasksByStatus?.in_progress || 0, color: T.indigo2 },
    { name: 'Overdue',     value: statistics.overdueTasks || 0,               color: T.red     },
  ].filter(d => d.value > 0), [statistics, T]);
  const totalTasks = statistics.totalTasks || 0;

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* ── Kanban columns ── */}
      <div style={{
        flex: 1, display: 'flex', gap: 14,
        padding: '18px 16px', overflowX: 'auto', overflowY: 'auto', alignItems: 'flex-start',
      }}>
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: '100%' }}>
            {isLoading ? (
              ['todo', 'in_progress', 'done'].map(col => (
                <div key={col} style={{
                  flex: '1 1 0', minWidth: 240,
                  background: T.s2, border: `1px solid ${T.border2}`,
                  borderRadius: 14, padding: '15px 10px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.s3 }} />
                    <div style={{ height: 10, width: 70, borderRadius: 4, background: T.s3 }} />
                    <div style={{ height: 18, width: 24, borderRadius: 10, background: T.s3 }} />
                  </div>
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ))
            ) : (
              <>
                <KanbanColumn status="todo"        title="To Do"       tasks={filteredTasks.todo}        onTaskClick={handleTaskClick} onAddTask={() => handleAddTask('todo')}        onDeleteTask={handleDeleteTask} workspaceId={workspaceId} />
                <KanbanColumn status="in_progress" title="In Progress" tasks={filteredTasks.in_progress} onTaskClick={handleTaskClick} onAddTask={() => handleAddTask('in_progress')} onDeleteTask={handleDeleteTask} workspaceId={workspaceId} />
                <KanbanColumn status="done"        title="Done"        tasks={filteredTasks.done}        onTaskClick={handleTaskClick} onAddTask={() => handleAddTask('done')}        onDeleteTask={handleDeleteTask} workspaceId={workspaceId} />
              </>
            )}
          </div>

          <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
            {activeTask && (
              <div style={{
                transform: 'rotate(1.5deg) scale(1.04)', opacity: 0.96,
                boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(99,102,241,0.4)',
                borderRadius: 13, pointerEvents: 'none',
              }}>
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Right panel — hidden on mobile ── */}
      <aside style={{
        width: isMobile ? 0 : 280, minWidth: isMobile ? 0 : 280,
        borderLeft: isMobile ? 'none' : `1px solid ${T.border}`,
        background: T.surface,
        display: isMobile ? 'none' : 'flex', flexDirection: 'column',
        padding: '18px 16px 20px', gap: 12,
        overflowY: 'auto', flexShrink: 0,
      }}>
        <p style={{
          fontWeight: 700, fontSize: 10, letterSpacing: '0.13em',
          textTransform: 'uppercase', color: T.muted, padding: '0 2px', marginTop: 2,
        }}>
          Overview
        </p>

        <StatCard label="Completed"  value={statistics.tasksByStatus?.done || 0}        color={T.green}   iconBg="rgba(16,185,129,0.13)"  Icon={CheckCircle2} />
        <StatCard label="In Progress" value={statistics.tasksByStatus?.in_progress || 0} color={T.indigo2} iconBg="rgba(99,102,241,0.13)"  Icon={Clock} />
        <StatCard label="Overdue"    value={statistics.overdueTasks || 0}               color={T.red}     iconBg="rgba(239,68,68,0.13)"   Icon={AlertTriangle} />

        <div style={{
          background: T.s2, border: `1px solid ${T.border}`,
          borderRadius: 13, padding: '13px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: T.dim }}>Completion Rate</span>
            <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', color: T.text }}>
              {completionRate}%
            </span>
          </div>
          <div style={{ height: 5, background: T.s3, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 10, width: `${completionRate}%`,
              background: `linear-gradient(90deg, ${T.green} 0%, ${T.green2} 100%)`,
              boxShadow: `0 0 10px rgba(16,185,129,0.35)`,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>

        <p style={{
          fontWeight: 700, fontSize: 10, letterSpacing: '0.13em',
          textTransform: 'uppercase', color: T.muted, padding: '0 2px', marginTop: 2,
        }}>
          Task Status
        </p>

        <div style={{
          background: T.s2, border: `1px solid ${T.border}`,
          borderRadius: 13, padding: 14,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          {donutData.length > 0 ? (
            <>
              <div style={{ position: 'relative', width: 130, height: 130, minWidth: 0 }}>
                <ResponsiveContainer width={130} height={130}>
                  <PieChart>
                    <Pie data={donutData} dataKey="value" outerRadius={60} innerRadius={40} paddingAngle={3} strokeWidth={0}>
                      {donutData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                }}>
                  <span style={{ fontWeight: 800, fontSize: 26, color: T.text, lineHeight: 1, letterSpacing: '-0.035em' }}>
                    {totalTasks}
                  </span>
                  <span style={{ fontSize: 8.5, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>
                    Total
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {donutData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: T.dim }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, boxShadow: `0 0 6px ${d.color}aa`, flexShrink: 0 }} />
                      {d.name}
                    </div>
                    <span style={{ fontWeight: 600, color: T.text }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 12.5, color: T.muted, textAlign: 'center', padding: '20px 0' }}>No tasks yet</p>
          )}
        </div>
      </aside>

      <Suspense fallback={<LoadingSpinner fullScreen text="Loading…" />}>
        {showCreateModal && <CreateTaskModal initialStatus={createModalStatus} onClose={() => setShowCreateModal(false)} />}
        {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => dispatch(setSelectedTask(null))} onAddComment={handleAddComment} workspaceMembers={workspaceMembers} />}
      </Suspense>
    </div>
  );
}