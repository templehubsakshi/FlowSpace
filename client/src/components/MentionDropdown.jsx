import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

/**
 * MentionDropdown
 * 
 * Props:
 *   query      — the text typed after @ (e.g. "jo"). Used to filter members.
 *   members    — array of workspace members to search through. Shape: [{ _id, name }]
 *   onSelect   — callback when user picks a member. Receives the full member object.
 *   onClose    — callback to hide the dropdown (e.g. when user presses Escape).
 *   anchorRef  — ref to the input this dropdown is attached to. Used to
 *                position the dropdown via a portal (see FIX note below).
 */
export default function MentionDropdown({ query, members, onSelect, onClose, anchorRef }) {
  const listRef = useRef(null);
  const highlightedRef = useRef(null);

  // FIX: This dropdown used to be positioned with `position: absolute; top:
  // 100%` relative to the comment input. That works fine on its own, but the
  // input lives inside TaskDetailModal's modal card, which has
  // `overflow: hidden` (needed to clip the card's own rounded corners). Since
  // the comment box sits near the bottom of that card, the dropdown almost
  // always got clipped or invisible instead of floating below the input.
  // Rendering it through a portal into document.body with a computed
  // `position: fixed` avoids that ancestor clipping entirely, and lets us
  // flip the dropdown above the input when there isn't room below (e.g. on
  // short viewports / mobile keyboards).
  const [coords, setCoords] = useState(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const dropdownWidth = 224; // matches w-56
      const estimatedHeight = 220; // header + up to ~6 rows + footer, approx
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const spaceBelow = viewportH - rect.bottom;
      const openAbove = spaceBelow < estimatedHeight && rect.top > spaceBelow;

      let left = rect.left;
      if (left + dropdownWidth > viewportW - 8) left = Math.max(8, viewportW - dropdownWidth - 8);

      setCoords({
        left,
        top: openAbove ? undefined : rect.bottom + 6,
        bottom: openAbove ? viewportH - rect.top + 6 : undefined,
        width: dropdownWidth,
        maxHeight: openAbove ? rect.top - 14 : viewportH - rect.bottom - 14,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, query]);

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
  // Wait for the first layout pass so we don't flash at (0,0) or under the anchor.
  if (!coords) return null;

  return createPortal(
    <div
      ref={listRef}
      className="w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
      style={{
        position: 'fixed',
        left: coords.left,
        top: coords.top,
        bottom: coords.bottom,
        width: coords.width,
        maxHeight: coords.maxHeight,
        zIndex: 10000, // above modal overlays (which use z-index: 9999)
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700" style={{ flexShrink: 0 }}>
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Mention a member</p>
      </div>

      {/* Member list — flexes/shrinks to fit whatever room is left within the
          computed maxHeight (see FIX note above) instead of a fixed max-h,
          so the header/footer never get clipped on very short viewports. */}
      <ul className="overflow-y-auto py-1" style={{ flex: '1 1 auto', minHeight: 0 }}>
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
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700" style={{ flexShrink: 0 }}>
        <p className="text-xs text-gray-400 dark:text-slate-500">↑↓ navigate · Enter select · Esc cancel</p>
      </div>
    </div>,
    document.body
  );
}