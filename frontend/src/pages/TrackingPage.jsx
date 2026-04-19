import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/common/Navbar';
import StatusBadge from '../components/admin/StatusBadge';

const PROGRESS_STEPS = ['Pending', 'Processing', 'Approved', 'Released'];

export default function TrackingPage() {
  const [requestId, setRequestId] = useState('');
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!requestId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await axiosInstance.get(`/requests/track/${requestId.trim()}`);
      setResult(data.request);
    } catch (err) {
      setError(err.response?.data?.message || 'Request not found. Please check the ID and try again.');
    } finally { setLoading(false); }
  };

  const currentStepIndex = result ? PROGRESS_STEPS.indexOf(result.status) : -1;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Track Your Request</h1>
          <p className="text-slate-400">Enter your Request ID to check the current status of your certificate.</p>
        </div>

        {/* Search Box */}
        <div className="card mb-6">
          <form onSubmit={handleTrack} className="flex gap-3" id="track-form">
            <input
              id="track-input"
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              className="form-input flex-1"
              placeholder="Enter Request ID (e.g., 42)"
            />
            <button id="track-submit" type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? '...' : '🔍 Track'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="card animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm">Request #{result.id}</p>
                <h2 className="font-display text-xl font-bold text-white mt-0.5">{result.fullName}</h2>
                <p className="text-slate-400 text-sm mt-1">{result.certificateType} Certificate</p>
              </div>
              <StatusBadge status={result.status} />
            </div>

            {/* Progress Bar */}
            {result.status !== 'Rejected' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  {PROGRESS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${i <= currentStepIndex
                          ? 'bg-brand-500 border-brand-500 shadow-lg shadow-brand-500/30'
                          : 'bg-slate-800 border-slate-700'}`}>
                        {i < currentStepIndex
                          ? <svg className="w-4 h-4 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          : <span className={`text-xs font-bold ${i <= currentStepIndex ? 'text-navy-900' : 'text-slate-500'}`}>{i + 1}</span>}
                      </div>
                      <p className={`text-xs mt-2 text-center ${i <= currentStepIndex ? 'text-brand-400 font-medium' : 'text-slate-600'}`}>{s}</p>
                      {i < PROGRESS_STEPS.length - 1 && (
                        <div className={`absolute mt-4 h-0.5 w-full transition-colors duration-500 hidden`} />
                      )}
                    </div>
                  ))}
                </div>
                {/* Connector line */}
                <div className="relative mt-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div
                        className="bg-brand-500 h-1 rounded-full transition-all duration-700"
                        style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (PROGRESS_STEPS.length - 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result.status === 'Rejected' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
                ❌ This request has been rejected. Please visit the parish office for more information.
              </div>
            )}

            <div className="section-divider" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Submitted</p>
                <p className="text-slate-200 mt-0.5">{new Date(result.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Last Updated</p>
                <p className="text-slate-200 mt-0.5">{new Date(result.updatedAt).toLocaleDateString()}</p>
              </div>
              {result.appointmentDate && (
                <div>
                  <p className="text-slate-500">Appointment</p>
                  <p className="text-slate-200 mt-0.5">{result.appointmentDate} {result.appointmentTime || ''}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Need to submit a new request?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
