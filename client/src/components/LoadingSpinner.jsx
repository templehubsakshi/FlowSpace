/**
 * LoadingSpinner
 * 
 * Reusable loading spinner component with different sizes and colors
 * Much better than just showing "Loading..." text
 * 
 * Usage:
 *   <LoadingSpinner /> - default blue medium spinner
 *   <LoadingSpinner size="sm" color="green" /> - small green spinner
 *   <LoadingSpinner fullScreen /> - centered full screen
 */
export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  fullScreen = false,
  text = null 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    green: 'border-green-600 border-t-transparent',
    red: 'border-red-600 border-t-transparent',
    purple: 'border-purple-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          rounded-full 
          animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// 🎯 USAGE EXAMPLES:

// 1. In buttons:
// <button disabled={isLoading}>
//   {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Save'}
// </button>

// 2. In components:
// if (isLoading) return <LoadingSpinner text="Loading tasks..." />;

// 3. Full screen:
// {isLoading && <LoadingSpinner fullScreen text="Saving changes..." />}

// 4. Inline:
// <div className="flex items-center gap-2">
//   <LoadingSpinner size="sm" />
//   <span>Processing...</span>
// </div>