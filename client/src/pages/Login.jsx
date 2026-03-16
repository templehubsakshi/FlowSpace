import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

const STYLES = `
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes auroraA {
    0%,100% { transform:translate(0,0) scale(1) rotate(0deg); }
    25%  { transform:translate(5%,-7%) scale(1.1) rotate(5deg); }
    50%  { transform:translate(-3%,5%) scale(.93) rotate(-3deg); }
    75%  { transform:translate(7%,3%) scale(1.07) rotate(9deg); }
  }
  @keyframes auroraB {
    0%,100% { transform:translate(0,0) scale(1); }
    33%  { transform:translate(-7%,5%) scale(1.13); }
    66%  { transform:translate(5%,-7%) scale(.91); }
  }
  @keyframes auroraC {
    0%,100% { transform:translate(0,0); }
    50%  { transform:translate(-4%,-5%); }
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(28px) scale(.96); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes leftIn {
    from { opacity:0; transform:translateX(-28px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes fieldIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { transform:translateX(-100%) skewX(-12deg); }
    100% { transform:translateX(300%) skewX(-12deg); }
  }
  @keyframes floatItem {
    0%,100% { transform:translateY(0px); }
    50%      { transform:translateY(-8px); }
  }
  @keyframes statCount {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gradText {
    0%,100% { background-position:0% 50%; }
    50%      { background-position:100% 50%; }
  }
  @keyframes badgeIn {
    from { opacity:0; transform:translateX(-16px); }
    to   { opacity:1; transform:translateX(0); }
  }

  .aurora-a { animation:auroraA 18s ease-in-out infinite; }
  .aurora-b { animation:auroraB 24s ease-in-out infinite; }
  .aurora-c { animation:auroraC 16s ease-in-out infinite 3s; }
  .card-in  { animation:cardIn .7s cubic-bezier(.22,1,.36,1) both; }
  .left-in  { animation:leftIn .7s cubic-bezier(.22,1,.36,1) both; }
  .field-in { animation:fieldIn .3s ease both; }
  .spin-el  { animation:spin .72s linear infinite; }

  .stat-0 { animation:statCount .5s ease .3s both; }
  .stat-1 { animation:statCount .5s ease .45s both; }
  .stat-2 { animation:statCount .5s ease .60s both; }
  .b0 { animation:badgeIn .5s cubic-bezier(.22,1,.36,1) .2s both; }
  .b1 { animation:badgeIn .5s cubic-bezier(.22,1,.36,1) .35s both; }
  .b2 { animation:badgeIn .5s cubic-bezier(.22,1,.36,1) .50s both; }
  .float0 { animation:floatItem 6s ease-in-out infinite; }
  .float1 { animation:floatItem 7s ease-in-out infinite 1.5s; }
  .float2 { animation:floatItem 5s ease-in-out infinite 0.8s; }

  .grad-text {
    background:linear-gradient(125deg,#a5b4fc,#f0abfc,#67e8f9,#a5b4fc);
    background-size:300% 300%;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    animation:gradText 6s ease infinite;
  }
  .cta-btn { position:relative; overflow:hidden; transition:all .22s cubic-bezier(.22,1,.36,1); }
  .cta-btn::after {
    content:''; position:absolute; top:0; left:0; width:30%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
    transform:translateX(-100%) skewX(-12deg);
  }
  .cta-btn:hover::after { animation:shimmer .6s ease forwards; }
  .cta-btn:not(:disabled):hover  { transform:translateY(-2px) scale(1.013); }
  .cta-btn:not(:disabled):active { transform:scale(.98) !important; }
  .feat-card { transition:all .2s cubic-bezier(.22,1,.36,1); }
  .feat-card:hover { transform:translateY(-3px) scale(1.02); }
  input::placeholder { color:rgba(255,255,255,.16) !important; }
  input:-webkit-autofill,input:-webkit-autofill:focus {
    -webkit-box-shadow:0 0 0 1000px #0c0e1e inset !important;
    -webkit-text-fill-color:#e2e8f0 !important; caret-color:#818cf8;
  }
  *,*::before,*::after { box-sizing:border-box; }
`;

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focus,    setFocus]    = useState('');
  const [mouse,    setMouse]    = useState({ x: .5, y: .5 });
  const cardRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, error } = useSelector(s => s.auth);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('token')) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleMouseMove = e => {
    setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) { toast.error('Fill all fields'); return; }
    const r = await dispatch(login({ email, password }));
    if (r.type?.includes('fulfilled')) toast.success('Welcome back!');
  };

  const tiltX = (mouse.y - .5) * 8;
  const tiltY = (mouse.x - .5) * -8;
  const spotX = mouse.x * 100;
  const spotY = mouse.y * 100;

  const inp = id => ({
    width: '100%', padding: '12px 14px 12px 44px',
    background: focus === id ? 'rgba(99,102,241,.09)' : 'rgba(255,255,255,.04)',
    border: `1.5px solid ${focus === id ? 'rgba(99,102,241,.65)' : 'rgba(255,255,255,.08)'}`,
    borderRadius: 11, fontSize: 14, color: '#e2e8f0',
    outline: 'none', fontFamily: "'Inter',sans-serif", letterSpacing: '-.01em',
    transition: 'all .18s',
    boxShadow: focus === id ? '0 0 0 3.5px rgba(99,102,241,.12)' : 'none',
    caretColor: '#818cf8',
  });
  const ist = id => ({
    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
    pointerEvents: 'none', transition: 'color .15s',
    color: focus === id ? '#818cf8' : 'rgba(255,255,255,.22)',
  });

  const STATS = [
    { value: '50K+',  label: 'Teams worldwide'   },
    { value: '4.9★',  label: 'Average rating'    },
    { value: '99.9%', label: 'Uptime guaranteed' },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div onMouseMove={handleMouseMove} style={{
        minHeight: '100vh', width: '100vw',
        display: 'flex', fontFamily: "'Inter',sans-serif",
        overflow: 'hidden', position: 'relative', background: '#070810',
      }}>

        {/* ══ AURORA BACKGROUND ══ */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div className="aurora-a" style={{
            position: 'absolute', top: '-30%', left: '-20%', width: '100%', height: '100%',
            background: 'conic-gradient(from 200deg at 38% 55%, rgba(99,102,241,.32) 0deg, rgba(168,85,247,.24) 70deg, rgba(6,182,212,.12) 130deg, transparent 200deg)',
            filter: 'blur(60px)', borderRadius: '50%',
          }}/>
          <div className="aurora-b" style={{
            position: 'absolute', bottom: '-30%', right: '-20%', width: '100%', height: '100%',
            background: 'conic-gradient(from 20deg at 62% 45%, rgba(168,85,247,.26) 0deg, rgba(236,72,153,.15) 80deg, rgba(99,102,241,.2) 150deg, transparent 220deg)',
            filter: 'blur(65px)', borderRadius: '50%',
          }}/>
          <div className="aurora-c" style={{
            position: 'absolute', top: '-5%', right: '0', width: '55%', height: '65%',
            background: 'radial-gradient(ellipse at 70% 30%, rgba(6,182,212,.16) 0%, rgba(99,102,241,.07) 50%, transparent 70%)',
            filter: 'blur(45px)',
          }}/>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 40% 40% at ${spotX}% ${spotY}%, rgba(99,102,241,.07) 0%, transparent 70%)`,
            transition: 'background .1s ease',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,.6) 100%)',
          }}/>
        </div>

        {/* ══ LEFT PANEL ══ */}
        <div className="auth-left-panel left-in" style={{
          flex: '1 1 0', minWidth: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '64px 80px',
          position: 'relative', zIndex: 1,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 56 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 0 32px rgba(99,102,241,.9),0 0 0 1px rgba(255,255,255,.16) inset',
            }}>
              <Zap size={21} color="white" strokeWidth={2.5}/>
            </div>
            <span style={{
              fontWeight: 800, fontSize: 20, letterSpacing: '-.04em',
              background: 'linear-gradient(135deg,#e0e7ff,#f5d0fe)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>FlowSpace</span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h2 style={{
              fontSize: 62, fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-.055em', margin: '0 0 4px',
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              color: '#f8fafc', textShadow: '0 0 80px rgba(99,102,241,.25)',
            }}>Where teams</h2>
            <h2 className="grad-text" style={{
              fontSize: 62, fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-.055em', margin: 0,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>ship together.</h2>
          </div>

          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,.35)',
            lineHeight: 1.8, letterSpacing: '-.015em',
            maxWidth: 400, marginBottom: 44,
          }}>
            Real-time kanban boards, live collaboration, and powerful analytics — all in one beautiful workspace.
          </p>

          {/* Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 44, maxWidth: 440 }}>
            {[
              { emoji: '⚡', title: 'Real-time sync',      desc: 'Changes appear instantly',    color: '#818cf8', cl: 'b0 float0' },
              { emoji: '🔒', title: 'Bank-level security', desc: 'Your data is always safe',    color: '#10b981', cl: 'b1 float1' },
              { emoji: '👥', title: 'Team collaboration',  desc: 'Work together seamlessly',    color: '#f59e0b', cl: 'b2 float2' },
              { emoji: '📊', title: 'Smart analytics',     desc: 'Track progress in real-time', color: '#f472b6', cl: 'b0'        },
            ].map(({ emoji, title, desc, color, cl }) => (
              <div key={title} className={`feat-card ${cl}`} style={{
                padding: '16px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                cursor: 'default', boxShadow: '0 4px 20px rgba(0,0,0,.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = `${color}12`;
                e.currentTarget.style.borderColor = `${color}35`;
                e.currentTarget.style.boxShadow   = `0 8px 32px rgba(0,0,0,.4), 0 0 20px ${color}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(255,255,255,.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)';
                e.currentTarget.style.boxShadow   = '0 4px 20px rgba(0,0,0,.3)';
              }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)', letterSpacing: '-.01em', marginBottom: 3, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.3)', letterSpacing: '-.01em' }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.07)' }}>
            {STATS.map(({ value, label }, i) => (
              <div key={label} className={`stat-${i}`} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{
                  fontSize: 22, fontWeight: 800, letterSpacing: '-.04em',
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  background: 'linear-gradient(135deg,#e0e7ff,#c4b5fd)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{value}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', letterSpacing: '-.01em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="auth-right-panel" style={{
          width: 500, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 44px', position: 'relative', zIndex: 1,
          background: 'rgba(7,8,18,.8)',
          borderLeft: '1px solid rgba(255,255,255,.055)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 200, height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(99,102,241,.9),transparent)',
          }}/>
          <div style={{
            position: 'absolute', top: -120, right: -120, width: 320, height: 320,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle,rgba(168,85,247,.12) 0%,transparent 65%)',
          }}/>
          <div style={{
            position: 'absolute', bottom: -80, left: -80, width: 250, height: 250,
            borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 65%)',
          }}/>

          {/* 3D Card */}
          <div className="card-in" ref={cardRef} style={{
            width: '100%', maxWidth: 390,
            transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transition: 'transform .12s ease',
            transformStyle: 'preserve-3d',
          }}>
            <div style={{
              position: 'relative', borderRadius: 22, overflow: 'hidden',
              background: 'linear-gradient(150deg,rgba(255,255,255,.075) 0%,rgba(255,255,255,.022) 55%,rgba(99,102,241,.03) 100%)',
              border: '1px solid rgba(255,255,255,.11)',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,.06) inset,
                0 2px 0 rgba(255,255,255,.13) inset,
                0 70px 140px rgba(0,0,0,.85),
                0 28px 56px rgba(0,0,0,.55),
                0 0 60px rgba(99,102,241,.10)
              `,
              backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)',
              }}/>
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(circle 200px at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(99,102,241,.08) 0%, transparent 60%)`,
                transition: 'background .05s',
              }}/>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(168,85,247,.28) 0%,transparent 68%)' }}/>

              <div style={{ padding: '36px 34px 32px', position: 'relative' }}>

                <div style={{ marginBottom: 24 }}>
                  <h1 style={{
                    fontSize: 26, fontWeight: 800, letterSpacing: '-.04em',
                    marginBottom: 6, lineHeight: 1.15, color: '#f1f5f9',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}>
                    Welcome back 👋
                  </h1>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.28)', letterSpacing: '-.01em', lineHeight: 1.5 }}>
                    Sign in to continue building with FlowSpace
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

                  <div className="field-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,.22)' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={ist('email')}/>
                      <input
                        type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocus('email')} onBlur={() => setFocus('')}
                        placeholder="you@example.com" disabled={isLoading}
                        style={{ ...inp('email'), opacity: isLoading ? .5 : 1 }}
                      />
                    </div>
                  </div>

                  <div className="field-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,.22)' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} style={ist('password')}/>
                      <input
                        type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocus('password')} onBlur={() => setFocus('')}
                        placeholder="••••••••" disabled={isLoading}
                        style={{ ...inp('password'), paddingRight: 44, opacity: isLoading ? .5 : 1 }}
                      />
                      <button
                        type="button" onClick={() => setShowPass(v => !v)}
                        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.22)', display: 'flex', padding: 2, transition: 'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.55)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.22)'}
                      >
                        {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="cta-btn" style={{
                    marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    padding: '13px 20px', borderRadius: 12, width: '100%',
                    background: isLoading ? 'rgba(99,102,241,.3)' : 'linear-gradient(135deg,#5b5fef 0%,#7c3aed 100%)',
                    border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                    color: 'white', fontSize: 14.5, fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-.02em',
                    boxShadow: '0 6px 30px rgba(91,95,239,.55),0 0 0 1px rgba(255,255,255,.1) inset',
                  }}>
                    {isLoading
                      ? <><div className="spin-el" style={{ width: 16, height: 16, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.2)', borderTopColor: 'white', flexShrink: 0 }}/>Signing in…</>
                      : <>Sign In<ArrowRight size={16} strokeWidth={2.5}/></>
                    }
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }}/>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', fontWeight: 500 }}>Don't have an account?</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }}/>
                </div>

                {/* Signup link */}
                <Link to="/signup" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '11px 20px', borderRadius: 12, width: '100%',
                  background: 'rgba(255,255,255,.04)',
                  border: '1.5px solid rgba(255,255,255,.08)',
                  color: 'rgba(255,255,255,.5)', fontSize: 14, fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-.01em',
                  textDecoration: 'none', transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = 'rgba(99,102,241,.1)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,.4)';
                  e.currentTarget.style.color       = '#a5b4fc';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = 'rgba(255,255,255,.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)';
                  e.currentTarget.style.color       = 'rgba(255,255,255,.5)';
                }}
                >
                  <Sparkles size={15} strokeWidth={2}/>
                  Create new account
                </Link>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: 'rgba(255,255,255,.1)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  Secure · Private · No spam
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}