import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import SmartQLogo from '../components/common/SmartQLogo';
import StatusBadge from '../components/admin/StatusBadge';
import useAuth from '../hooks/useAuth';

const TABS = ['My Sacramental Requests', 'My Appointments', 'Payment History'];

export default function RequestPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('My Sacramental Requests');

  // Data State
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/requests');
      setRequests(data.requests);
    } catch {} finally { setFetching(false); }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request? This action cannot be undone.')) return;
    try {
      await axiosInstance.put(`/requests/${id}/cancel`);
      alert('Request cancelled successfully.');
      fetchRequests(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col bg-panel-right">
      
      {/* ── Custom Header ──────────────────────────────────────────────────── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Back to home">
            <SmartQLogo height={56} />
          </Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            MY PROFILE
          </span>
        </div>
        <Link 
          to="/" 
          className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2 px-6 rounded-md shadow transition text-base"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="split-window flex-1">
        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <aside className="panel-left">
          <div className="panel-left-header">
            <div className="w-16 h-16 rounded-full bg-cream-400/20 border border-cream-400/30
                            flex items-center justify-center text-3xl mb-2">
              👤
            </div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">
              Welcome back!
            </p>
            <p className="text-cream-400 text-base font-bold mt-1">
              {user?.name}
            </p>
          </div>

          <div className="mb-6 space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">
              Activity Overview
            </p>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left font-medium rounded-md transition-all duration-150 select-none ${activeTab === tab ? 'bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500' : 'text-cream-100 hover:bg-burgundy-800'}`}
                style={{ fontSize: '15px', padding: '14px 18px' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-burgundy-700 space-y-3">
            {[
              { value: '24/7',  label: 'Online Access' },
              { value: '3 min', label: 'Average Submit Time' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-cream-300 text-sm">{s.label}</span>
                <span className="text-cream-200 font-bold text-base">{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <main className="panel-right flex justify-center">
          <div className="panel-right-content w-full animate-slide-up max-w-5xl">
            
            {/* TAB 1: My Sacramental Requests */}
            {activeTab === 'My Sacramental Requests' && (
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="right-section-title !mb-2">My Sacramental Requests</h1>
                    <p className="text-gray-600 text-base">Track the real-time status of all your submitted documents.</p>
                  </div>
                  {requests.length > 0 && !fetching && (
                    <button onClick={() => navigate('/certificate-request')} className="btn-primary px-6 py-2.5 text-sm font-bold shadow-sm whitespace-nowrap mt-1">
                      + New Request
                    </button>
                  )}
                </div>
                
                <div className="card">
                  {fetching ? (
                    <div className="text-center py-12">
                      <div className="w-10 h-10 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-cream-50 rounded-lg border-2 border-dashed border-cream-200">
                      <p className="text-5xl mb-4">📭</p>
                      <p className="text-lg text-gray-600 font-medium">No requests yet.</p>
                      <button onClick={() => navigate('/certificate-request')} className="btn-primary mt-6">Submit Your First Request</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((r) => (
                        <div key={r.id} className="bg-cream-50 border border-cream-300 hover:border-burgundy-300 transition-colors rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-burgundy-900 text-lg font-bold">{r.certificateType} Certificate</p>
                              <span className="text-gray-400 text-sm font-mono bg-white px-2 py-0.5 rounded border">#{r.id}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-1"><span className="font-semibold text-gray-500 w-20 inline-block">Purpose:</span> {r.purpose}</p>
                            <p className="text-gray-600 text-sm"><span className="font-semibold text-gray-500 w-20 inline-block">Submitted:</span> {new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <StatusBadge status={r.status} />
                            {r.status === 'Ready for Release' && (
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-bold">Please pick up soon!</span>
                            )}
                            {r.status === 'Pending' && (
                              <button 
                                onClick={() => handleCancelRequest(r.id)} 
                                className="text-xs text-red-600 hover:text-red-800 font-bold underline mt-1"
                              >
                                Cancel Request
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: My Appointments */}
            {activeTab === 'My Appointments' && (
              <div>
                <h1 className="right-section-title">My Appointments</h1>
                <p className="text-gray-600 text-base mb-8 -mt-2">View your integrated schedule and upcoming pickup times.</p>
                
                <div className="card bg-white/60">
                  {requests.filter(r => r.appointmentDate).length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <p className="text-5xl mb-4">📅</p>
                      <p className="text-lg text-gray-600 font-medium">No upcoming appointments.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {requests.filter(r => r.appointmentDate).map((r) => (
                        <div key={r.id} className="bg-white border-2 border-cream-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-burgundy-600"></div>
                          <p className="text-burgundy-900 font-bold text-xl mb-1">{new Date(r.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-gray-800 text-lg font-medium mb-4">⏰ {r.appointmentTime}</p>
                          <div className="bg-cream-100 p-3 rounded-md mb-3">
                            <p className="text-sm font-semibold text-burgundy-800">{r.certificateType} Certificate</p>
                            <p className="text-xs text-gray-500 mt-1">Request #{r.id}</p>
                          </div>
                          <div className="flex justify-between items-center mt-auto border-t border-cream-200 pt-3">
                            <StatusBadge status={r.status} />
                            {r.status === 'Pending' && (
                              <button 
                                onClick={() => handleCancelRequest(r.id)} 
                                className="text-xs text-red-600 hover:text-red-800 font-bold underline"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Payment History */}
            {activeTab === 'Payment History' && (
              <div>
                <h1 className="right-section-title">Payment History</h1>
                <p className="text-gray-600 text-base mb-8 -mt-2">Review your past transactions and document fees.</p>
                
                <div className="card p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-burgundy-50 border-b-2 border-burgundy-100">
                        <tr>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Date</th>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Description</th>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Amount</th>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-gray-500 text-base">
                            No payment history available yet.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
