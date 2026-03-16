import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { inviteMember } from '../redux/slices/workspaceSlice';
import toast from 'react-hot-toast';
import { X, UserPlus, Mail, Eye, Shield, CheckCircle2 } from 'lucide-react';

/* ─── helpers ───────────────────────────────────────────── */
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function getInitials(email) {
  if (!email || !email.includes('@')) return null;
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function getAvatarColor(email) {
  const palette = [
    ['#6366f1','#4f46e5'], ['#8b5cf6','#7c3aed'],
    ['#ec4899','#db2777'], ['#14b8a6','#0d9488'],
    ['#f59e0b','#d97706'], ['#3b82f6','#2563eb'],
  ];
  let h = 0;
  for (let i = 0; i < email.length; i++) h = email.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

/* ─── component ─────────────────────────────────────────── */
export default function InviteMemberModal({ onClose }) {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((s) => s.workspace);

  const [email, setEmail]           = useState('');
  const [role, setRole]             = useState('member');
  const [isLoading, setIsLoading]   = useState(false);
  const [succeeded, setSucceeded]   = useState(false); // FIX: in-modal success state
  const [emailError, setEmailError] = useState('');    // FIX: inline validation
  const [visible, setVisible]       = useState(false);

  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const titleId  = 'fsm-title';

  /* mount → animate in + auto-focus */
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    setTimeout(() => inputRef.current?.focus(), 250);
  }, []);

  /* FIX: proper exit animation before unmount */
  const handleClose = useCallback(() => {
    if (isLoading) return;
    setVisible(false);
    setTimeout(onClose, 220);
  }, [isLoading, onClose]);

  /* FIX: ESC key closes modal */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !isLoading) handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLoading, handleClose]);

  /* FIX: focus trap — Tab stays inside modal */
  useEffect(() => {
    const trap = (e) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    window.addEventListener('keydown', trap);
    return () => window.removeEventListener('keydown', trap);
  }, []);

  /* FIX: real-time email validation on blur */
  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) setEmailError('Please enter a valid email address.');
    else setEmailError('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(''); // clear error while typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim())       { setEmailError('Email is required.'); return; }
    if (!isValidEmail(email)){ setEmailError('Please enter a valid email address.'); return; }

    setIsLoading(true);
    const result = await dispatch(inviteMember({
      workspaceId: currentWorkspace._id, email, role,
    }));
    setIsLoading(false);

    if (result.type === 'workspace/inviteMember/fulfilled') {
      setSucceeded(true); // FIX: show success state, then close
      toast.success('Member invited successfully!');
      setTimeout(handleClose, 1600);
    } else {
      toast.error(result.payload || 'Failed to invite member');
    }
  };

  /* derived */
  const showAvatar   = email.length > 3 && email.includes('@');
  const avatarColors = showAvatar ? getAvatarColor(email) : null;
  const initials     = getInitials(email);
  const canSubmit    = isValidEmail(email) && !isLoading && !succeeded; // FIX: button disabled until valid

  return (
    <>
      <style>{`
        .fsm-overlay { transition: opacity 0.22s ease; }
        .fsm-card {
          transition: opacity 0.22s cubic-bezier(.22,1,.36,1),
                      transform 0.22s cubic-bezier(.22,1,.36,1);
        }
        /* FIX: separate in/out classes for proper enter AND exit animation */
        .fsm-card.in  { opacity:1!important; transform:scale(1) translateY(0)!important; }
        .fsm-card.out { opacity:0!important; transform:scale(0.96) translateY(10px)!important; }
        .fsm-glow {
          position:absolute; width:320px; height:320px; border-radius:50%;
          background:radial-gradient(circle,rgba(99,102,241,.13) 0%,transparent 70%);
          top:-110px; left:50%; transform:translateX(-50%);
          pointer-events:none; filter:blur(28px);
        }
        .fsm-input {
          transition:border-color .15s,box-shadow .15s,background .15s;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.08);
          color:#f1f5f9;
        }
        .fsm-input::placeholder { color:#334155; }
        .fsm-input:focus {
          outline:none; background:rgba(99,102,241,.06);
          border-color:rgba(99,102,241,.6);
          box-shadow:0 0 0 3px rgba(99,102,241,.18),0 0 18px rgba(99,102,241,.1);
        }
        /* FIX: red error state on input */
        .fsm-input.error {
          border-color:rgba(239,68,68,.6)!important;
          box-shadow:0 0 0 3px rgba(239,68,68,.15)!important;
        }
        .fsm-role {
          cursor:pointer;
          transition:border-color .15s,background .15s,box-shadow .15s,transform .12s;
          border:1px solid rgba(255,255,255,.07);
          background:rgba(255,255,255,.025);
        }
        .fsm-role:hover:not(:disabled) {
          border-color:rgba(139,92,246,.45); background:rgba(99,102,241,.07); transform:translateY(-1px);
        }
        .fsm-role.selected {
          border-color:rgba(139,92,246,.65); background:rgba(99,102,241,.12);
          box-shadow:0 0 0 1px rgba(139,92,246,.3),0 0 18px rgba(99,102,241,.15);
        }
        .fsm-cancel {
          transition:background .15s,border-color .15s,color .15s;
          background:transparent; border:1px solid rgba(255,255,255,.08); color:#64748b;
        }
        .fsm-cancel:hover:not(:disabled) {
          background:rgba(255,255,255,.05); border-color:rgba(255,255,255,.14); color:#94a3b8;
        }
        .fsm-submit {
          background:linear-gradient(135deg,#7c3aed 0%,#6366f1 100%); border:none;
          box-shadow:0 4px 20px rgba(99,102,241,.4),inset 0 1px 0 rgba(255,255,255,.12);
          transition:opacity .15s,box-shadow .15s,transform .1s; color:#fff;
        }
        .fsm-submit:hover:not(:disabled) {
          opacity:.92; box-shadow:0 6px 28px rgba(99,102,241,.55),inset 0 1px 0 rgba(255,255,255,.12);
          transform:translateY(-1px);
        }
        .fsm-submit:active:not(:disabled) { transform:translateY(0); }
        .fsm-submit:disabled { opacity:.35; cursor:not-allowed; }
        .fsm-avatar { transition:opacity .2s,transform .2s; }
        .fsm-avatar.show { opacity:1; transform:scale(1) translateY(-50%); }
        .fsm-avatar.hide { opacity:0; transform:scale(.8) translateY(-50%); }
        .fsm-close {
          transition:background .15s,color .15s;
          background:transparent; border:1px solid rgba(255,255,255,.08); color:#475569; cursor:pointer;
        }
        .fsm-close:hover { background:rgba(255,255,255,.07); color:#94a3b8; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .fsm-spin {
          width:15px; height:15px; border-radius:50%;
          border:2px solid rgba(255,255,255,.25); border-top-color:#fff;
          animation:spin .65s linear infinite; display:inline-block;
        }
        /* FIX: success animation */
        @keyframes successPop {
          0%  { transform:scale(.5); opacity:0; }
          65% { transform:scale(1.15); }
          100%{ transform:scale(1); opacity:1; }
        }
        .fsm-success-icon { animation:successPop .4s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fsm-success-text { animation:fadeSlideIn .3s .25s ease both; }
      `}</style>

      {/* Overlay */}
      <div
        className="fsm-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{
          background:'rgba(3,5,12,.72)',
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
          opacity: visible ? 1 : 0,
        }}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        {/* Gradient border wrapper */}
        <div style={{
          position:'relative', borderRadius:22, padding:1, width:'100%', maxWidth:460,
          background:'linear-gradient(145deg,rgba(139,92,246,.5),rgba(99,102,241,.25) 50%,rgba(255,255,255,.06))',
        }}>
          {/* FIX: .in / .out swap properly on enter and exit */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`fsm-card ${visible ? 'in' : 'out'}`}
            style={{
              borderRadius:21, background:'linear-gradient(160deg,#13161f,#0d1018)',
              overflow:'hidden', position:'relative',
              opacity:0, transform:'scale(.95) translateY(14px)',
            }}
          >
            <div className="fsm-glow" />
            <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(139,92,246,.9) 40%,rgba(99,102,241,.9) 60%,transparent)'}} />

            {/* ── Header ── */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'22px 26px 20px',
              borderBottom:'1px solid rgba(255,255,255,.055)',
            }}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{
                  width:46, height:46, borderRadius:13, flexShrink:0,
                  background:'linear-gradient(135deg,rgba(124,58,237,.3),rgba(99,102,241,.3))',
                  border:'1px solid rgba(139,92,246,.4)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 0 22px rgba(99,102,241,.3),0 4px 12px rgba(0,0,0,.3)',
                }}>
                  <UserPlus style={{width:19,height:19,color:'#a78bfa'}} />
                </div>
                <div>
                  <h2 id={titleId} style={{fontSize:17,fontWeight:700,color:'#f1f5f9',margin:0,letterSpacing:'-.3px'}}>
                    Invite Member
                  </h2>
                  <p style={{fontSize:12.5,color:'#475569',margin:'3px 0 0'}}>
                    Add someone to{' '}
                    <span style={{color:'#94a3b8',fontWeight:600}}>{currentWorkspace?.name}</span>
                  </p>
                </div>
              </div>
              <button
                className="fsm-close"
                onClick={handleClose}
                aria-label="Close dialog"
                style={{width:32,height:32,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'}}
              >
                <X style={{width:14,height:14}} />
              </button>
            </div>

            {/* ── FIX: Success State ── */}
            {succeeded ? (
              <div style={{
                padding:'44px 26px 48px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:16,
              }}>
                <div className="fsm-success-icon" style={{
                  width:62, height:62, borderRadius:'50%',
                  background:'linear-gradient(135deg,rgba(16,185,129,.25),rgba(5,150,105,.15))',
                  border:'1px solid rgba(16,185,129,.4)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 0 28px rgba(16,185,129,.25)',
                }}>
                  <CheckCircle2 style={{width:26,height:26,color:'#34d399'}} />
                </div>
                <div className="fsm-success-text" style={{textAlign:'center'}}>
                  <p style={{fontSize:16,fontWeight:700,color:'#f1f5f9',margin:'0 0 6px',letterSpacing:'-.2px'}}>
                    Invite Sent!
                  </p>
                  <p style={{fontSize:13,color:'#475569',margin:0,lineHeight:1.6}}>
                    <span style={{color:'#64748b',fontWeight:500}}>{email}</span>
                    {' '}will receive an invitation shortly.
                  </p>
                </div>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate style={{padding:'26px 26px 24px'}}>

                {/* Email */}
                <div style={{marginBottom:22}}>
                  <label
                    htmlFor="fsm-email"
                    style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:9}}
                  >
                    Email Address
                  </label>
                  <div style={{position:'relative'}}>
                    <Mail style={{
                      position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
                      width:14, height:14,
                      color: emailError ? '#ef4444' : '#334155',
                      transition:'color .15s', pointerEvents:'none',
                    }} />
                    <input
                      id="fsm-email"
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      placeholder="colleague@example.com"
                      disabled={isLoading}
                      maxLength={120}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? 'fsm-email-error' : undefined}
                      className={`fsm-input${emailError ? ' error' : ''}`}
                      style={{
                        width:'100%', boxSizing:'border-box',
                        paddingLeft:38, paddingRight: showAvatar ? 52 : 14,
                        paddingTop:12, paddingBottom:12,
                        borderRadius:11, fontSize:14,
                      }}
                    />
                    {/* Avatar preview */}
                    <div
                      className={`fsm-avatar ${showAvatar ? 'show' : 'hide'}`}
                      aria-hidden="true"
                      style={{
                        position:'absolute', right:10, top:'50%',
                        width:28, height:28, borderRadius:'50%',
                        background: avatarColors ? `linear-gradient(135deg,${avatarColors[0]},${avatarColors[1]})` : 'transparent',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:10, fontWeight:700, color:'#fff',
                        boxShadow: avatarColors ? `0 0 10px ${avatarColors[0]}60` : 'none',
                        pointerEvents:'none',
                      }}
                    >
                      {initials}
                    </div>
                  </div>
                  {/* FIX: inline error message */}
                  {emailError && (
                    <p id="fsm-email-error" role="alert" style={{
                      fontSize:12, color:'#f87171', margin:'7px 0 0 2px',
                      display:'flex', alignItems:'center', gap:5,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div style={{marginBottom:22}}>
                  <label style={{display:'block',fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:9}}>
                    Role
                  </label>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {[
                      { key:'member', icon:<Eye style={{width:14,height:14}}/>,    label:'Member', desc:'Can view and edit tasks',           accent:'#818cf8' },
                      { key:'admin',  icon:<Shield style={{width:14,height:14}}/>, label:'Admin',  desc:'Can manage members & settings',    accent:'#a78bfa' },
                    ].map(({ key, icon, label, desc, accent }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => !isLoading && setRole(key)}
                        disabled={isLoading}
                        aria-pressed={role === key}
                        className={`fsm-role${role === key ? ' selected' : ''}`}
                        style={{borderRadius:12, padding:'13px 14px', textAlign:'left'}}
                      >
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5,color:role===key ? accent : '#475569'}}>
                          {icon}
                          <span style={{fontSize:13.5,fontWeight:600,color:role===key ? '#c7d2fe' : '#64748b'}}>{label}</span>
                        </div>
                        {/* FIX: was #334155 (invisible on dark bg), now #4f6072 */}
                        <p style={{fontSize:11.5,color:'#4f6072',margin:0,lineHeight:1.4}}>{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div style={{
                  padding:'11px 14px', borderRadius:10,
                  border:'1px solid rgba(255,255,255,.055)',
                  background:'rgba(255,255,255,.02)',
                  marginBottom:22,
                }}>
                  <p style={{fontSize:12.5,color:'#4f6072',margin:0,lineHeight:1.65}}>
                    <span style={{color:'#64748b',fontWeight:600}}>Note: </span>
                    The invited user must already have a FlowSpace account with this email.
                  </p>
                </div>

                {/* Buttons */}
                <div style={{display:'flex',gap:10}}>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="fsm-cancel"
                    style={{flex:1,padding:'12px 0',borderRadius:11,fontSize:13.5,fontWeight:500,cursor:'pointer'}}
                  >
                    Cancel
                  </button>
                  {/* FIX: disabled until email is valid */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="fsm-submit"
                    style={{
                      flex:1.4, padding:'12px 0', borderRadius:11,
                      fontSize:13.5, fontWeight:600,
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    }}
                  >
                    {isLoading
                      ? <><span className="fsm-spin" /> Inviting…</>
                      : <><UserPlus style={{width:14,height:14}} /> Send Invite</>
                    }
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