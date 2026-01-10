import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTask, deleteTask, addComment, deleteComment } from '../redux/slices/taskSlice';
import toast from 'react-hot-toast';
import { 
  X, 
  Calendar, 
  User, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  Trash2,
  Edit2,
  Check,
  Tag
} from 'lucide-react';

export default function TaskDetailModal({ task, onClose }) {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee?._id || '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  });
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityConfig = {
    low: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  const handleSave = async () => {
    if (!editData.title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    setIsSubmitting(true);

    const result = await dispatch(updateTask({
      taskId: task._id,
      updates: editData
    }));

    setIsSubmitting(false);

    if (result.type === 'tasks/update/fulfilled') {
      toast.success('Task updated successfully');
      setIsEditing(false);
    } else {
      toast.error(result.payload || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    const result = await dispatch(deleteTask(task._id));

    if (result.type === 'tasks/delete/fulfilled') {
      toast.success('Task deleted successfully');
      onClose();
    } else {
      toast.error(result.payload || 'Failed to delete task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    setIsSubmitting(true);

    const result = await dispatch(addComment({
      taskId: task._id,
      text: commentText
    }));

    setIsSubmitting(false);

    if (result.type === 'tasks/addComment/fulfilled') {
      setCommentText('');
      toast.success('Comment added');
    } else {
      toast.error(result.payload || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    const result = await dispatch(deleteComment({
      taskId: task._id,
      commentId
    }));

    if (result.type === 'tasks/deleteComment/fulfilled') {
      toast.success('Comment deleted');
    } else {
      toast.error(result.payload || 'Failed to delete comment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-2xl font-bold text-gray-800 w-full border-b-2 border-blue-500 focus:outline-none"
                  disabled={isSubmitting}
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
              )}
              
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priority.bg} ${priority.text}`}>
                  {task.priority}
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                  title="Save"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || 'No description'}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <p className="text-gray-900 font-medium capitalize">
                  {task.status.replace('_', ' ')}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Priority
              </label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              ) : (
                <p className="text-gray-900 font-medium capitalize">{task.priority}</p>
              )}
            </div>

            {/* Assignee */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignee
              </label>
              {isEditing ? (
                <select
                  value={editData.assignee}
                  onChange={(e) => setEditData({ ...editData, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Unassigned</option>
                  {currentWorkspace?.members.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 font-medium">
                  {task.assignee?.name || 'Unassigned'}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({task.comments?.length || 0})
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{comment.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {comment.user._id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}