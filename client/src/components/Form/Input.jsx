import { AlertCircle } from 'lucide-react';

export default function Input({ label, error, required, helperText, icon: Icon, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label} {required && <span style={{ color: 'var(--status-high)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 14, color: 'var(--text-tertiary)', pointerEvents: 'none',
          }} />
        )}

        <input
          {...props}
          style={{
            width: '100%',
            padding: `9px 12px 9px ${Icon ? '34px' : '12px'}`,
            background: 'var(--surface-sunken)',
            border: `1px solid ${error ? 'var(--status-high)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: 13, color: 'var(--text-primary)',
            outline: 'none', fontFamily: 'inherit',
            transition: 'var(--transition-fast)',
            opacity: props.disabled ? 0.6 : 1,
            boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
            ...props.style,
          }}
          onFocus={e => {
            if (!error) {
              e.target.style.borderColor = 'var(--brand-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(91,106,240,0.12)';
              e.target.style.background = 'var(--surface-base)';
            }
            props.onFocus?.(e);
          }}
          onBlur={e => {
            if (!error) {
              e.target.style.borderColor = 'var(--border-default)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = 'var(--surface-sunken)';
            }
            props.onBlur?.(e);
          }}
        />
      </div>

      {error && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--status-high)' }}>
          <AlertCircle style={{ width: 12, height: 12 }} />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{helperText}</p>
      )}
    </div>
  );
}