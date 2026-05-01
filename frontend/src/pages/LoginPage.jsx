import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import SmartQLogo from '../components/common/SmartQLogo';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/login', form);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-panel-right">
      {/* ── Mini Header ──────────────────────────────────────────────────── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Back to home">
            <SmartQLogo height={56} />
          </Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            Staff & Parishioner Login
          </span>
        </div>
        <Link 
          to="/" 
          className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2 px-6 rounded-md shadow transition text-base"
        >
          ← Back to Home
        </Link>
      </div>

      {/* ── Split Panel ──────────────────────────────────────────────────── */}
      <div className="split-window flex-1">
        {/* LEFT PANEL */}
        <aside className="panel-left animate-slide-in-l">
          <div className="panel-left-header">
            <SmartQLogo height={64} />
            <p className="text-cream-300 text-sm mt-5 text-center leading-relaxed">
              Sacramental Records<br />Request System
            </p>
          </div>

          <div className="mt-6 space-y-1">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">
              Access Portal
            </p>
            <div className="panel-btn active !cursor-default">
              Sign In to Account
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-burgundy-700">
            <p className="text-cream-400 text-xs text-center leading-relaxed">
              Don't have an account?
            </p>
            <Link to="/register">
              <button className="panel-btn mt-3 text-center w-full">Create Account</button>
            </Link>
            <Link to="/kiosk">
              <button className="panel-btn-sub text-center w-full mt-2">Walk-In Kiosk</button>
            </Link>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="panel-right flex items-center justify-center">
          <div className="panel-right-content w-full max-w-xl animate-slide-up">
            <h1 className="right-section-title">Welcome Back</h1>
            <p className="text-gray-600 text-base mb-8 -mt-2">
              Sign in with your SMART Q account credentials.
            </p>

            {error && (
              <div className="alert-error mb-5">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              <div>
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base font-bold"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-cream-200/30 border-t-cream-200 rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-xs mt-6">
              Walk-in customer?{' '}
              <Link to="/kiosk" className="text-burgundy-600 hover:text-burgundy-800 font-medium">
                Use the Kiosk →
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
