import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/admin/StatusBadge';

const STATUSES = ['Pending', 'Processing', 'Approved', 'Released', 'Rejected'];
const CERT_TYPES = ['Baptismal', 'Confirmation', 'Marriage', 'Death'];

export default function RequestsView() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status: '', certificateType: '', search: '' });
  const [selected, setSelected]   = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes]         = useState('');
  const [updating, setUpdating]   = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status)          params.append('status', filters.status);
      if (filters.certificateType) params.append('certificateType', filters.certificateType);
      if (filters.search)          params.append('search', filters.search);
      const { data } = await axiosInstance.get(`/admin/requests?${params}`);
      setRequests(data.requests);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openModal = (r) => { setSelected(r); setNewStatus(r.status); setNotes(r.notes || ''); };
  const closeModal = () => { setSelected(null); setNewStatus(''); setNotes(''); };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await axiosInstance.patch(`/admin/requests/${selected.id}/status`, { status: newStatus, notes });
      setSuccessMsg(`Request #${selected.id} updated to ${newStatus}.`);
      closeModal();
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {} finally { setUpdating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete request #${id}? This cannot be undone.`)) return;
    await axiosInstance.delete(`/admin/requests/${id}`);
    fetchRequests();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white">Manage Requests</h1>
          <p className="text-slate-400 text-sm mt-1">Review, update, and manage all sacramental record requests.</p>
        </div>

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-5 text-sm">
            ✅ {successMsg}
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Search by Name</label>
              <input className="form-input" placeholder="Full name..." value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Filter by Status</label>
              <select className="form-input" value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Certificate Type</label>
              <select className="form-input" value={filters.certificateType}
                onChange={(e) => setFilters({ ...filters, certificateType: e.target.value })}>
                <option value="">All Types</option>
                {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 text-left">
                <th className="pb-3 font-medium pr-4">ID</th>
                <th className="pb-3 font-medium pr-4">Full Name</th>
                <th className="pb-3 font-medium pr-4">Certificate</th>
                <th className="pb-3 font-medium pr-4">Source</th>
                <th className="pb-3 font-medium pr-4">Appointment</th>
                <th className="pb-3 font-medium pr-4">Status</th>
                <th className="pb-3 font-medium pr-4">Submitted</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-500">
                  <p className="text-3xl mb-2">🔍</p>No requests found.
                </td></tr>
              ) : requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4 text-slate-400 font-mono">#{r.id}</td>
                  <td className="py-3 pr-4 text-white font-medium">{r.fullName}</td>
                  <td className="py-3 pr-4 text-slate-300">{r.certificateType}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge text-xs ${r.source === 'kiosk' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {r.source}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">{r.appointmentDate || '—'}</td>
                  <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(r)}
                        className="px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-medium transition-colors">
                        Update
                      </button>
                      <button onClick={() => handleDelete(r.id)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md animate-slide-up">
            <h2 className="font-semibold text-white text-lg mb-1">Update Request #{selected.id}</h2>
            <p className="text-slate-400 text-sm mb-5">{selected.fullName} — {selected.certificateType}</p>

            <div className="space-y-4">
              <div>
                <label className="form-label">New Status</label>
                <select className="form-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Admin Notes (optional)</label>
                <textarea className="form-input resize-none" rows={3} value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add remarks for the customer..." />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleUpdate} disabled={updating} className="btn-primary flex-1">
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
