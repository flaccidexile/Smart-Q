import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/common/Navbar';
import useAuth from '../../hooks/useAuth';

const statCards = [
  { key: 'total',      label: 'Total Requests',  icon: '📋', color: 'from-slate-700 to-slate-800', accent: 'text-white' },
  { key: 'pending',    label: 'Pending',          icon: '⏳', color: 'from-amber-600/20 to-amber-700/10', accent: 'text-amber-400' },
  { key: 'processing', label: 'Processing',       icon: '🔄', color: 'from-blue-600/20 to-blue-700/10',  accent: 'text-blue-400' },
  { key: 'approved',   label: 'Approved',         icon: '✅', color: 'from-green-600/20 to-green-700/10', accent: 'text-green-400' },
  { key: 'released',   label: 'Released',         icon: '📬', color: 'from-purple-600/20 to-purple-700/10', accent: 'text-purple-400' },
  { key: 'rejected',   label: 'Rejected',         icon: '❌', color: 'from-red-600/20 to-red-700/10',  accent: 'text-red-400' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]         = useState({});
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          axiosInstance.get('/admin/stats'),
          axiosInstance.get('/admin/requests?limit=5'),
        ]);
        setStats(s.data.stats);
        setRecent(r.data.requests);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const statusBadge = (status) => {
    const map = {
      Pending: 'badge-pending', Processing: 'badge-processing',
      Approved: 'badge-approved', Released: 'badge-released', Rejected: 'badge-rejected',
    };
    return <span className={map[status] || 'badge'}>{status}</span>;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome, {user?.name} 👋</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/requests" className="btn-primary text-sm !py-2">View All Requests</Link>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {statCards.map((c) => (
                <div key={c.key} className={`card bg-gradient-to-br ${c.color} border-slate-700/50`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{c.label}</p>
                      <p className={`text-3xl font-bold font-display mt-1 ${c.accent}`}>
                        {stats[c.key] ?? '—'}
                      </p>
                    </div>
                    <span className="text-3xl">{c.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Requests */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white text-lg">Recent Requests</h2>
                <Link to="/admin/requests" className="text-brand-400 hover:text-brand-300 text-sm">
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="text-left pb-3 font-medium">ID</th>
                      <th className="text-left pb-3 font-medium">Name</th>
                      <th className="text-left pb-3 font-medium">Certificate</th>
                      <th className="text-left pb-3 font-medium">Source</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                      <th className="text-left pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recent.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 text-slate-400">#{r.id}</td>
                        <td className="py-3 text-white font-medium">{r.fullName}</td>
                        <td className="py-3 text-slate-300">{r.certificateType}</td>
                        <td className="py-3">
                          <span className={`badge text-xs ${r.source === 'kiosk' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-700 text-slate-300'}`}>
                            {r.source}
                          </span>
                        </td>
                        <td className="py-3">{statusBadge(r.status)}</td>
                        <td className="py-3 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {recent.length === 0 && (
                      <tr><td colSpan={6} className="py-10 text-center text-slate-500">No requests yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <Link to="/admin/requests" className="card-hover flex items-center gap-4 group">
                <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center justify-center text-2xl">📋</div>
                <div>
                  <p className="text-white font-semibold group-hover:text-brand-400 transition-colors">Manage All Requests</p>
                  <p className="text-slate-400 text-sm">Review, approve, and update statuses</p>
                </div>
              </Link>
              <Link to="/admin/users" className="card-hover flex items-center gap-4 group">
                <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center justify-center text-2xl">👥</div>
                <div>
                  <p className="text-white font-semibold group-hover:text-brand-400 transition-colors">User Management</p>
                  <p className="text-slate-400 text-sm">View registered customers</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
