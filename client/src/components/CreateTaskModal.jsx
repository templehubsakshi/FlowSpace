import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../redux/slices/taskSlice';
import { useSocket } from '../hooks/Usesocket'
import toast from 'react-hot-toast';
import { X, Plus, Calendar, Tag, User, AlertCircle } from 'lucide-react';

export default function CreateTaskModal({ initialStatus = 'todo', onClose }) {

  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { socket } = useSocket();

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    assignee: '',
    dueDate: '',
    tags: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsLoading(true);

    const taskData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      workspaceId: currentWorkspace._id,
      tags: formData.tags
        ? formData.tags.split(',').map(t => t.trim())
        : []
    };

    if (formData.assignee) taskData.assignee = formData.assignee;
    if (formData.dueDate) taskData.dueDate = formData.dueDate;

    const result = await dispatch(createTask(taskData));
    setIsLoading(false);

    if (result.type === 'tasks/create/fulfilled') {

      if (socket) {
        socket.emit('task:create', {
          workspaceId: currentWorkspace._id,
          task: result.payload
        });
      }

      toast.success('🎉 Task created successfully!');
      setTimeout(() => onClose(), 500);

    } else {
      toast.error(result.payload || 'Failed to create task');
    }
  };

  return (

    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-black/50 backdrop-blur-sm">

      {/* Modal Card */}
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto
        bg-white dark:bg-slate-800
        rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="sticky top-0
          bg-white dark:bg-slate-800
          border-b border-gray-200 dark:border-slate-700
          p-6 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10
              bg-blue-100 dark:bg-slate-700
              rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold
              text-gray-800 dark:text-white">
              Create New Task
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold
              text-gray-700 dark:text-gray-300 mb-2">
              Task Title *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={200}
              disabled={isLoading}
              placeholder="Design landing page"
              className="w-full px-4 py-3 rounded-lg border
                border-gray-300 dark:border-slate-600
                bg-white dark:bg-slate-700
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/200
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold
              text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={2000}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border
                border-gray-300 dark:border-slate-600
                bg-white dark:bg-slate-700
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000
            </p>
          </div>

          {/* Status + Priority */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Status */}
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className="px-4 py-3 rounded-lg border
                border-gray-300 dark:border-slate-600
                bg-white dark:bg-slate-700
                text-gray-900 dark:text-white"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {/* Priority */}
            <div className="relative">
              <AlertCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 rounded-lg border
                  border-gray-300 dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

          </div>

          {/* Assignee + Date */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Assignee */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 rounded-lg border
                  border-gray-300 dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-gray-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {currentWorkspace?.members.map((member) => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-11 pr-4 py-3 rounded-lg border
                  border-gray-300 dark:border-slate-600
                  bg-white dark:bg-slate-700
                  text-gray-900 dark:text-white"
              />
            </div>

          </div>

          {/* Tags */}
          <div className="relative">
            <Tag className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="design, frontend"
              className="w-full pl-11 pr-4 py-3 rounded-lg border
                border-gray-300 dark:border-slate-600
                bg-white dark:bg-slate-700
                text-gray-900 dark:text-white"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-medium
              bg-blue-600 hover:bg-blue-700 text-white
              transition shadow-lg hover:shadow-xl
              disabled:opacity-50">

            {isLoading ? "Creating..." : "Create Task"}
          </button>

        </form>
      </div>
    </div>
  );
}
