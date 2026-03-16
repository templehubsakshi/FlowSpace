import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search tasks...' }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 36, display: 'flex', alignItems: 'center', borderRadius: '999px', isolation: 'isolate' }}>
      <Search style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'rgba(255,255,255,0.22)', pointerEvents: 'none', zIndex: 1 }} />

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', height: '100%',
          padding: '0 36px 0 36px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '999px',
          fontSize: 13, color: '#EEEEF5',
          outline: 'none', fontFamily: 'inherit',
          transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
        }}
        onFocus={e => {
          e.target.style.background   = 'rgba(255,255,255,0.07)';
          e.target.style.borderColor  = 'rgba(129,140,248,0.45)';
          e.target.style.boxShadow    = 'inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 2px rgba(129,140,248,0.12)';
        }}
        onBlur={e => {
          e.target.style.background   = 'rgba(255,255,255,0.05)';
          e.target.style.borderColor  = 'rgba(255,255,255,0.08)';
          e.target.style.boxShadow    = 'inset 0 1px 4px rgba(0,0,0,0.3)';
        }}
      />

      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search"
          style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'5px', background:'rgba(255,255,255,0.07)', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', transition:'all 0.12s ease', zIndex:1 }}
          onMouseEnter={e => { e.currentTarget.style.color='#EEEEF5'; e.currentTarget.style.background='rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
        >
          <X style={{ width: 10, height: 10 }} />
        </button>
      )}
    </div>
  );
}