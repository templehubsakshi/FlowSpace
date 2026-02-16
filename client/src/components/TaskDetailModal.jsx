import { useState, useRef } from "react";
import { X, Send } from "lucide-react";
import MentionDropdown from "./MentionDropdown";

const TaskDetailsModal = ({ task, onClose, onAddComment, workspaceMembers = [] }) => {
  const [comment, setComment] = useState("");
  
  // ✅ Mention functionality state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [mentionedUsers, setMentionedUsers] = useState([]); // ✅ TRACK MENTIONED USERS
  const inputRef = useRef(null);

  if (!task) return null;

  // ✅ Handle text input and detect @ mentions
  const handleCommentChange = (e) => {
    const text = e.target.value;
    setComment(text);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      
      // Check if there's whitespace after @ (if so, cancel mention)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setShowMentionDropdown(true);
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        return;
      }
    }

    // No valid mention found
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
  };

  // ✅ Handle member selection from dropdown
  const handleMentionSelect = (member) => {
    if (mentionStartIndex === -1) return;

    // Replace @query with @MemberName
    const beforeMention = comment.slice(0, mentionStartIndex);
    const afterMention = comment.slice(inputRef.current.selectionStart);
    const newComment = `${beforeMention}@${member.name} ${afterMention}`;

    setComment(newComment);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);

    // ✅ Track mentioned user (avoid duplicates)
    if (!mentionedUsers.find(u => u._id === member._id)) {
      setMentionedUsers([...mentionedUsers, member]);
    }

    // Refocus input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = beforeMention.length + member.name.length + 2; // +2 for @ and space
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    // ✅ Extract user IDs from mentioned users
    const mentionIds = mentionedUsers.map(u => u._id);

    console.log('📤 Sending comment with mentions:', {
      taskId: task._id,
      text: comment,
      mentions: mentionIds
    });

    // ✅ Send comment with mentions array
    onAddComment(task._id, comment, mentionIds);
    
    setComment("");
    setMentionedUsers([]); // ✅ Clear mentions
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
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

            {/* Add Comment - WITH MENTION SUPPORT ✅ */}
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="relative">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Write a comment... (Type @ to mention)"
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
                </div>

                {/* ✅ MENTION DROPDOWN */}
                {showMentionDropdown && (
                  <MentionDropdown
                    query={mentionQuery}
                    members={workspaceMembers}
                    onSelect={handleMentionSelect}
                    onClose={() => setShowMentionDropdown(false)}
                  />
                )}

                {/* ✅ Show mentioned users */}
                {mentionedUsers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-slate-500">Mentioning:</span>
                    {mentionedUsers.map(u => (
                      <span 
                        key={u._id} 
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                      >
                        @{u.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;