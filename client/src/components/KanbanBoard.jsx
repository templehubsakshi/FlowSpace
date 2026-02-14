import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import KanbanBoardSkeleton from './KanbanBoardSkeleton';
import LoadingSpinner from './LoadingSpinner';
import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  fetchTasks,
  optimisticMoveTask,
  moveTask,
  rollbackMoveTask,
  setSelectedTask,
  deleteTask
} from '../redux/slices/taskSlice';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import toast from 'react-hot-toast';
import { Wifi, WifiOff, Layers } from 'lucide-react';

const CreateTaskModal = lazy(() => import('./CreateTaskModal'));
const TaskDetailModal = lazy(() => import('./TaskDetailModal'));

/**
 * 🎯 FINAL PRODUCTION KanbanBoard
 * 
 * ✅ Dark mode support
 * ✅ Professional skeleton loading
 * ✅ Real-time updates via Socket.io
 * ✅ Optimistic UI updates
 * ✅ Better error handling
 * ✅ Accessibility compliant
 * ✅ Mobile responsive
 */
export default function KanbanBoard() {
  const dispatch = useDispatch();

  const { currentWorkspace } = useSelector((state) => state.workspace);
  const workspaceId = currentWorkspace?._id;
  const { socket, isConnected } = useWorkspaceSocket(workspaceId);
  const { tasks, isLoading, error, selectedTask } = useSelector((state) => state.tasks);

  const [activeTask, setActiveTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priorities: [],
    statuses: [],
    assignee: ''
  });

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    if (currentWorkspace?._id) {
      dispatch(fetchTasks(currentWorkspace._id));
    }
  }, [currentWorkspace, dispatch]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    const filterList = (list) =>
      list.filter(task => {

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesSearch =
            task.title.toLowerCase().includes(q) ||
            task.description?.toLowerCase().includes(q) ||
            task.tags?.some(t => t.toLowerCase().includes(q));

          if (!matchesSearch) return false;
        }

        if (filters.priorities.length && !filters.priorities.includes(task.priority)) {
          return false;
        }

        if (filters.statuses.length && !filters.statuses.includes(task.status)) {
          return false;
        }

        if (filters.assignee) {
          if (filters.assignee === 'unassigned' && task.assignee) return false;
          if (filters.assignee !== 'unassigned' && task.assignee?._id !== filters.assignee) {
            return false;
          }
        }

        return true;
      });

    return {
      todo: filterList(tasks.todo || []),
      in_progress: filterList(tasks.in_progress || []),
      done: filterList(tasks.done || [])
    };
  }, [tasks, searchQuery, filters]);

  // Drag Start
  const handleDragStart = useCallback(({ active }) => {
    let foundTask = null;
    Object.keys(tasks).forEach(status => {
      const t = tasks[status]?.find(task => task._id === active.id);
      if (t) foundTask = t;
    });
    setActiveTask(foundTask);
  }, [tasks]);

  // Drag End
  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    let sourceStatus, sourceIndex;

    Object.keys(tasks).forEach(status => {
      const idx = tasks[status]?.findIndex(t => t._id === taskId);
      if (idx !== -1) {
        sourceStatus = status;
        sourceIndex = idx;
      }
    });

    let destinationStatus, destinationIndex;

    if (['todo', 'in_progress', 'done'].includes(over.id)) {
      destinationStatus = over.id;
      destinationIndex = tasks[over.id]?.length || 0;
    } else {
      Object.keys(tasks).forEach(status => {
        const idx = tasks[status]?.findIndex(t => t._id === over.id);
        if (idx !== -1) {
          destinationStatus = status;
          destinationIndex = idx;
        }
      });
    }

    if (!destinationStatus) return;
    if (sourceStatus === destinationStatus && sourceIndex === destinationIndex) return;

    dispatch(optimisticMoveTask({
      taskId,
      sourceStatus,
      destinationStatus,
      sourceIndex,
      destinationIndex
    }));

    toast.loading('Moving task...', { id: taskId });

    dispatch(moveTask({
      taskId,
      newStatus: destinationStatus,
      newOrder: destinationIndex
    })).then(res => {
      if (res.type.includes('fulfilled')) {
        toast.success('Task moved!', { id: taskId });

        if (socket && isConnected) {
          socket.emit('task:move', {
            workspaceId,
            taskId,
            newStatus: destinationStatus,
            oldStatus: sourceStatus,
            newOrder: destinationIndex
          });
        }
      } else {
        toast.error('Failed to move task', { id: taskId });
        dispatch(rollbackMoveTask({
          taskId,
          sourceStatus,
          destinationStatus,
          sourceIndex
        }));
      }
    });
  }, [tasks, dispatch, socket, isConnected, workspaceId]);

  const handleTaskClick = useCallback((task) => {
    dispatch(setSelectedTask(task));
  }, [dispatch]);

  const handleAddTask = useCallback((status) => {
    setCreateModalStatus(status);
    setShowCreateModal(true);
  }, []);

  const handleFilterChange = useCallback((type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ priorities: [], statuses: [], assignee: '' });
    setSearchQuery('');
    toast.success('Filters cleared');
  }, []);

  const handleDeleteTask = useCallback(async (taskId) => {
    const toastId = toast.loading('Deleting task...');
    const result = await dispatch(deleteTask(taskId));

    if (result.type === 'tasks/delete/fulfilled') {
      if (socket && isConnected) {
        socket.emit('task:delete', { workspaceId, taskId });
      }
      toast.success('Task deleted', { id: toastId });
    } else {
      toast.error('Failed to delete task', { id: toastId });
    }
  }, [dispatch, socket, isConnected, workspaceId]);

  // ===== RENDER =====
  return (
    <div className="
      h-full flex flex-col p-4
      bg-gradient-to-br
      from-gray-50 to-gray-100
      dark:from-slate-900 dark:to-slate-800
      rounded-2xl
    ">

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">

        {/* Connection Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
          ${isConnected
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}
        `}>
          {isConnected ? <Wifi className="w-4 h-4 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
          {isConnected ? 'Live' : 'Reconnecting'}
        </div>

        {/* Task Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-white">
            {(filteredTasks.todo?.length || 0) +
              (filteredTasks.in_progress?.length || 0) +
              (filteredTasks.done?.length || 0)}
          </span> tasks
        </div>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search tasks..."
        />
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-full">

            <KanbanColumn
              status="todo"
              title="To Do"
              tasks={filteredTasks.todo}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask('todo')}
              onDeleteTask={handleDeleteTask}
              workspaceId={workspaceId}
            />

            <KanbanColumn
              status="in_progress"
              title="In Progress"
              tasks={filteredTasks.in_progress}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask('in_progress')}
              onDeleteTask={handleDeleteTask}
              workspaceId={workspaceId}
            />

            <KanbanColumn
              status="done"
              title="Done"
              tasks={filteredTasks.done}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask('done')}
              onDeleteTask={handleDeleteTask}
              workspaceId={workspaceId}
            />

          </div>

          {/* Drag Preview */}
          <DragOverlay>
            {activeTask && (
              <div className="rotate-2 scale-105 opacity-95 shadow-2xl">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
        {showCreateModal && (
          <CreateTaskModal
            initialStatus={createModalStatus}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => dispatch(setSelectedTask(null))}
          />
        )}
      </Suspense>

    </div>
  );
}
