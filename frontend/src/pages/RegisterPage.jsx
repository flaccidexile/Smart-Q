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
                <input id="reg-password" name="password" type="password" required value={form.password}
                  onChange={handleChange} className="form-input" placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <input id="reg-confirm" name="confirm" type="password" required value={form.confirm}
                  onChange={handleChange} className="form-input" placeholder="Repeat your password" />
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
