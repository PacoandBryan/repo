import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import FallingYarn from '../../components/FallingYarn';
import '../../styles/CherryBlossomTheme.css';

const FlaskLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { login } = useAdmin();
  const navigate = useNavigate();

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
    } catch (e) { }
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
    } catch (e) { }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        playSuccessSound();
        setTimeout(() => navigate('/admin/dashboard'), 500);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#fff0f6] to-[#ffe3ee] font-sans">
      <FallingYarn />

      <div
        ref={cardRef}
        className="cherry-card z-10 w-full max-w-md mx-4 transform transition-all duration-700 hover:rotate-1"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-white/50 backdrop-blur-md mb-4 shadow-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[#ff6b9a]">
              <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-[#3d2a2a] mb-2">Diky Admin</h1>
          <p className="text-[#8c6a6a]">Enter your credentials to manage the cherry garden</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="cherry-input w-full"
              placeholder="luz_admin"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3d2a2a] mb-2 uppercase tracking-tighter" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="cherry-input w-full"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 animate-bounce">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <p className="text-red-600 text-sm font-medium">Incorrect credentials, Luz. Try again!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cherry-btn w-full flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#ffc2d1]/30 text-center text-xs text-[#8c6a6a]">
          <p>© 2025 Diky.mx • Secure Session</p>
        </div>
      </div>

      {/* Visual Accents */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#ffb7c5]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#ff9ecf]/20 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default FlaskLoginPage;
