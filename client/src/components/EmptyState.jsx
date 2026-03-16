import { ClipboardList, Zap, CheckCircle2, Sparkles, Plus } from 'lucide-react';

const VARIANTS = {
  tasks: {
    Icon:   ClipboardList,
    color:  'var(--brand-primary)',
    bg:     'rgba(129,140,248,0.10)',
    border: 'rgba(129,140,248,0.18)',
    glow:   'rgba(129,140,248,0.12)',
  },
  in_progress: {
    Icon:   Zap,
    color:  'var(--status-progress)',
    bg:     'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.18)',
    glow:   'rgba(251,191,36,0.10)',
  },
  done: {
    Icon:   CheckCircle2,
    color:  'var(--status-done)',
    bg:     'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.18)',
    glow:   'rgba(52,211,153,0.10)',
  },
  workspace: {
    Icon:   Sparkles,
    color:  'var(--brand-primary)',
    bg:     'rgba(129,140,248,0.10)',
    border: 'rgba(129,140,248,0.18)',
    glow:   'rgba(129,140,248,0.12)',
  },
  default: {
    Icon:   ClipboardList,
    color:  'var(--text-tertiary)',
    bg:     'var(--surface-hover)',
    border: 'var(--border-subtle)',
    glow:   'transparent',
  },
};

export default function EmptyState({ title, description, action, illustration = 'default' }) {
  const v = VARIANTS[illustration] || VARIANTS.default;
  const { Icon } = v;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      textAlign: 'center',
      animation: 'esIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>

      {/* Icon container — subtle radial glow behind it */}
      <div style={{
        position: 'relative',
        marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Soft radial glow ring */}
        <div style={{
          position: 'absolute',
          width: 80, height: 80, borderRadius: '50%',
          background: `radial-gradient(circle, ${v.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{
          width: 56, height: 56,
          borderRadius: 16,
          background: v.bg,
          border: `1px solid ${v.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: v.color,
          position: 'relative',
          animation: 'esFloat 4s ease-in-out infinite',
          /* FIX: added box-shadow so icon box has presence, not flat */
          boxShadow: `0 8px 24px ${v.glow}, inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}>
          <Icon style={{ width: 24, height: 24 }} />
        </div>
      </div>

      <h3 style={{
        fontSize: 13.5,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 7,
        letterSpacing: '-0.2px',
        opacity: 0.85,
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: 12,
        color: 'var(--text-tertiary)',
        maxWidth: 240,
        lineHeight: 1.65,
        marginBottom: action ? 22 : 0,
        opacity: 0.7,
      }}>
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary btn-sm"
          style={{
            fontSize: 12,
            boxShadow: `0 4px 14px ${v.glow}`,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform  = 'translateY(-2px)';
            e.currentTarget.style.boxShadow  = `0 6px 20px ${v.glow}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform  = 'none';
            e.currentTarget.style.boxShadow  = `0 4px 14px ${v.glow}`;
          }}
        >
          <Plus style={{ width: 12, height: 12 }} />
          {action.label}
        </button>
      )}

      <style>{`
        @keyframes esIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes esFloat {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}