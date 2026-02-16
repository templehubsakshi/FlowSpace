import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * MentionDropdown
 * 
 * Props:
 *   query      — the text typed after @ (e.g. "jo"). Used to filter members.
 *   members    — array of workspace members to search through. Shape: [{ _id, name }]
 *   onSelect   — callback when user picks a member. Receives the full member object.
 *   onClose    — callback to hide the dropdown (e.g. when user presses Escape).
 */
export default function MentionDropdown({ query, members, onSelect, onClose }) {
  const listRef = useRef(null);
  const highlightedRef = useRef(null);

  // Filter members whose name starts with the query (case-insensitive)
  const filtered = useMemo(() => 
    members.filter((member) =>
      member.name.toLowerCase().startsWith(query.toLowerCase())
    ), [members, query]
  );

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  // Ensure index is always valid
  const safeHighlightedIndex = Math.min(highlightedIndex, Math.max(0, filtered.length - 1));

  // Auto-scroll the highlighted item into view
  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [safeHighlightedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filtered.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (filtered[safeHighlightedIndex]) {
            onSelect(filtered[safeHighlightedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, safeHighlightedIndex, onSelect, onClose]);

  // Nothing to show
  if (filtered.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-[60] overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Mention a member</p>
      </div>

      {/* Member list */}
      <ul className="max-h-48 overflow-y-auto py-1">
        {filtered.map((member, index) => (
          <li
            key={member._id}
            ref={index === safeHighlightedIndex ? highlightedRef : null}
            onClick={() => onSelect(member)}
            className={`
              flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors
              ${index === safeHighlightedIndex 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }
            `}
          >
            {/* Avatar circle with first letter */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              ${index === safeHighlightedIndex 
                ? 'bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200' 
                : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
              }
            `}>
              {member.name.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <span className="text-sm font-medium truncate">{member.name}</span>
          </li>
        ))}
      </ul>

      {/* Keyboard hint */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-400 dark:text-slate-500">↑↓ navigate · Enter select · Esc cancel</p>
      </div>
    </div>
  );
}