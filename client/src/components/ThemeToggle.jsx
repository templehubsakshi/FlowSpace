import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '7px 10px',
        borderRadius: '9px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Label + icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isDark
          ? <Moon style={{ width: 14, height: 14, color: '#818cf8', opacity: 0.7, flexShrink: 0 }} />
          : <Sun  style={{ width: 14, height: 14, color: '#f59e0b', opacity: 0.7, flexShrink: 0 }} />
        }
        <span style={{
          fontSize: 12.5,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.38)',
        }}>
          {isDark ? 'Dark mode' : 'Light mode'}
        </span>
      </div>

      {/* Toggle pill */}
      <div style={{
        position: 'relative',
        width: 46,
        height: 24,
        borderRadius: '999px',
        background: isDark
          ? 'rgba(129,140,248,0.18)'
          : 'rgba(245,158,11,0.15)',
        border: isDark
          ? '1px solid rgba(129,140,248,0.28)'
          : '1px solid rgba(245,158,11,0.28)',
        transition: 'background 0.25s ease, border-color 0.25s ease',
        flexShrink: 0,
      }}>
        {/* Track icons */}
        <span style={{
          position: 'absolute', left: 6,
          top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
          opacity: isDark ? 0.22 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}>
          <Sun style={{ width: 9, height: 9, color: '#f59e0b' }} />
        </span>
        <span style={{
          position: 'absolute', right: 6,
          top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center',
          opacity: isDark ? 0 : 0.22,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}>
          <Moon style={{ width: 9, height: 9, color: '#818cf8' }} />
        </span>

        {/* Sliding knob */}
        <span style={{
          position: 'absolute',
          top: 3,
          left: isDark ? 24 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: isDark
            ? 'linear-gradient(135deg,#818cf8,#a78bfa)'
            : 'linear-gradient(135deg,#fbbf24,#f59e0b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.25s ease',
          boxShadow: isDark
            ? '0 2px 8px rgba(129,140,248,0.5)'
            : '0 2px 8px rgba(245,158,11,0.5)',
          pointerEvents: 'none',
        }}>
          {isDark
            ? <Moon style={{ width: 9, height: 9, color: 'white' }} />
            : <Sun  style={{ width: 9, height: 9, color: 'white' }} />
          }
        </span>
      </div>
    </button>
  );
}