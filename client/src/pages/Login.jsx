import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Zap, Mail, Lock, ArrowRight, Eye, EyeOff, Sun, Moon,
  Radio, KanbanSquare, BarChart3, ShieldCheck, AlertCircle,
} from 'lucide-react';
import { login, clearError } from '../redux/slices/authSlice';
import { useTheme } from '../hooks/useTheme';

/*
  Login page — built on the app's CSS variables (index.css), so it follows the
  same light / dark theme as the dashboard. The left panel is a fixed brand
  panel (indigo gradient) that looks right in both themes.
*/
const STYLES = `
  .auth-root {
    min-height: 100vh; display: flex;
    background: var(--surface-bg); color: var(--text-primary);
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* ── Brand panel ── */
  .auth-brand {
    flex: 1 1 0; min-width: 0; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 48px 64px; color: #fff;
    background:
      radial-gradient(900px 500px at 85% -10%, rgba(6,182,212,.35), transparent 60%),
      radial-gradient(700px 500px at -10% 110%, rgba(168,85,247,.40), transparent 60%),
      linear-gradient(145deg, #4f46e5 0%, #6366f1 45%, #7c3aed 100%);
  }
  .auth-brand::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 100%);
  }
  .auth-brand > * { position: relative; }

  .auth-logo { display: flex; align-items: center; gap: 11px; }
  .auth-logo-mark {
    width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center;
    background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.28);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  }
  .auth-logo-name {
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800;
    font-size: 19px; letter-spacing: -.03em;
  }

  .auth-headline {
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800;
    font-size: clamp(34px, 4vw, 52px); line-height: 1.08; letter-spacing: -.045em;
    margin: 0 0 16px;
  }
  .auth-headline span { color: #c7d2fe; }
  .auth-sub { font-size: 16px; line-height: 1.7; color: rgba(255,255,255,.78); max-width: 430px; margin: 0 0 32px; }

  .auth-features { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; max-width: 430px; }
  .auth-feature { display: flex; align-items: center; gap: 13px; font-size: 14.5px; color: rgba(255,255,255,.92); }
  .auth-feature-icon {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: grid; place-items: center;
    background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2);
  }

  /* mini board preview */
  .auth-preview {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 430px; margin-top: 36px;
  }
  .auth-preview-col {
    background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.18);
    border-radius: 12px; padding: 10px; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  }
  .auth-preview-title { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.7); margin-bottom: 8px; }
  .auth-preview-card { height: 26px; border-radius: 7px; background: rgba(255,255,255,.88); margin-bottom: 6px; position: relative; }
  .auth-preview-card::after { content: ''; position: absolute; left: 7px; top: 10px; height: 5px; width: 55%; border-radius: 3px; background: rgba(79,70,229,.35); }
  .auth-preview-card.short::after { width: 35%; }
  .auth-preview-card.done { background: rgba(255,255,255,.55); }

  .auth-foot { font-size: 12.5px; color: rgba(255,255,255,.65); }

  /* ── Form panel ── */
  .auth-panel {
    width: 520px; flex-shrink: 0; position: relative;
    display: flex; align-items: center; justify-content: center;
    padding: 40px 48px; background: var(--surface-bg);
  }
  .auth-theme {
    position: absolute; top: 20px; right: 20px;
    width: 38px; height: 38px; border-radius: var(--radius-md); display: grid; place-items: center;
    background: var(--surface-base); border: 1px solid var(--border-default);
    color: var(--text-secondary); cursor: pointer; transition: var(--transition-fast);
  }
  .auth-theme:hover { background: var(--surface-hover); color: var(--text-primary); }

  .auth-card { width: 100%; max-width: 380px; animation: authIn .5s cubic-bezier(.22,1,.36,1) both; }
  @keyframes authIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

  .auth-mobile-logo { display: none; align-items: center; gap: 10px; margin-bottom: 28px; }
  .auth-mobile-logo .auth-logo-mark { background: var(--brand-primary); border: none; }
  .auth-mobile-logo .auth-logo-name { color: var(--text-primary); }

  .auth-title {
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 28px;
    letter-spacing: -.035em; margin: 0 0 6px; color: var(--text-primary);
  }
  .auth-lead { font-size: 14px; color: var(--text-tertiary); margin: 0 0 28px; line-height: 1.5; }

  .auth-form { display: flex; flex-direction: column; gap: 18px; }
  .auth-field { display: flex; flex-direction: column; gap: 7px; }
  .auth-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
  .auth-input-wrap { position: relative; }
  .auth-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--text-tertiary); pointer-events: none; transition: color .15s;
  }
  .auth-input {
    width: 100%; height: 46px; padding: 0 14px 0 40px; font-size: 14px; font-family: inherit;
    color: var(--text-primary); background: var(--surface-base);
    border: 1px solid var(--border-default); border-radius: var(--radius-lg);
    outline: none; transition: border-color .15s, box-shadow .15s;
  }
  .auth-input::placeholder { color: var(--text-tertiary); opacity: .7; }
  .auth-input:hover:not(:disabled) { border-color: var(--border-strong); }
  .auth-input:focus { border-color: var(--brand-primary); box-shadow: 0 0 0 3.5px var(--brand-muted); }
  .auth-input:focus ~ .auth-input-icon,
  .auth-input-wrap:focus-within .auth-input-icon { color: var(--brand-primary); }
  .auth-input[aria-invalid="true"] { border-color: var(--status-high); }
  .auth-input[aria-invalid="true"]:focus { box-shadow: 0 0 0 3.5px var(--status-high-bg); }
  .auth-input:disabled { opacity: .6; cursor: not-allowed; }
  .auth-input.has-toggle { padding-right: 44px; }
  .auth-input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px var(--surface-base) inset !important;
    -webkit-text-fill-color: var(--text-primary) !important;
  }

  .auth-eye {
    position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
    width: 34px; height: 34px; display: grid; place-items: center; border: none; background: transparent;
    color: var(--text-tertiary); cursor: pointer; border-radius: var(--radius-md); transition: var(--transition-fast);
  }
  .auth-eye:hover { color: var(--text-primary); background: var(--surface-hover); }

  .auth-error { display: flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--status-high); margin: 0; }

  .auth-submit {
    height: 48px; margin-top: 4px; border: none; border-radius: var(--radius-lg); cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -.01em; color: #fff;
    background: linear-gradient(135deg, #5b5fef 0%, #7c3aed 100%);
    box-shadow: 0 6px 20px rgba(91,95,239,.35);
    transition: transform .18s, box-shadow .18s, opacity .18s;
  }
  .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(91,95,239,.45); }
  .auth-submit:active:not(:disabled) { transform: scale(.985); }
  .auth-submit:disabled { opacity: .7; cursor: not-allowed; }
  .auth-submit:focus-visible, .auth-theme:focus-visible, .auth-eye:focus-visible, .auth-alt:focus-visible {
    outline: 2px solid var(--brand-primary); outline-offset: 2px;
  }
  .auth-spinner {
    width: 17px; height: 17px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; animation: authSpin .7s linear infinite;
  }
  @keyframes authSpin { to { transform: rotate(360deg); } }

  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 26px 0 18px; font-size: 12.5px; color: var(--text-tertiary); }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-default); }

  .auth-alt {
    height: 46px; display: flex; align-items: center; justify-content: center; text-decoration: none;
    font-size: 14px; font-weight: 600; color: var(--text-primary);
    background: var(--surface-base); border: 1px solid var(--border-default); border-radius: var(--radius-lg);
    transition: var(--transition-fast);
  }
  .auth-alt:hover { border-color: var(--brand-primary); color: var(--brand-primary); background: var(--brand-muted); }

  /* ── Responsive ── */
  @media (max-width: 980px) {
    .auth-brand { display: none; }
    .auth-panel { width: 100%; padding: 40px 24px; }
    .auth-mobile-logo { display: flex; }
  }
  @media (max-width: 400px) {
    .auth-panel { padding: 32px 16px; }
    .auth-title { font-size: 25px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .auth-card, .auth-spinner, .auth-submit { animation: none; transition: none; }
  }
`;

const FEATURES = [
  { icon: Radio,        text: 'Live updates — teammates’ changes appear instantly' },
  { icon: KanbanSquare, text: 'Drag-and-drop Kanban boards with a calendar view' },
  { icon: BarChart3,    text: 'Analytics on progress and team workload' },
  { icon: ShieldCheck,  text: 'Role-based access for owners, admins and members' },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { isLoading, isAuthenticated, error } = useSelector(s => s.auth);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  // Redirect once Redux says we are authenticated (cookie + Redux are the source of truth)
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    const r = await dispatch(login({ email: email.trim(), password }));
    if (r.type?.includes('fulfilled')) toast.success('Welcome back!');
  };

  const clearFieldError = field => setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-root">

        {/* ── Brand panel ── */}
        <div className="auth-brand" aria-hidden="true">
          <div className="auth-logo">
            <div className="auth-logo-mark"><Zap size={19} color="#fff" strokeWidth={2.5} /></div>
            <span className="auth-logo-name">FlowSpace</span>
          </div>

          <div>
            <h2 className="auth-headline">Where teams<br /><span>ship together.</span></h2>
            <p className="auth-sub">
              Plan work on a shared board, see changes the moment they happen, and keep everyone on the same page.
            </p>
            <ul className="auth-features">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="auth-feature">
                  <span className="auth-feature-icon"><Icon size={16} strokeWidth={2.2} /></span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="auth-preview">
              {[
                { t: 'To do',       cards: ['', 'short'] },
                { t: 'In progress', cards: ['short', ''] },
                { t: 'Done',        cards: ['done', 'done short'] },
              ].map(col => (
                <div key={col.t} className="auth-preview-col">
                  <div className="auth-preview-title">{col.t}</div>
                  {col.cards.map((c, i) => <div key={i} className={`auth-preview-card ${c}`} />)}
                </div>
              ))}
            </div>
          </div>

          <div className="auth-foot">Real-time collaboration for modern teams</div>
        </div>

        {/* ── Form panel ── */}
        <main className="auth-panel">
          <button
            type="button" className="auth-theme" onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="auth-card">
            <div className="auth-mobile-logo">
              <div className="auth-logo-mark"><Zap size={19} color="#fff" strokeWidth={2.5} /></div>
              <span className="auth-logo-name">FlowSpace</span>
            </div>

            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-lead">Sign in to continue to your workspaces.</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">Email</label>
                <div className="auth-input-wrap">
                  <input
                    id="login-email" className="auth-input" type="email" name="email"
                    autoComplete="email" placeholder="you@example.com"
                    value={email} disabled={isLoading}
                    onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'login-email-err' : undefined}
                  />
                  <Mail size={16} className="auth-input-icon" />
                </div>
                {errors.email && (
                  <p id="login-email-err" className="auth-error" role="alert">
                    <AlertCircle size={13} />{errors.email}
                  </p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="login-password" className="auth-input has-toggle" name="password"
                    type={showPass ? 'text' : 'password'} autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password} disabled={isLoading}
                    onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'login-password-err' : undefined}
                  />
                  <Lock size={16} className="auth-input-icon" />
                  <button
                    type="button" className="auth-eye" onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="login-password-err" className="auth-error" role="alert">
                    <AlertCircle size={13} />{errors.password}
                  </p>
                )}
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading
                  ? <><span className="auth-spinner" />Signing in…</>
                  : <>Sign in<ArrowRight size={17} strokeWidth={2.5} /></>}
              </button>
            </form>

            <div className="auth-divider">New to FlowSpace?</div>
            <Link to="/signup" className="auth-alt">Create an account</Link>
          </div>
        </main>
      </div>
    </>
  );
}
