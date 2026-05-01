import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import SmartQLogo from '../components/common/SmartQLogo';
import StatusBadge from '../components/admin/StatusBadge';
import useAuth from '../hooks/useAuth';

const PROGRESS_STEPS = ['Pending', 'Processing', 'Approved', 'Released'];

export default function TrackingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen flex flex-col">
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" aria-label="Back to dashboard">
            <SmartQLogo height={56} />
          </Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            TRACK REQUEST
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-cream-200 font-bold text-sm leading-tight">{user?.name || 'System Administrator'}</p>
            <p className="text-cream-400 text-xs">{user?.role === 'admin' ? 'Administrator' : 'Admin Portal'}</p>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2 px-6 rounded-md shadow transition text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="split-window flex-1">
        {/* LEFT PANEL */}
        <aside className="panel-left">
          <div className="panel-left-header">
            <div className="w-20 h-20 rounded-full bg-burgundy-700/50 border-2 border-cream-400/30
                            flex items-center justify-center text-4xl shadow-md">
              🔍
            </div>
            <p className="text-cream-200 font-head font-semibold text-lg mt-4 uppercase tracking-wide">
              Track Request
            </p>
            <p className="text-cream-400 text-sm mt-2 text-center leading-relaxed font-medium">
              Enter your Request ID to check the current status.
            </p>
          </div>

          {/* Admin Navigation */}
          <div className="space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">Navigation</p>
            <Link to="/admin" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📊 Dashboard</button>
            </Link>
            <Link to="/admin/requests" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📋 Verify Requests</button>
            </Link>
            <Link to="/admin/mass-intentions" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>✝ Mass Intentions</button>
            </Link>
            <Link to="/admin/calendar" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📅 Manage Calendar</button>
            </Link>
            <Link to="/admin/reports" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📈 System Reports</button>
            </Link>
            <Link to="/track" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500" style={{ fontSize: '15px', padding: '14px 18px' }}>🔍 Track ID</button>
            </Link>
          </div>

          <div className="mt-auto pt-8 border-t border-burgundy-700 space-y-3">
            <button onClick={() => { logout(); navigate('/login'); }} className="panel-btn mt-3 text-center w-full">Sign Out</button>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="panel-right flex items-center justify-center">
          <div className="panel-right-content w-full max-w-4xl animate-slide-up">
            <h1 className="right-section-title text-3xl mb-8">Track Your Request</h1>

            {/* Search Box */}
            <form onSubmit={handleTrack} className="flex gap-4 mb-8" id="track-form">
              <input
                id="track-input"
                type="text"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="form-input flex-1 shadow-sm"
                style={{ fontSize: '18px', padding: '18px 24px' }}
                placeholder="Enter Request ID (e.g., 42)"
              />
              <button id="track-submit" type="submit" disabled={loading} className="btn-primary whitespace-nowrap shadow-md"
                      style={{ fontSize: '18px', padding: '18px 40px' }}>
                {loading ? '...' : '🔍 Track'}
              </button>
            </form>

            {error && <div className="alert-error mb-8 text-base p-4">{error}</div>}

            {result && (
              <div className="card animate-slide-up p-10 shadow-lg">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Request #{result.id}</p>
                    <h2 className="font-head text-3xl font-bold text-burgundy-800">{result.fullName}</h2>
                    <p className="text-gray-500 text-lg mt-2">{result.certificateType} Certificate</p>
                  </div>
                  <div className="scale-125 origin-top-right">
                    <StatusBadge status={result.status} />
                  </div>
                </div>

                {/* Progress Bar */}
                {result.status !== 'Rejected' && (
                  <div className="mb-10">
                    <div className="flex items-end justify-between mb-4">
                      {PROGRESS_STEPS.map((s, i) => (
                        <div key={s} className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 relative
                            ${i <= currentStepIndex
                              ? 'bg-burgundy-700 border-burgundy-600 shadow-md'
                              : 'bg-cream-100 border-cream-400'}`}>
                            {i < currentStepIndex
                              ? <svg className="w-6 h-6 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              : <span className={`text-base font-bold ${i <= currentStepIndex ? 'text-cream-100' : 'text-gray-400'}`}>
                                  {i + 1}
                                </span>}
                          </div>
                          <p className={`text-sm mt-3 text-center ${i <= currentStepIndex ? 'text-burgundy-700 font-bold' : 'text-gray-400 font-medium'}`}>
                            {s}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Connector */}
                    <div className="relative h-2 bg-cream-200 rounded-full mt-2 -top-16 z-0 mx-8">
                      <div
                        className="bg-burgundy-600 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (PROGRESS_STEPS.length - 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {result.status === 'Rejected' && (
                  <div className="alert-error mb-6 text-base p-4">
                    ❌ This request has been rejected. Please visit the parish office for more information.
                  </div>
                )}

                <div className="section-divider my-8 border-t-2 border-cream-300" />

                <div className="grid grid-cols-2 gap-6 text-base">
                  <div>
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-wide font-semibold">Submitted</p>
                    <p className="text-burgundy-800 font-bold text-lg">{new Date(result.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1 uppercase tracking-wide font-semibold">Last Updated</p>
                    <p className="text-burgundy-800 font-bold text-lg">{new Date(result.updatedAt).toLocaleDateString()}</p>
                  </div>
                  {result.appointmentDate && (
                    <div className="col-span-2 sm:col-span-1 mt-2">
                      <p className="text-gray-400 text-sm mb-1 uppercase tracking-wide font-semibold">Appointment</p>
                      <p className="text-burgundy-800 font-bold text-lg">{result.appointmentDate} {result.appointmentTime || ''}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="text-center py-24 text-gray-400 bg-white/40 backdrop-blur rounded-2xl border border-cream-300 shadow-sm">
                <p className="text-7xl mb-6">📬</p>
                <p className="text-xl max-w-md mx-auto leading-relaxed">Enter your Request ID above to check the status of your certificate.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
