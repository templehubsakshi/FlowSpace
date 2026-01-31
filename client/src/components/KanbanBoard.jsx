import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
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

const CreateTaskModal = lazy(() => import('./CreateTaskModal'));
const TaskDetailModal = lazy(() => import('./TaskDetailModal'));

export default function KanbanBoard() {
  const dispatch = useDispatch();

  const { currentWorkspace } = useSelector((state) => state.workspace);
  const workspaceId = currentWorkspace?._id;
  const { socket, isConnected } = useWorkspaceSocket(workspaceId);
  const { tasks, isLoading, selectedTask } = useSelector((state) => state.tasks);

  const [activeTask, setActiveTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priorities: [],
    statuses: [],
    assignee: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    if (currentWorkspace) {
      dispatch(fetchTasks(currentWorkspace._id));
    }
  }, [currentWorkspace, dispatch]);

  const filteredTasks = useMemo(() => {
    const filterList = (list) =>
      list.filter(task => {
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
      todo: filterList(tasks.todo),
      in_progress: filterList(tasks.in_progress),
      done: filterList(tasks.done)
    };
  }, [tasks, searchQuery, filters]);

  const handleDragStart = useCallback(({ active }) => {
    let foundTask = null;
    Object.keys(tasks).forEach(status => {
      const t = tasks[status].find(task => task._id === active.id);
      if (t) foundTask = t;
    });
    setActiveTask(foundTask);
  }, [tasks]);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    let sourceStatus, sourceIndex;

    Object.keys(tasks).forEach(status => {
      const idx = tasks[status].findIndex(t => t._id === taskId);
      if (idx !== -1) {
        sourceStatus = status;
        sourceIndex = idx;
      }
    });

    let destinationStatus, destinationIndex;

    if (['todo', 'in_progress', 'done'].includes(over.id)) {
      destinationStatus = over.id;
      destinationIndex = tasks[over.id].length;
    } else {
      Object.keys(tasks).forEach(status => {
        const idx = tasks[status].findIndex(t => t._id === over.id);
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
    }))
      .then(res => {
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
          toast.error('Move failed', { id: taskId });
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
  }, []);

  const handleDeleteTask = useCallback(async (taskId) => {
    const result = await dispatch(deleteTask(taskId));

    if (result.type === 'tasks/delete/fulfilled') {
      if (socket && isConnected) {
        socket.emit('task:delete', {
          workspaceId,
          taskId
        });
      }

      toast.success('Task deleted successfully', { icon: '🗑️' });
    } else {
      toast.error(result.payload || 'Failed to delete task');
    }
  }, [dispatch, socket, isConnected, workspaceId]);

  if (!currentWorkspace) {
    return <div className="flex items-center justify-center h-full">Select a workspace</div>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-500">
          {isConnected ? 'Live updates active' : 'Reconnecting...'}
        </span>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div 
              className="rotate-3 scale-105 cursor-grabbing"
              style={{
                opacity: 0.9,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
              }}
            >
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <Suspense fallback={null}>
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
    </>
  );
}
