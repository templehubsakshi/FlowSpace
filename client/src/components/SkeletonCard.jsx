export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
      {/* Priority badge skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </div>

      {/* Title skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-100 rounded w-full"></div>
        <div className="h-3 bg-gray-100 rounded w-5/6"></div>
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
// SkeletonCard shows a placeholder UI while task data is loading
// animate-pulse gives loading animation
// Gray blocks represent priority, title, description, tags and footer
// Improves perceived performance and avoids blank screen
