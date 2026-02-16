import { useState } from "react";
import { useDispatch } from "react-redux";
import { createWorkspace } from "../redux/slices/workspaceSlice";
import toast from "react-hot-toast";
import { X, Briefcase } from "lucide-react";

export default function CreateWorkspaceModal({ onClose }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setIsLoading(true);

    const result = await dispatch(
      createWorkspace({ name, description })
    );

    setIsLoading(false);

    if (result.type === "workspace/create/fulfilled") {
      toast.success("Workspace created successfully!");
      onClose();
    } else {
      toast.error(result.payload || "Failed to create workspace");
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/60 backdrop-blur-sm
        flex items-center justify-center
        p-4
      "
    >
      {/* Modal Card */}
      <div
        className="
          w-full max-w-md
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          rounded-2xl
          shadow-2xl
          p-8
          animate-fadeIn
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="
                w-11 h-11
                bg-blue-100 dark:bg-blue-500/20
                rounded-xl
                flex items-center justify-center
              "
            >
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Workspace
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              text-slate-400 hover:text-slate-600
              dark:hover:text-white
              transition
            "
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Workspace Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Workspace Name *
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Team"
              maxLength={50}
              disabled={isLoading}
              className="
                w-full px-4 py-3
                rounded-xl
                border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800
                text-slate-900 dark:text-white
                placeholder-slate-400
                focus:ring-2 focus:ring-blue-500
                focus:border-transparent
                outline-none
                transition
              "
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description (Optional)
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
              rows={3}
              maxLength={200}
              disabled={isLoading}
              className="
                w-full px-4 py-3
                rounded-xl
                border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800
                text-slate-900 dark:text-white
                placeholder-slate-400
                focus:ring-2 focus:ring-blue-500
                focus:border-transparent
                resize-none
                outline-none
                transition
              "
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {description.length}/200 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                flex-1
                px-4 py-3
                rounded-xl
                border border-slate-300 dark:border-slate-600
                bg-slate-100 dark:bg-slate-800
                text-slate-700 dark:text-slate-300
                hover:bg-slate-200 dark:hover:bg-slate-700
                transition font-medium
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="
                flex-1
                px-4 py-3
                rounded-xl
                bg-blue-600 hover:bg-blue-500
                text-white
                font-semibold
                shadow-md
                transition
                disabled:opacity-50
              "
            >
              {isLoading ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
