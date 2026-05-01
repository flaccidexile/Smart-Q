import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SmartQLogo from '../../components/common/SmartQLogo';
import useAuth from '../../hooks/useAuth';

/* ── Mock data — replace with axiosInstance calls when backend is ready ─── */
const MOCK_INTENTIONS = [
  { id: 1, intentionType: 'deceased',     recipientName: 'Lolo Jose Santos',        requesterName: 'Maria Santos',    contactInfo: 'maria@email.com',   massDate: 'May 10, 2026', massTime: '6:00 AM',  physicalCard: true,  priestNote: 'Died last month, 1st death anniversary', status: 'Pending',   submittedAt: '2026-05-02' },
  { id: 2, intentionType: 'healing',      recipientName: 'Ana Reyes',               requesterName: 'Pedro Reyes',     contactInfo: '09171234567',       massDate: 'May 11, 2026', massTime: '6:00 PM',  physicalCard: false, priestNote: 'Successful surgery prayer',              status: 'Confirmed', submittedAt: '2026-05-02' },
  { id: 3, intentionType: 'birthday',     recipientName: 'The Dela Cruz Family',    requesterName: 'Juan Dela Cruz',  contactInfo: 'jdc@email.com',     massDate: 'May 15, 2026', massTime: '8:00 AM',  physicalCard: true,  priestNote: '50th Wedding Anniversary',              status: 'Pending',   submittedAt: '2026-05-01' },
  { id: 4, intentionType: 'thanksgiving', recipientName: 'St. Joseph Parish Youth', requesterName: 'Carla Villanueva',contactInfo: '09189876543',       massDate: 'May 18, 2026', massTime: '10:00 AM', physicalCard: false, priestNote: 'Thanksgiving for Youth Camp',            status: 'Cancelled', submittedAt: '2026-04-30' },
];

const STATUSES       = ['Pending', 'Confirmed', 'Cancelled'];
const INTENTION_LABELS = {
  deceased:     '† Deceased',
  healing:      '🙏 Healing / Sick',
  birthday:     '🎂 Birthday / Anniv.',
  thanksgiving: '✨ Thanksgiving',
};

function StatusBadge({ status }) {
  const map = {
    Pending:   'bg-amber-100 text-amber-800 border-amber-300',
    Confirmed: 'bg-green-100 text-green-800 border-green-300',
    Cancelled: 'bg-red-100   text-red-800   border-red-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
      {status}
    </span>
  );
}

function AdminNav({ active }) {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const links = [
    { to: '/admin',                   label: '📊 Dashboard'           },
    { to: '/admin/requests',          label: '📋 Verify Requests'     },
    { to: '/admin/mass-intentions',   label: '✝ Mass Intentions'      },
    { to: '/admin/calendar',          label: '📅 Manage Calendar'     },
    { to: '/admin/reports',           label: '📈 System Reports'      },
    { to: '/track',                   label: '🔍 Track ID'            },
  ];
  return (
    <aside className="panel-left">
      <div className="panel-left-header">
        <div className="w-16 h-16 rounded-full bg-cream-400/20 border border-cream-400/30 flex items-center justify-center text-3xl mb-2">✝</div>
        <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">Mass Intentions</p>
        <p className="text-cream-400 text-base font-bold mt-1">Admin Panel</p>
      </div>

      <div className="space-y-2 mt-4">
        <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">Navigation</p>
        {links.map(l => (
          <Link key={l.to} to={l.to} className="block">
            <button
              className={`w-full text-left font-medium rounded-md transition-all duration-150 select-none ${
                active === l.to
                  ? 'bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500'
                  : 'text-cream-100 hover:bg-burgundy-800'
              }`}
              style={{ fontSize: '15px', padding: '14px 18px' }}
            >
              {l.label}
            </button>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-burgundy-700">
        <button onClick={() => { logout(); navigate('/login'); }} className="panel-btn mt-3 text-center w-full">
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function MassIntentionsView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [intentions, setIntentions] = useState(MOCK_INTENTIONS);
  const [filters, setFilters]       = useState({ status: '', intentionType: '', search: '' });
  const [selected, setSelected]     = useState(null);
  const [newStatus, setNewStatus]   = useState('');
  const [adminNote, setAdminNote]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* Filter logic */
  const filtered = useCallback(() => {
    return intentions.filter(i => {
      if (filters.status      && i.status      !== filters.status)      return false;
      if (filters.intentionType && i.intentionType !== filters.intentionType) return false;
      if (filters.search      && !i.recipientName.toLowerCase().includes(filters.search.toLowerCase()) &&
                                 !i.requesterName.toLowerCase().includes(filters.search.toLowerCase()))  return false;
      return true;
    });
  }, [intentions, filters])();

  const openModal  = (i) => { setSelected(i); setNewStatus(i.status); setAdminNote(''); };
  const closeModal = ()  => { setSelected(null); setNewStatus(''); setAdminNote(''); };

  const handleUpdate = () => {
    setIntentions(prev => prev.map(i => i.id === selected.id ? { ...i, status: newStatus } : i));
    setSuccessMsg(`Intention #${selected.id} updated to "${newStatus}".`);
    closeModal();
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleDelete = (id) => {
    if (!window.confirm(`Remove Mass Intention #${id}? This cannot be undone.`)) return;
    setIntentions(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">

      <div className="sys-header flex items-center justify-between" id="admin-mass-header">
        <div className="flex items-center gap-4">
          <Link to="/admin" aria-label="Back to dashboard"><SmartQLogo height={56} /></Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            MANAGE MASS INTENTIONS
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

        {/* ── LEFT NAV ──────────────────────────────────────────────────────── */}
        <AdminNav active="/admin/mass-intentions" />

        {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
        <main className="panel-right">
          <div className="panel-right-content animate-slide-up">

            {/* Page title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="right-section-title mb-0 pb-0 border-0">✝ Mass Intentions</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Review and confirm parishioner Mass Intention requests for liturgical scheduling.
                </p>
              </div>
              {/* Stats pills */}
              <div className="flex gap-3 shrink-0">
                {[
                  { label: 'Total',     value: intentions.length,                                        color: 'bg-cream-100   text-burgundy-800' },
                  { label: 'Pending',   value: intentions.filter(i => i.status === 'Pending').length,   color: 'bg-amber-100   text-amber-800'   },
                  { label: 'Confirmed', value: intentions.filter(i => i.status === 'Confirmed').length, color: 'bg-green-100   text-green-800'   },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-lg px-4 py-2 text-center border border-current/20`}>
                    <p className="text-2xl font-bold font-head leading-none">{s.value}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {successMsg && <div className="alert-success mb-5">✅ {successMsg}</div>}

            {/* ── Filters ─────────────────────────────────────────────────── */}
            <div className="card mb-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Search (Name)</label>
                  <input
                    className="form-input"
                    placeholder="Recipient or requester name…"
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Filter by Status</label>
                  <select
                    className="form-input"
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Filter by Intention Type</label>
                  <select
                    className="form-input"
                    value={filters.intentionType}
                    onChange={e => setFilters({ ...filters, intentionType: e.target.value })}
                  >
                    <option value="">All Types</option>
                    {Object.entries(INTENTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div className="card overflow-x-auto">
              <table className="w-full text-sm" id="mass-intentions-table">
                <thead>
                  <tr className="text-gray-400 border-b border-cream-200 text-left bg-cream-50">
                    {['#', 'Recipient', 'Intention', 'Mass Date & Time', 'Requester', 'Card?', 'Status', 'Submitted', 'Actions'].map(h => (
                      <th key={h} className="py-4 px-3 font-bold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-gray-400">
                        <p className="text-3xl mb-2">✝</p>No Mass Intention requests found.
                      </td>
                    </tr>
                  ) : filtered.map(item => (
                    <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3 px-3 text-gray-400 font-mono text-xs">#{item.id}</td>

                      <td className="py-3 px-3">
                        <p className="text-burgundy-900 font-bold">{item.recipientName}</p>
                        {item.priestNote && (
                          <p className="text-gray-400 text-xs mt-0.5 italic truncate max-w-[160px]" title={item.priestNote}>
                            "{item.priestNote}"
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-burgundy-700 bg-cream-100 border border-cream-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {INTENTION_LABELS[item.intentionType] || item.intentionType}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-gray-800">{item.massDate}</p>
                        <p className="text-gray-400 text-xs">{item.massTime}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="text-gray-700 font-medium">{item.requesterName}</p>
                        <p className="text-gray-400 text-xs">{item.contactInfo}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {item.physicalCard
                          ? <span className="text-green-700 font-bold text-base" title="Physical card requested">📬</span>
                          : <span className="text-gray-300 text-base">—</span>}
                      </td>

                      <td className="py-3 px-3"><StatusBadge status={item.status} /></td>

                      <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">{item.submittedAt}</td>

                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="px-3 py-1.5 bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-700 border border-burgundy-200 rounded-md text-xs font-medium transition-colors"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-medium transition-colors"
                          >
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

      {/* ── Update Modal ──────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-cream-300 rounded-xl shadow-xl w-full max-w-lg animate-slide-up">

            {/* Modal header */}
            <div className="bg-burgundy-800 rounded-t-xl px-6 py-4">
              <h2 className="font-head text-cream-200 font-semibold uppercase tracking-wide text-lg">
                Manage Intention #{selected.id}
              </h2>
              <p className="text-cream-400 text-sm mt-0.5">
                {INTENTION_LABELS[selected.intentionType]} — {selected.recipientName}
              </p>
            </div>

            {/* Details summary */}
            <div className="px-6 pt-5 pb-2">
              <div className="bg-cream-50 border border-cream-200 rounded-lg p-4 grid grid-cols-2 gap-y-3 text-sm mb-5">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Mass Date</p>
                  <p className="font-semibold text-burgundy-900 mt-0.5">{selected.massDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Mass Time</p>
                  <p className="font-semibold text-burgundy-900 mt-0.5">{selected.massTime}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Requester</p>
                  <p className="font-semibold text-burgundy-900 mt-0.5">{selected.requesterName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Contact</p>
                  <p className="font-semibold text-burgundy-900 mt-0.5">{selected.contactInfo}</p>
                </div>
                {selected.priestNote && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Priest Note</p>
                    <p className="italic text-gray-600 mt-0.5">"{selected.priestNote}"</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Physical Card</p>
                  <p className="font-semibold text-burgundy-900 mt-0.5">{selected.physicalCard ? '📬 Yes — prepare card for pickup' : 'No'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Update Status</label>
                  <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Admin Note (optional)</label>
                  <textarea
                    className="form-input resize-none"
                    rows={2}
                    placeholder="e.g. Scheduled for 6AM Sunday Mass…"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-2">
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleUpdate} className="btn-primary flex-1 font-bold">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
