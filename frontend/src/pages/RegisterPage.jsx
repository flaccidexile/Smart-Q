import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';
import SmartQLogo from '../components/common/SmartQLogo';

export default function RegisterPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
      });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
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
            New Account Registration
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

          <div className="mt-6">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">
              Registration Steps
            </p>
            {['Personal Information', 'Set Password', 'Create Account'].map((s, i) => (
              <div key={s} className="panel-btn-sub flex items-center gap-3 py-2.5">
                <span className="w-6 h-6 rounded-full bg-burgundy-700 text-cream-200 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {s}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t border-burgundy-700">
            <p className="text-cream-400 text-xs text-center">Already registered?</p>
            <Link to="/login">
              <button className="panel-btn mt-3 text-center w-full">Sign In</button>
            </Link>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="panel-right flex items-center justify-center">
          <div className="panel-right-content w-full max-w-xl animate-slide-up">
            <h1 className="right-section-title">Create Account</h1>
            <p className="text-gray-600 text-base mb-8 -mt-2">
              Join SMART Q to request sacramental records online.
            </p>

            {error && <div className="alert-error mb-5">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
              <div>
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input id="reg-name" name="name" type="text" required value={form.name}
                  onChange={handleChange} className="form-input" placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input id="reg-email" name="email" type="email" required value={form.email}
                  onChange={handleChange} className="form-input" placeholder="you@email.com" />
              </div>
              <div>
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="relative">
                  <input id="reg-password" name="password" type={showPassword ? "text" : "password"} required value={form.password}
                    onChange={handleChange} className="form-input pr-10" placeholder="Min. 6 characters" />
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
              <div>
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <div className="relative">
                  <input id="reg-confirm" name="confirm" type={showConfirmPassword ? "text" : "password"} required value={form.confirm}
                    onChange={handleChange} className="form-input pr-10" placeholder="Repeat your password" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
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

              <button type="submit" id="register-submit" disabled={loading}
                className="btn-primary w-full py-3.5 text-base mt-4 font-bold">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-cream-200/30 border-t-cream-200 rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
