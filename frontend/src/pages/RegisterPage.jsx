import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
              <span className="text-navy-900 font-bold text-xl font-display">SQ</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Create Account</h1>
            <p className="text-slate-400 text-sm mt-1">Join SMART Q to request records online</p>
          </div>

          <div className="card">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
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

              <button type="submit" id="register-submit" disabled={loading} className="btn-primary w-full text-base">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
