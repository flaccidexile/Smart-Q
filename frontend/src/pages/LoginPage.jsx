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
  const [showPassword, setShowPassword] = useState(false);

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
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="form-input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
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
