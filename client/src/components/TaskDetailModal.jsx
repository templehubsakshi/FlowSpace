import { useState } from "react";
import { X, Send } from "lucide-react";

const TaskDetailsModal = ({ task, onClose, onAddComment }) => {
  const [comment, setComment] = useState("");

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onAddComment(task._id, comment);
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-slate-900 
                   text-slate-900 dark:text-slate-100
                   rounded-2xl w-full max-w-3xl 
                   max-h-[90vh] flex flex-col
                   shadow-2xl 
                   border border-slate-200 dark:border-slate-700"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold">{task.title}</h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-500 dark:text-slate-400">
              Description
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Priority</p>
              <p className="font-medium">{task.priority || "Medium"}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <p className="font-medium">{task.status}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Assigned To</p>
              <p className="font-medium">
                {task.assignedTo?.name || "Unassigned"}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Due Date</p>
              <p className="font-medium">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "No due date"}
              </p>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Comments</h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {task.comments?.length > 0 ? (
                task.comments.map((c, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-800/60 
                               border border-slate-200 dark:border-slate-700 
                               rounded-xl p-4"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {c.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No comments yet.
                </p>
              )}
            </div>

            {/* Add Comment */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 mt-4"
            >
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 
                           bg-white dark:bg-slate-800
                           border border-slate-300 dark:border-slate-600
                           rounded-lg
                           focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent
                           text-slate-900 dark:text-slate-100"
              />

              <button
                type="submit"
                className="px-4 py-2 
                           bg-blue-600 hover:bg-blue-700 
                           text-white 
                           rounded-lg 
                           transition 
                           disabled:opacity-50 
                           flex items-center gap-2 
                           shadow-sm"
                disabled={!comment.trim()}
              >
                <Send size={16} />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
