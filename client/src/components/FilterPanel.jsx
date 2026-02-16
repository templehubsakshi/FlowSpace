import { useSelector } from 'react-redux';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [showFilters, setShowFilters] = useState(false);

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' }
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
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 space-y-4">
          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    filters.priorities.includes(option.value)
                      ? option.color + ' ring-2 ring-offset-1 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    filters.statuses.includes(option.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          {currentWorkspace?.members && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assignee
              </label>
              <select
                value={filters.assignee || ''}
                onChange={(e) => onFilterChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
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