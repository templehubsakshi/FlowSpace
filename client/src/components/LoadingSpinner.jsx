export default function LoadingSpinner({ size = 'md', color = 'blue', fullScreen = false, text = null }) {
  const sizes = { sm: 16, md: 28, lg: 40, xl: 52 };
  const borders = { sm: 2, md: 3, lg: 3, xl: 4 };
  const colors = {
    blue:   'var(--brand-primary)',
    green:  'var(--status-done)',
    red:    'var(--status-high)',
    purple: '#a855f7',
    gray:   'var(--text-tertiary)',
    white:  '#ffffff',
  };

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div
        role="status"
        aria-label="Loading"
        style={{
          width: sizes[size], height: sizes[size],
          borderRadius: '50%',
          border: `${borders[size]}px solid ${colors[color]}22`,
          borderTopColor: colors[color],
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
        }}
      />
      {text && (
        <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', fontWeight: 500 }}>{text}</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'var(--surface-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}