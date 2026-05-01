import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SmartQLogo from '../../components/common/SmartQLogo';
import StatusBadge from '../../components/admin/StatusBadge';
import useAuth from '../../hooks/useAuth';

const STATUSES   = ['Pending', 'Processing', 'Approved', 'Released', 'Rejected'];
const CERT_TYPES = ['Baptismal', 'Confirmation', 'Marriage', 'Death'];

export default function RequestsView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ status: '', certificateType: '', search: '' });
  const [selected, setSelected]     = useState(null);
  const [newStatus, setNewStatus]   = useState('');
  const [notes, setNotes]           = useState('');
  const [updating, setUpdating]     = useState(false);
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

  const openModal  = (r) => { setSelected(r); setNewStatus(r.status); setNotes(r.notes || ''); };
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
    <div className="min-h-screen flex flex-col">
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" aria-label="Back to dashboard">
            <SmartQLogo height={56} />
          </Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            MANAGE ALL REQUESTS
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
        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <aside className="panel-left">
          <div className="panel-left-header">
            <div className="w-16 h-16 rounded-full bg-cream-400/20 border border-cream-400/30 flex items-center justify-center text-3xl mb-2">
              📋
            </div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">Request Manager</p>
            <p className="text-cream-400 text-base font-bold mt-1">Admin Panel</p>
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">Navigation</p>
            <Link to="/admin" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📊 Dashboard</button>
            </Link>
            <Link to="/admin/requests" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500" style={{ fontSize: '15px', padding: '14px 18px' }}>📋 Verify Requests</button>
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
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>🔍 Track ID</button>
            </Link>
          </div>

          {/* Filter summary */}
          <div className="mt-6 bg-burgundy-800/60 rounded-lg p-4 border border-burgundy-700">
            <p className="text-cream-300 text-xs font-bold uppercase tracking-widest mb-3">Active Filters</p>
            <div className="space-y-2">
              {filters.status && (
                <div className="flex justify-between text-xs">
                  <span className="text-cream-500 font-bold">Status:</span>
                  <span className="text-cream-200 font-medium">{filters.status}</span>
                </div>
              )}
              {filters.certificateType && (
                <div className="flex justify-between text-xs">
                  <span className="text-cream-500 font-bold">Type:</span>
                  <span className="text-cream-200 font-medium">{filters.certificateType}</span>
                </div>
              )}
              {filters.search && (
                <div className="flex justify-between text-xs">
                  <span className="text-cream-500 font-bold">Search:</span>
                  <span className="text-cream-200 font-medium truncate max-w-[100px]">{filters.search}</span>
                </div>
              )}
              {!filters.status && !filters.certificateType && !filters.search && (
                <p className="text-cream-600 text-[10px] italic">No active filters applied</p>
              )}
            </div>
            {(filters.status || filters.certificateType || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', certificateType: '', search: '' })}
                className="w-full mt-4 py-2 text-[10px] bg-burgundy-900 text-cream-300 rounded border border-burgundy-700 hover:bg-burgundy-800 transition-colors uppercase font-bold tracking-widest"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-burgundy-700">
             <div className="bg-burgundy-900/40 rounded-lg p-3 text-center mb-3">
                <p className="text-cream-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Records</p>
                <p className="text-cream-200 font-bold text-3xl font-head">{requests.length}</p>
             </div>
             <button onClick={() => navigate('/login')} className="panel-btn mt-3 text-center w-full">Sign Out</button>
          </div>
        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <main className="panel-right">
          <div className="panel-right-content animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="right-section-title mb-0 pb-0 border-0">Manage Requests</h1>
                <p className="text-gray-500 text-sm mt-1">Review, update, and manage all sacramental record requests.</p>
              </div>
            </div>

            {successMsg && <div className="alert-success mb-5">✅ {successMsg}</div>}

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
                  <tr className="text-gray-400 border-b border-cream-200 text-left">
                    {['ID', 'Full Name', 'Certificate', 'Source', 'Appointment', 'Status', 'Submitted', 'Actions'].map((h) => (
                      <th key={h} className="pb-3 font-medium text-xs uppercase tracking-wide pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {loading ? (
                    <tr><td colSpan={8} className="py-16 text-center">
                      <div className="w-8 h-8 border-2 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </td></tr>
                  ) : requests.length === 0 ? (
                    <tr><td colSpan={8} className="py-16 text-center text-gray-400">
                      <p className="text-3xl mb-2">🔍</p>No requests found.
                    </td></tr>
                  ) : requests.map((r) => (
                    <tr key={r.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-400 font-mono text-xs">#{r.id}</td>
                      <td className="py-3 pr-4 text-burgundy-800 font-semibold">{r.fullName}</td>
                      <td className="py-3 pr-4 text-gray-600">{r.certificateType}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge text-xs ${r.source === 'kiosk'
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : 'bg-cream-100 text-gray-600 border-cream-300'}`}>
                          {r.source}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{r.appointmentDate || '—'}</td>
                      <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openModal(r)}
                            className="px-3 py-1.5 bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-700 border border-burgundy-200 rounded-md text-xs font-medium transition-colors">
                            Update
                          </button>
                          <button onClick={() => handleDelete(r.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-medium transition-colors">
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
        </main>
      </div>

      {/* ── Update Modal ─────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-cream-300 rounded-lg shadow-xl w-full max-w-md animate-slide-up">
            {/* Modal header */}
            <div className="bg-burgundy-800 rounded-t-lg px-6 py-4">
              <h2 className="font-head text-cream-200 font-semibold uppercase tracking-wide">
                Update Request #{selected.id}
              </h2>
              <p className="text-cream-400 text-xs mt-0.5">{selected.fullName} — {selected.certificateType}</p>
            </div>

            <div className="p-6 space-y-4">
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

            <div className="flex gap-3 px-6 pb-6">
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
