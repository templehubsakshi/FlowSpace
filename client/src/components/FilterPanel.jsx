import { useSelector } from 'react-redux';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  const activeFilterCount = Object.values(filters).filter(f =>
    Array.isArray(f) ? f.length > 0 : f
  ).length;

  return (
    <div className="relative" ref={panelRef}>
      
      {/* Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="
          flex items-center gap-2 px-4 py-2.5
          bg-white dark:bg-slate-800
          border border-gray-300 dark:border-slate-700
          text-gray-800 dark:text-gray-200
          rounded-xl
          hover:bg-gray-50 dark:hover:bg-slate-700
          transition shadow-sm
        "
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters</span>

        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}

        <ChevronDown
          className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {showFilters && (
        <div className="
          absolute top-full right-0 mt-3
          w-[340px] max-w-[90vw]
          bg-white dark:bg-slate-900
          border border-gray-200 dark:border-slate-700
          rounded-2xl
          shadow-2xl
          z-[999]
          p-5 space-y-5
          animate-scaleIn
        ">

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Priority
            </label>

            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    const newPriorities = filters.priorities.includes(option.value)
                      ? filters.priorities.filter(p => p !== option.value)
                      : [...filters.priorities, option.value];
                    onFilterChange('priorities', newPriorities);
                  }}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition
                    ${
                      filters.priorities.includes(option.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Status
            </label>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    const newStatuses = filters.statuses.includes(option.value)
                      ? filters.statuses.filter(s => s !== option.value)
                      : [...filters.statuses, option.value];
                    onFilterChange('statuses', newStatuses);
                  }}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition
                    ${
                      filters.statuses.includes(option.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          {currentWorkspace?.members && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Assignee
              </label>

              <select
                value={filters.assignee || ''}
                onChange={(e) => onFilterChange('assignee', e.target.value)}
                className="
                  w-full px-3 py-2
                  bg-white dark:bg-slate-800
                  border border-gray-300 dark:border-slate-700
                  text-gray-800 dark:text-gray-200
                  rounded-lg
                  focus:ring-2 focus:ring-blue-500
                  focus:border-transparent
                "
              >
                <option value="">All Members</option>
                <option value="unassigned">Unassigned</option>
                {currentWorkspace.members.map(member => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-2
                bg-gray-100 dark:bg-slate-800
                text-gray-700 dark:text-gray-300
                rounded-lg
                hover:bg-gray-200 dark:hover:bg-slate-700
                transition font-medium
              "
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}

        </div>
      )}
    </div>
  );
}
