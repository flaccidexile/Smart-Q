import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/common/Navbar';

export default function UserManagement() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    axiosInstance.get('/admin/users')
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="split-window flex-1">
        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <aside className="panel-left">
          <div className="panel-left-header">
            <div className="w-12 h-12 rounded-full bg-cream-400/20 border border-cream-400/30
                            flex items-center justify-center text-2xl">
              👥
            </div>
            <p className="text-cream-200 font-head font-semibold text-sm mt-3 uppercase tracking-wide">
              User Management
            </p>
            <p className="text-cream-400 text-xs mt-1 text-center">
              All registered SMART Q accounts
            </p>
          </div>

          <div className="space-y-0">
            <p className="text-cream-400 text-[10px] uppercase tracking-widest mb-3 font-semibold">Navigation</p>
            <Link to="/admin"><button className="panel-btn w-full text-left">📊 Dashboard</button></Link>
            <Link to="/admin/requests"><button className="panel-btn w-full text-left">📋 Manage Requests</button></Link>
            <Link to="/admin/users"><button className="panel-btn active w-full text-left">👥 User Management</button></Link>
          </div>

          {/* User count */}
          <div className="mt-6 bg-burgundy-800/60 rounded-lg p-4 text-center">
            <p className="text-cream-400 text-xs mb-1">Total Users</p>
            <p className="text-cream-200 font-bold text-3xl font-head">{users.length}</p>
            {search && (
              <p className="text-cream-400 text-xs mt-1">
                Showing {filtered.length} results
              </p>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-burgundy-700">
            <Link to="/">
              <button className="panel-btn-sub w-full">← Back to Site</button>
            </Link>
          </div>
        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <main className="panel-right">
          <div className="panel-right-content animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="right-section-title mb-0 pb-0 border-0">User Management</h1>
                <p className="text-gray-500 text-sm mt-1">All registered accounts on the SMART Q platform.</p>
              </div>
            </div>

            {/* Search */}
            <div className="card mb-6">
              <label className="form-label">Search Users</label>
              <input
                className="form-input max-w-sm"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-cream-200 text-left">
                    {['ID', 'Name', 'Email', 'Role', 'Registered'].map((h) => (
                      <th key={h} className="pb-3 font-medium text-xs uppercase tracking-wide pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {loading ? (
                    <tr><td colSpan={5} className="py-16 text-center">
                      <div className="w-8 h-8 border-2 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center text-gray-400">
                      <p className="text-3xl mb-2">👥</p>No users found.
                    </td></tr>
                  ) : filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-400 font-mono text-xs">#{u.id}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-burgundy-100 border border-burgundy-200
                                          flex items-center justify-center text-burgundy-700 text-xs font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-burgundy-800 font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge ${u.role === 'admin'
                          ? 'bg-burgundy-100 text-burgundy-700 border-burgundy-200'
                          : 'bg-cream-100 text-gray-600 border-cream-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && (
              <p className="text-gray-400 text-xs mt-4 text-right">
                Showing {filtered.length} of {users.length} users
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
