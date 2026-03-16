import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createWorkspace } from '../redux/slices/workspaceSlice';
import toast from 'react-hot-toast';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import { useThemeColors } from '../hooks/useTheme';

const WS_COLORS = [
  { from: '#6366f1', to: '#4f46e5', label: 'Indigo'  },
  { from: '#8b5cf6', to: '#7c3aed', label: 'Violet'  },
  { from: '#ec4899', to: '#db2777', label: 'Pink'    },
  { from: '#14b8a6', to: '#0d9488', label: 'Teal'    },
  { from: '#f59e0b', to: '#d97706', label: 'Amber'   },
  { from: '#3b82f6', to: '#2563eb', label: 'Blue'    },
  { from: '#10b981', to: '#059669', label: 'Emerald' },
  { from: '#ef4444', to: '#dc2626', label: 'Red'     },
];

function WorkspacePreview({ name, color }) {
  const letter = name.trim() ? name.trim()[0].toUpperCase() : '?';
  return (
    <div style={{ width:42, height:42, borderRadius:11, flexShrink:0, background:`linear-gradient(135deg,${color.from},${color.to})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', boxShadow:`0 4px 18px ${color.from}55`, transition:'all .25s cubic-bezier(.34,1.56,.64,1)', letterSpacing:'-.5px' }}>
      {letter}
    </div>
  );
}

export default function CreateWorkspaceModal({ onClose }) {
  const T = useThemeColors();
  const dispatch = useDispatch();

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor]             = useState(WS_COLORS[0]);
  const [isLoading, setIsLoading]     = useState(false);
  const [succeeded, setSucceeded]     = useState(false);
  const [nameError, setNameError]     = useState('');
  const [visible, setVisible]         = useState(false);

  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); setTimeout(() => inputRef.current?.focus(), 250); }, []);

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setVisible(false);
    setTimeout(onClose, 220);
  }, [isLoading, onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !isLoading) handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLoading, handleClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Workspace name is required.'); return; }
    if (name.trim().length < 2) { setNameError('Name must be at least 2 characters.'); return; }
    setIsLoading(true);
    const result = await dispatch(createWorkspace({ name: name.trim(), description: description.trim(), color }));
    setIsLoading(false);
    if (result.type === 'workspace/create/fulfilled') {
      setSucceeded(true);
      toast.success('Workspace created successfully!');
      setTimeout(handleClose, 1600);
    } else {
      toast.error(result.payload || 'Failed to create workspace');
    }
  };

  const canSubmit = name.trim().length >= 2 && !isLoading && !succeeded;

  return (
    <>
      <style>{`
        .cwm-overlay { transition: opacity .22s ease; }
        .cwm-card { transition: opacity .22s cubic-bezier(.22,1,.36,1), transform .22s cubic-bezier(.22,1,.36,1); }
        .cwm-card.in  { opacity:1!important; transform:scale(1) translateY(0)!important; }
        .cwm-card.out { opacity:0!important; transform:scale(.96) translateY(10px)!important; }
        .cwm-input { transition:border-color .15s,box-shadow .15s,background .15s; background:${T.s2}; border:1px solid ${T.border2}; color:${T.text}; }
        .cwm-input::placeholder { color:${T.muted}; }
        .cwm-input:focus { outline:none; background:${T.s3}; border-color:rgba(99,102,241,0.6); box-shadow:0 0 0 4px rgba(99,102,241,0.12); }
        .cwm-input.error { border-color:rgba(239,68,68,.6)!important; box-shadow:0 0 0 3px rgba(239,68,68,.15)!important; }
        .cwm-color-dot { cursor:pointer; transition:transform .15s,box-shadow .15s,outline .15s; border-radius:50%; border:none; }
        .cwm-color-dot:hover { transform:scale(1.18); }
        .cwm-color-dot.active { outline:2px solid rgba(255,255,255,.7); outline-offset:2px; transform:scale(1.15); }
        .cwm-cancel { transition:background .15s,border-color .15s,color .15s; background:transparent; border:1px solid ${T.border2}; color:${T.muted}; }
        .cwm-cancel:hover:not(:disabled) { background:${T.s2}; border-color:${T.border3}; color:${T.text}; }
        .cwm-submit { border:none; box-shadow:0 4px 20px rgba(99,102,241,.35),inset 0 1px 0 rgba(255,255,255,.12); transition:opacity .15s,box-shadow .15s,transform .1s; color:#fff; }
        .cwm-submit:hover:not(:disabled) { opacity:.91; box-shadow:0 6px 28px rgba(99,102,241,.50),inset 0 1px 0 rgba(255,255,255,.12); transform:translateY(-1px); }
        .cwm-submit:disabled { opacity:.35; cursor:not-allowed; }
        .cwm-close { transition:background .15s,color .15s; background:transparent; border:1px solid ${T.border2}; color:${T.muted}; cursor:pointer; }
        .cwm-close:hover { background:${T.s2}; color:${T.text}; }
        @keyframes cwm-spin { to{transform:rotate(360deg)} }
        .cwm-spin { width:15px;height:15px;border-radius:50%;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;animation:cwm-spin .65s linear infinite;display:inline-block; }
        @keyframes successPop { 0%{transform:scale(.5);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        .cwm-success-icon { animation:successPop .4s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .cwm-success-text { animation:fadeSlideIn .3s .25s ease both; }
        .cwm-char-bar { height:2px;border-radius:2px;transition:width .2s,background .2s; }
      `}</style>

      {/* Overlay */}
      <div className="cwm-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background:'rgba(0,0,0,0.50)', backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)', opacity:visible?1:0 }}
        onClick={(e) => e.target===e.currentTarget && handleClose()}>

        {/* Gradient border */}
        <div style={{ position:'relative', borderRadius:22, padding:1, width:'100%', maxWidth:520, background:`linear-gradient(145deg,${color.from}80,${color.to}40 50%,${T.border3})`, transition:'background .4s ease' }}>
          <div ref={modalRef} role="dialog" aria-modal="true" className={`cwm-card ${visible?'in':'out'}`}
            style={{ borderRadius:21, background:T.surface, overflow:'hidden', position:'relative', opacity:0, transform:'scale(.95) translateY(14px)' }}>

            {/* Shimmer top */}
            <div style={{ height:1, background:`linear-gradient(90deg,transparent,${color.from}ee 40%,${color.to}ee 60%,transparent)`, transition:'background .4s ease' }} />

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 26px 20px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <WorkspacePreview name={name} color={color} />
                <div>
                  <h2 style={{ fontSize:17, fontWeight:700, color:T.text, margin:0, letterSpacing:'-.3px' }}>Create Workspace</h2>
                  <p style={{ fontSize:12.5, margin:'3px 0 0', color:name.trim()?T.muted:T.muted }}>
                    {name.trim() ? <><span style={{ color:T.text2, fontWeight:600 }}>{name.trim()}</span> workspace</> : 'Name your workspace below'}
                  </p>
                </div>
              </div>
              <button className="cwm-close" onClick={handleClose} aria-label="Close" style={{ width:32, height:32, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X style={{ width:14, height:14 }} />
              </button>
            </div>

            {/* Success state */}
            {succeeded ? (
              <div style={{ padding:'44px 26px 48px', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                <div className="cwm-success-icon" style={{ width:62, height:62, borderRadius:'50%', background:`linear-gradient(135deg,${color.from}40,${color.to}25)`, border:`1px solid ${color.from}66`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 28px ${color.from}40` }}>
                  <CheckCircle2 style={{ width:26, height:26, color:'#34d399' }} />
                </div>
                <div className="cwm-success-text" style={{ textAlign:'center' }}>
                  <p style={{ fontSize:16, fontWeight:700, color:T.text, margin:'0 0 6px', letterSpacing:'-.2px' }}>Workspace Created!</p>
                  <p style={{ fontSize:13, color:T.muted, margin:0, lineHeight:1.6 }}>
                    <span style={{ color:T.text2, fontWeight:600 }}>{name.trim()}</span> is ready to go.
                  </p>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} noValidate style={{ padding:'26px 26px 24px' }}>

                {/* Name */}
                <div style={{ marginBottom:20 }}>
                  <label htmlFor="cwm-name" style={{ display:'block', fontSize:11, fontWeight:600, color:T.muted, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:9 }}>Workspace Name</label>
                  <input id="cwm-name" ref={inputRef} type="text" value={name} onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }} placeholder="e.g., Marketing Team" maxLength={50} disabled={isLoading} className={`cwm-input${nameError?' error':''}`}
                    style={{ width:'100%', boxSizing:'border-box', padding:'12px 14px', borderRadius:11, fontSize:14 }} />
                  <div style={{ marginTop:7, display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:2, borderRadius:2, background:T.border2 }}>
                      <div className="cwm-char-bar" style={{ width:`${(name.length/50)*100}%`, background:name.length>45?'#f59e0b':name.length>0?color.from:'transparent' }} />
                    </div>
                    <span style={{ fontSize:11, color:name.length>45?'#f59e0b':T.muted, flexShrink:0 }}>{name.length}/50</span>
                  </div>
                  {nameError && <p role="alert" style={{ fontSize:12, color:'#f87171', margin:'6px 0 0 2px' }}>{nameError}</p>}
                </div>

                {/* Description */}
                <div style={{ marginBottom:20 }}>
                  <label htmlFor="cwm-desc" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, fontWeight:600, color:T.muted, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:9 }}>
                    Description <span style={{ fontSize:10, color:T.muted, textTransform:'none', letterSpacing:0, fontWeight:400 }}>Optional</span>
                  </label>
                  <textarea id="cwm-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this workspace for?" rows={3} maxLength={200} disabled={isLoading} className="cwm-input"
                    style={{ width:'100%', boxSizing:'border-box', padding:'12px 14px', borderRadius:11, fontSize:14, resize:'none', lineHeight:1.6 }} />
                  <div style={{ marginTop:7, display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:2, borderRadius:2, background:T.border2 }}>
                      <div className="cwm-char-bar" style={{ width:`${(description.length/200)*100}%`, background:description.length>185?'#f59e0b':description.length>0?color.from:'transparent' }} />
                    </div>
                    <span style={{ fontSize:11, color:description.length>185?'#f59e0b':T.muted, flexShrink:0 }}>{description.length}/200</span>
                  </div>
                </div>

                {/* Color picker */}
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.muted, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:11 }}>Workspace Color</label>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    {WS_COLORS.map(c => (
                      <button key={c.label} type="button" aria-label={`Color: ${c.label}`} aria-pressed={color.label===c.label} onClick={() => setColor(c)} disabled={isLoading}
                        className={`cwm-color-dot${color.label===c.label?' active':''}`}
                        style={{ width:26, height:26, background:`linear-gradient(135deg,${c.from},${c.to})`, boxShadow:color.label===c.label?`0 0 12px ${c.from}90`:'none' }} />
                    ))}
                    <span style={{ fontSize:12, color:T.muted, marginLeft:4 }}>{color.label}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={handleClose} disabled={isLoading} className="cwm-cancel"
                    style={{ flex:1, padding:'12px 0', borderRadius:11, fontSize:13.5, fontWeight:500, cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={!canSubmit} className="cwm-submit"
                    style={{ flex:1.4, padding:'12px 0', borderRadius:11, fontSize:13.5, fontWeight:600, cursor:canSubmit?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:`linear-gradient(135deg,${color.from},${color.to})`, transition:'opacity .15s,box-shadow .15s,transform .1s,background .4s' }}>
                    {isLoading ? <><span className="cwm-spin" />Creating…</> : <><Sparkles style={{ width:14, height:14 }} />Create Workspace</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}