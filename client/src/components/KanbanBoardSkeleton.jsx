export default function KanbanBoardSkeleton() {
  const columns = [
    { 
      id: 'todo', 
      title: 'To Do', 
      gradient: 'from-slate-600 to-slate-700',
      shimmer: 'bg-slate-200 dark:bg-slate-700'
    },
    { 
      id: 'in_progress', 
      title: 'In Progress', 
      gradient: 'from-indigo-600 to-indigo-700',
      shimmer: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    { 
      id: 'done', 
      title: 'Done', 
      gradient: 'from-emerald-600 to-emerald-700',
      shimmer: 'bg-emerald-100 dark:bg-emerald-900/30'
    }
  ];

  return (
    <div className="w-full h-full">
      {/* Search & Filter Skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 animate-fadeIn">
        <div className="flex-1 h-11 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 dark:via-slate-700 to-transparent animate-shimmer" />
        </div>
        <div className="w-full sm:w-40 h-11 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 dark:via-slate-700 to-transparent animate-shimmer" style={{ animationDelay: '0.1s' }} />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column, colIndex) => (
          <div 
            key={column.id}
            className="flex flex-col rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden animate-fadeIn"
            style={{ animationDelay: `${colIndex * 0.1}s` }}
          >
            {/* Column Header */}
            <div className={`bg-gradient-to-r ${column.gradient} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Title shimmer */}
                  <div className="h-6 w-24 bg-white/20 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                  {/* Count badge shimmer */}
                  <div className="h-6 w-8 bg-white/20 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                {/* Plus button shimmer */}
                <div className="w-8 h-8 bg-white/10 rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 p-4 space-y-3">
              {/* Generate 3 cards with staggered animation */}
              {[0, 1, 2].map((cardIndex) => (
                <ProfessionalSkeletonCard 
                  key={cardIndex} 
                  delay={colIndex * 0.1 + cardIndex * 0.05}
                  shimmerColor={column.shimmer}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 🎴 Professional Skeleton Card
 * Individual task card skeleton with realistic proportions
 */
function ProfessionalSkeletonCard({ delay = 0, shimmerColor = 'bg-gray-200' }) {
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm animate-fadeIn"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Priority Badge & Status Indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className={`h-6 w-20 ${shimmerColor} rounded-full overflow-hidden relative`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" />
        </div>
        <div className="h-4 w-4 bg-gray-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Title Lines */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent animate-shimmer" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-3/4 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent animate-shimmer" style={{ animationDelay: '0.1s' }} />
        </div>
      </div>

      {/* Description Lines */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-100 dark:bg-slate-700/50 rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-slate-700/50 rounded w-5/6" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-16 bg-purple-100 dark:bg-purple-900/30 rounded-full" />
        <div className="h-6 w-20 bg-purple-100 dark:bg-purple-900/30 rounded-full" />
      </div>

      {/* Footer - Avatar & Date */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}