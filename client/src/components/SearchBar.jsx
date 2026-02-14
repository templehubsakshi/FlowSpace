import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-12 pr-12 py-3
          bg-white dark:bg-slate-800
          border-2 border-gray-200 dark:border-slate-700
          rounded-xl
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:border-blue-500 dark:focus:border-blue-400
          focus:ring-4 focus:ring-blue-500/10
          transition-all duration-200
          outline-none
        "
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            p-1.5 rounded-lg
            text-gray-400 hover:text-gray-600
            dark:text-gray-500 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-slate-700
            transition-all duration-200
          "
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}