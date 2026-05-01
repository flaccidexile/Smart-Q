import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SmartQLogo from '../../components/common/SmartQLogo';
import useAuth from '../../hooks/useAuth';

const statCards = [
  { key: 'total',      label: 'Total Requests', icon: '📋', accent: 'text-burgundy-700', bg: 'bg-cream-50  border-cream-300' },
  { key: 'pending',    label: 'Pending',         icon: '⏳', accent: 'text-amber-700',   bg: 'bg-amber-50  border-amber-200' },
  { key: 'processing', label: 'Processing',      icon: '🔄', accent: 'text-blue-700',    bg: 'bg-blue-50   border-blue-200'  },
  { key: 'approved',   label: 'Approved',        icon: '✅', accent: 'text-green-700',   bg: 'bg-green-50  border-green-200' },
  { key: 'released',   label: 'Released',        icon: '📬', accent: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200'},
  { key: 'rejected',   label: 'Rejected',        icon: '❌', accent: 'text-red-700',     bg: 'bg-red-50    border-red-200'   },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/requests?limit=10'),
      ]);
      setStats(s.data.stats);
      setRecent(r.data.requests);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const updateStatus = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/admin/requests/${id}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const statusBadge = (status) => {
    const map = {
      Pending: 'badge-pending', Processing: 'badge-processing',
      Approved: 'badge-approved', Released: 'badge-released', Rejected: 'badge-rejected',
      'Ready for Release': 'bg-teal-100 text-teal-800 border-teal-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide'
    };
    return <span className={map[status] || 'badge'}>{status}</span>;
  };

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
            ADMINISTRATOR CONTROL PANEL
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
              ⚙️
            </div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">
              Admin Portal
            </p>
            <p className="text-cream-400 text-base font-bold mt-1">{user?.name}</p>
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">
              Navigation
            </p>
            <Link to="/admin" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500" style={{ fontSize: '15px', padding: '14px 18px' }}>
                📊 Dashboard
              </button>
            </Link>
            <Link to="/admin/requests" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>
                📋 Verify Requests
              </button>
            </Link>
            <Link to="/admin/calendar" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>
                📅 Manage Calendar
              </button>
            </Link>
            <Link to="/admin/reports" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>
                📈 System Reports
              </button>
            </Link>
            <Link to="/track" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>
                🔍 Track ID
              </button>
            </Link>
          </div>

          <div className="mt-auto pt-6 border-t border-burgundy-700">
            <button onClick={handleLogout} className="panel-btn mt-3 text-center w-full">Sign Out</button>
          </div>
        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <main className="panel-right flex justify-center">
          <div className="panel-right-content w-full max-w-7xl animate-slide-up">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="right-section-title mb-0 pb-0 border-0 text-3xl">System Dashboard</h1>
                <p className="text-gray-600 text-base mt-2">Real-time overview of parish activity and incoming requests.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Reports & Analytics */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-5 mb-10">
                  {statCards.map((c) => (
                    <div key={c.key} className={`stat-card ${c.bg} flex flex-col justify-between p-6 shadow-sm`}>
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-gray-600 text-sm font-bold uppercase tracking-wider">{c.label}</p>
                        <span className="text-2xl opacity-80">{c.icon}</span>
                      </div>
                      <p className={`text-4xl font-bold font-head ${c.accent}`}>
                        {stats[c.key] ?? '0'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Centralized Database View */}
                <div className="card shadow-md border-cream-300">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-cream-200">
                    <div>
                      <h2 className="font-head text-2xl font-bold text-burgundy-900 tracking-wide">
                        Centralized Database View
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Incoming requests from Web and Walk-In Kiosk</p>
                    </div>
                    <Link to="/admin/requests" className="btn-secondary px-6 py-2 text-sm">
                      View All Records
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="text-gray-500 border-b-2 border-cream-200 text-left bg-cream-50">
                          <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider">ID</th>
                          <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider">Name & Document</th>
                          <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider">Source</th>
                          <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider">Date/Time</th>
                          <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider">Status</th>
                          <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        {recent.map((r) => (
                          <tr key={r.id} className="hover:bg-cream-50 transition-colors">
                            <td className="py-4 px-4 text-gray-500 font-mono text-sm font-semibold">#{r.id}</td>
                            <td className="py-4 px-4">
                              <p className="text-burgundy-900 font-bold text-base">{r.fullName}</p>
                              <p className="text-gray-500 text-sm mt-0.5">{r.certificateType} Certificate</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.source === 'kiosk'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                                {r.source === 'kiosk' ? '🖥️ KIOSK' : '🌐 WEB'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-600 text-sm">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              {statusBadge(r.status)}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {r.status === 'Approved' ? (
                                <button 
                                  onClick={() => updateStatus(r.id, 'Ready for Release')}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors shadow-sm"
                                >
                                  Mark as Ready
                                </button>
                              ) : r.status === 'Pending' ? (
                                <button 
                                  onClick={() => updateStatus(r.id, 'Processing')}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded text-xs transition-colors shadow-sm"
                                >
                                  Verify
                                </button>
                              ) : (
                                <Link to={`/admin/requests`} className="text-burgundy-600 hover:text-burgundy-800 text-sm font-semibold underline">
                                  Manage
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                        {recent.length === 0 && (
                          <tr><td colSpan={6} className="py-12 text-center text-gray-500 text-lg">No requests available in the database.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
