import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg hover:shadow-xl group"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Switch */}
      <span
        className={`
          absolute top-1 left-1 w-6 h-6
          bg-white dark:bg-slate-900
          rounded-full shadow-xl
          transform transition-all duration-300 ease-out
          flex items-center justify-center
          ${isDark ? 'translate-x-8' : 'translate-x-0'}
          group-hover:scale-110
        `}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-blue-400 animate-pulse" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500 animate-pulse" />
        )}
      </span>
      
      {/* Background Icons */}
      <div className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-300 ${
        isDark ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="w-3 h-3"></div>
        <Sun className="w-3 h-3 text-yellow-600" />
      </div>
      
      <div className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-300 ${
        isDark ? 'opacity-100' : 'opacity-0'
      }`}>
        <Moon className="w-3 h-3 text-blue-300" />
        <div className="w-3 h-3"></div>
      </div>
    </button>
  );
}