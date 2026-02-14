import { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

/**
 * MentionDropdown
 * 
 * Props:
 *   query      — the text typed after @ (e.g. "jo"). Used to filter members.
 *   members    — array of workspace members to search through. Shape: [{ _id, name }]
 *   onSelect   — callback when user picks a member. Receives the full member object.
 *   onClose    — callback to hide the dropdown (e.g. when user presses Escape).
 * 
 * This component handles:
 *   - Filtering the member list based on query
 *   - Keyboard navigation (arrow keys + Enter)
 *   - Closing on Escape
 *   - Auto-scrolling the highlighted item into view
 */
export default function MentionDropdown({ query, members, onSelect, onClose }) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef(null);
  const highlightedRef = useRef(null);

  // Filter members whose name starts with the query (case-insensitive)
  // If query is empty string (user just typed @), show everyone
  const filtered = members.filter((member) =>
    member.name.toLowerCase().startsWith(query.toLowerCase())
  );

  // Reset highlight to top whenever the query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Auto-scroll the highlighted item into view
  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

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
          onSelect(filtered[highlightedIndex]);
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
  }, [filtered, highlightedIndex, onSelect, onClose]);

  // Nothing to show — don't render anything
  if (filtered.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
    >
      {/* Small label at the top so the user knows what's happening */}
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-500 font-medium">Mention a member</p>
      </div>

      {/* Member list */}
      <ul className="max-h-48 overflow-y-auto py-1">
        {filtered.map((member, index) => (
          <li
            key={member._id}
            ref={index === highlightedIndex ? highlightedRef : null}
            onClick={() => onSelect(member)}
            className={`
              flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors
              ${index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
            `}
          >
            {/* Avatar circle with first letter */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              ${index === highlightedIndex ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'}
            `}>
              {member.name.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <span className="text-sm font-medium truncate">{member.name}</span>
          </li>
        ))}
      </ul>

      {/* Keyboard hint at the bottom */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">↑↓ navigate · Enter select · Esc cancel</p>
      </div>
    </div>
  );
}