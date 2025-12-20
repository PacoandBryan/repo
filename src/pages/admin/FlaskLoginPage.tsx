import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

const FlaskLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const { login } = useAdmin();
  const navigate = useNavigate();

  // Fancy pointer glow effect
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!cardRef.current || !glowRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      
      glowRef.current.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      glowRef.current.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    };

    document.addEventListener('pointermove', handlePointerMove);
    return () => document.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Audio feedback functions from Flask template
  const playErrorSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(220, ctx.currentTime);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 280);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(540, ctx.currentTime);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
      o.connect(g).connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 260);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        playSuccessSound();
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        playErrorSound();
        setError(true);
      }
    } catch (err) {
      playErrorSound();
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --bg: #0f172a; /* slate-900 */
            --card: #111827ee; /* gray-900 */
            --text: #e5e7eb; /* gray-200 */
            --muted: #9ca3af; /* gray-400 */
            --primary: #7c3aed; /* violet-600 */
            --primary-2: #22d3ee; /* cyan-400 */
            --danger: #ef4444; /* red-500 */
            --success: #22c55e; /* green-500 */
          }

          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
            background: radial-gradient(1250px 650px at 10% -10%, rgba(124,58,237,.35), transparent 60%),
                        radial-gradient(1250px 650px at 110% 110%, rgba(34,211,238,.28), transparent 60%),
                        var(--bg) !important;
            color: var(--text) !important;
          }

          /* Force dark theme override */
          * {
            box-sizing: border-box;
          }
          
          /* Ensure container takes full viewport */
          .container, #scene {
            min-height: 100vh !important;
            width: 100vw !important;
            background: transparent !important;
            display: grid !important;
            place-items: center !important;
            padding: 24px !important;
          }

          .card {
            position: relative;
            width: min(420px, 92vw);
            padding: 28px 28px 32px;
            border-radius: 16px;
            background: linear-gradient(180deg, #0b1221, #0b1221) padding-box,
                        linear-gradient(120deg, rgba(124,58,237,.8), rgba(34,211,238,.8)) border-box;
            border: 2px solid transparent;
            box-shadow: 0 20px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04);
            overflow: hidden;
            transform: translateZ(0);
            animation: cardIn .6s cubic-bezier(.2,.8,.2,1);
            margin: 20px;
          }

          .glow {
            position: absolute; inset: -2px;
            background: radial-gradient(150px 80px at var(--mx,50%) var(--my,50%), rgba(124,58,237,.18), transparent 60%),
                        radial-gradient(150px 80px at calc(100% - var(--mx,50%)) calc(100% - var(--my,50%)), rgba(34,211,238,.15), transparent 60%);
            filter: blur(20px);
            pointer-events: none;
          }

          .title {
            display: flex; align-items: center; gap: 10px;
            font-weight: 700; letter-spacing: .2px;
          }
          .title .badge { font-size: 12px; color: var(--muted); font-weight: 500; }

          .field {
            margin-top: 18px;
            display: grid; gap: 8px;
          }
          .field + .field { margin-top: 16px; }
          label { font-size: 13px; color: var(--muted); }
          input[type="text"], input[type="password"] {
            width: 80%;
            padding: 12px 14px;
            border-radius: 10px;
            outline: none;
            border: 1px solid #1f2937;
            background: #0b1221;
            color: var(--text);
            transition: border .2s, box-shadow .2s, transform .08s;
            text-align: center;
            margin: 0 auto;
          }
          input:focus {
            border-color: rgba(124,58,237,.7);
            box-shadow: 0 0 0 4px rgba(124,58,237,.18);
          }

          .actions { margin-top: 22px; display: grid; gap: 10px; }
          .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 10px;
            padding: 12px 16px;
            border-radius: 10px;
            border: none; cursor: pointer;
            color: white; font-weight: 700; letter-spacing: .2px;
            background: linear-gradient(135deg, var(--primary), var(--primary-2));
            box-shadow: 0 10px 30px rgba(124,58,237,.35), 0 6px 14px rgba(34,211,238,.2);
            transition: transform .08s ease, box-shadow .2s ease, filter .2s;
          }
          .btn:hover { filter: brightness(1.08); }
          .btn:active { transform: translateY(1px); }
          .btn:disabled { filter: brightness(0.9); cursor: not-allowed; }

          .error-panel {
            margin-top: 14px;
            display: grid; grid-template-columns: 24px 1fr; gap: 10px; align-items: start;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid rgba(239,68,68,.35);
            background: linear-gradient(180deg, rgba(239,68,68,.08), rgba(239,68,68,.06));
            color: #fecaca;
            animation: shake .6s cubic-bezier(.36,.07,.19,.97) both;
          }

          .error-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--danger); box-shadow: 0 0 30px rgba(239,68,68,.6);
            animation: pulse 1.8s infinite ease-in-out; }

          .subtle { color: var(--muted); font-size: 12px; }

          .footer { margin-top: 18px; display: flex; justify-content: space-between; align-items: center; }

          @keyframes cardIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes pulse { 0%,100%{ transform: scale(1); opacity: .85 } 50%{ transform: scale(1.25); opacity: 1 } }
          @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
          }
        `
      }} />
      
      <div className="container" id="scene">
        <form className="card" ref={formRef} onSubmit={handleSubmit} data-error={error ? '1' : '0'}>
          <div className="glow" ref={glowRef}></div>
          <div className="title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="g1" x1="0" x2="24" y1="0" y2="24">
                  <stop offset="0%" stopColor="var(--primary)"/>
                  <stop offset="100%" stopColor="var(--primary-2)"/>
                </linearGradient>
              </defs>
              <path d="M12 3l8 4v5c0 5-3.43 9.74-8 11-4.57-1.26-8-6-8-11V7l8-4z" stroke="url(#g1)" strokeWidth="2"/>
            </svg>
            <div>
              <div>Diky Admin</div>
              <div className="badge">Secure Sign In</div>
            </div>
          </div>

          {error && (
            <div className="error-panel" id="errorPanel">
              <div className="error-dot"></div>
              <div>
                <strong>Incorrect credentials</strong>
                <div className="subtle">Please double‑check your username and password.</div>
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="username">Username</label>
            <input 
              id="username" 
              name="username" 
              type="text" 
              placeholder="admin" 
              autoComplete="username" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              autoComplete="current-password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="white" strokeWidth="2"/>
              </svg>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>

          <div className="footer">
            <div className="subtle">© Diky.mx</div>
            <div className="subtle">Secure session</div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FlaskLoginPage;
