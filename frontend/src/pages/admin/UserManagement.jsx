import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/common/Navbar';

export default function UserManagement() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">All registered accounts on the SMART Q platform.</p>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <input className="form-input max-w-sm" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 text-left">
                <th className="pb-3 font-medium pr-4">ID</th>
                <th className="pb-3 font-medium pr-4">Name</th>
                <th className="pb-3 font-medium pr-4">Email</th>
                <th className="pb-3 font-medium pr-4">Role</th>
                <th className="pb-3 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-500">
                  <p className="text-3xl mb-2">👥</p>No users found.
                </td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4 text-slate-400 font-mono">#{u.id}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${u.role === 'admin' ? 'badge-approved' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && (
          <p className="text-slate-500 text-xs mt-4 text-right">
            Showing {filtered.length} of {users.length} users
          </p>
        )}
      </div>
    </div>
  );
}
