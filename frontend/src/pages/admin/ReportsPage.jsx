import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SmartQLogo from '../../components/common/SmartQLogo';
import useAuth from '../../hooks/useAuth';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const STATUS_COLORS = {
  Pending:    'bg-amber-100   text-amber-800   border-amber-300',
  Processing: 'bg-blue-100    text-blue-800    border-blue-300',
  Approved:   'bg-green-100   text-green-800   border-green-300',
  Released:   'bg-purple-100  text-purple-800  border-purple-300',
  Rejected:   'bg-red-100     text-red-800     border-red-300',
  Cancelled:  'bg-gray-100    text-gray-500    border-gray-300',
};

// Groups certificateType into 3 display categories
const CATEGORY_MAP = {
  'Baptismal':      'Sacramental',
  'Confirmation':   'Sacramental',
  'Marriage':       'Sacramental',
  'Death':          'Sacramental',
  'Appointment':    'Appointment',
  'Mass Intention': 'Mass Intention',
};

const TABS = ['All', 'Sacramental', 'Appointment', 'Mass Intention'];

const NAV_LINKS = [
  { to: '/admin',                 label: '📊 Dashboard'      },
  { to: '/admin/requests',        label: '📋 Verify Requests' },
  { to: '/admin/mass-intentions', label: '✝ Mass Intentions'  },
  { to: '/admin/calendar',        label: '📅 Manage Calendar' },
  { to: '/admin/reports',         label: '📈 System Reports', active: true },
  { to: '/track',                 label: '🔍 Track ID'        },
];

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [reportData,    setReportData]    = useState([]);
  const [totalRevenue,  setTotalRevenue]  = useState(0);
  const [ledger,        setLedger]        = useState([]);
  const [auditLogs,     setAuditLogs]     = useState([]);
  const [allRequests,   setAllRequests]   = useState([]);
  const [typeBreakdown, setTypeBreakdown] = useState([]);
  const [loading,       setLoading]       = useState(true);

  // Tab & filter state
  const [activeTab,    setActiveTab]    = useState('All');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGraphMonth, setSelectedGraphMonth] = useState('All');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/admin/reports?year=${selectedYear}`);
        setReportData(data.reportData     || []);
        setTotalRevenue(data.totalRevenue || 0);
        setLedger(data.ledger             || []);
        setAuditLogs(data.auditLogs       || []);
        setAllRequests(data.allRequests   || []);
        setTypeBreakdown(data.typeBreakdown || []);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [selectedYear]);

  // Derived counts for top stat cards
  const sacramentalCount   = allRequests.filter(r => CATEGORY_MAP[r.certificateType] === 'Sacramental').length;
  const appointmentCount   = allRequests.filter(r => CATEGORY_MAP[r.certificateType] === 'Appointment').length;
  const massIntentionCount = allRequests.filter(r => CATEGORY_MAP[r.certificateType] === 'Mass Intention').length;

  // Filtered requests for the table
  const filteredRequests = useMemo(() => {
    return allRequests.filter(r => {
      const category = CATEGORY_MAP[r.certificateType] || 'Sacramental';
      if (activeTab !== 'All' && category !== activeTab) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !r.fullName?.toLowerCase().includes(term) &&
          !r.certificateType?.toLowerCase().includes(term) &&
          !String(r.id).includes(term)
        ) return false;
      }
      return true;
    });
  }, [allRequests, activeTab, statusFilter, searchTerm]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col bg-panel-right">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" aria-label="Back to dashboard">
            <SmartQLogo height={56} />
          </Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            SYSTEM REPORTS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-cream-200 font-bold text-sm leading-tight">{user?.name || 'System Administrator'}</p>
            <p className="text-cream-400 text-xs">{user?.role === 'admin' ? 'Administrator' : 'Admin Portal'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2 px-6 rounded-md shadow transition text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="split-window flex-1">
        {/* ── LEFT NAV ──────────────────────────────────────────────────── */}
        <aside className="panel-left">
          <div className="panel-left-header">
            <div className="w-16 h-16 rounded-full bg-cream-400/20 border border-cream-400/30 flex items-center justify-center text-3xl mb-2">
              📈
            </div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">Data &amp; Analytics</p>
            <p className="text-cream-400 text-base font-bold mt-1">{user?.name}</p>
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">Navigation</p>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="block">
                <button
                  className={`w-full text-left font-medium rounded-md transition-all duration-150 select-none ${
                    l.active
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
            <button onClick={handleLogout} className="panel-btn mt-3 text-center w-full">Sign Out</button>
          </div>
        </aside>

        {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
        <main className="panel-right overflow-y-auto">
          <div className="panel-right-content w-full max-w-7xl animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="right-section-title mb-0 pb-0 border-0 text-3xl">Analytics &amp; Reports</h1>
                <p className="text-gray-600 text-base mt-2">Complete overview of all requests — Sacramental, Appointments, and Mass Intentions.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20 text-gray-500 font-bold text-lg">Loading records…</div>
            ) : (
              <>
                {/* ── Summary Stat Cards ──────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                  {[
                    { label: 'Sacramental Requests',  val: sacramentalCount,   icon: '📋', color: 'bg-burgundy-700' },
                    { label: 'Appointments',           val: appointmentCount,   icon: '📅', color: 'bg-blue-700'    },
                    { label: 'Mass Intentions',        val: massIntentionCount, icon: '✝',  color: 'bg-gray-700'    },
                    { label: 'Total Revenue (Fees)',   val: `₱${totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-800' },
                  ].map((m, i) => (
                    <div key={i} className={`${m.color} text-white rounded-xl p-6 shadow-md`}>
                      <div className="flex justify-between items-start mb-3 opacity-80">
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">{m.label}</p>
                        <span className="text-xl">{m.icon}</span>
                      </div>
                      <p className="text-3xl font-bold font-head text-white">{m.val}</p>
                    </div>
                  ))}
                </div>

                {/* ── Charts Row ─────────────────────────────────────── */}
                <div className="grid lg:grid-cols-3 gap-8 mb-10">
                  {/* Request Volume Bar Chart */}
                  <div className="card shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-burgundy-900 font-bold text-lg uppercase tracking-wide">Request Volume</h3>
                      <div className="flex gap-2">
                        <select 
                          className="form-input !py-1 !px-2 !text-xs w-24"
                          value={selectedGraphMonth}
                          onChange={e => setSelectedGraphMonth(e.target.value)}
                        >
                          <option value="All">All Mos</option>
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select 
                          className="form-input !py-1 !px-2 !text-xs w-20"
                          value={selectedYear}
                          onChange={e => setSelectedYear(e.target.value)}
                        >
                          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="h-64 flex items-end justify-center gap-1 sm:gap-2 px-2 pb-6 border-b-2 border-l-2 border-cream-200 relative pt-6">
                      {reportData.filter(d => selectedGraphMonth === 'All' || d.label === selectedGraphMonth).map((d, i) => {
                        const filteredData = reportData.filter(x => selectedGraphMonth === 'All' || x.label === selectedGraphMonth);
                        const maxVal = Math.max(...filteredData.map(r => r.value), 1);
                        const heightPercent = (d.value / maxVal) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                            <div
                              className="bg-burgundy-700 w-full max-w-[2rem] sm:max-w-[3rem] rounded-t-md hover:bg-burgundy-600 transition-all duration-300 relative shadow-md"
                              style={{ height: `${heightPercent}%` }}
                            >
                              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-burgundy-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 whitespace-nowrap">
                                {d.value}
                              </span>
                            </div>
                            <p className="text-gray-500 font-bold text-[9px] sm:text-[11px] mt-3 uppercase tracking-tighter w-full text-center truncate">{d.label}</p>
                          </div>
                        );
                      })}
                      {reportData.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">
                          No data available for the last 6 months.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Type Breakdown Donut-style list */}
                  <div className="card shadow-sm lg:col-span-1">
                    <h3 className="text-burgundy-900 font-bold text-lg mb-6 uppercase tracking-wide">Requests by Type</h3>
                    <div className="space-y-3">
                      {typeBreakdown.sort((a, b) => b.count - a.count).map((t, i) => {
                        const total = typeBreakdown.reduce((s, x) => s + x.count, 0) || 1;
                        const pct   = Math.round((t.count / total) * 100);
                        const colors = [
                          'bg-burgundy-600', 'bg-blue-600', 'bg-gray-600',
                          'bg-green-600', 'bg-amber-600', 'bg-purple-600',
                        ];
                        return (
                          <div key={i}>
                            <div className="flex justify-between items-center text-sm mb-1">
                              <span className="font-semibold text-gray-700">{t.type}</span>
                              <span className="text-gray-500 font-mono">{t.count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-cream-200 rounded-full h-2.5">
                              <div
                                className={`${colors[i % colors.length]} h-2.5 rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {typeBreakdown.length === 0 && (
                        <p className="text-gray-400 italic text-sm text-center py-8">No requests submitted yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── All Requests Table ──────────────────────────────── */}
                <div className="card shadow-md border-cream-300 mb-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-cream-200">
                    <div>
                      <h2 className="font-head text-2xl font-bold text-burgundy-900 tracking-wide uppercase">All Requests</h2>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {filteredRequests.length} record{filteredRequests.length !== 1 ? 's' : ''} found
                      </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                      <input
                        type="text"
                        placeholder="Search name or ID…"
                        className="form-input !py-2 !text-sm w-48"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <select
                        className="form-input !py-2 !text-sm"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        {['Pending','Processing','Approved','Released','Rejected','Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Category Tabs */}
                  <div className="flex gap-2 mb-5 flex-wrap">
                    {TABS.map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150 border ${
                          activeTab === tab
                            ? 'bg-burgundy-700 text-white border-burgundy-700 shadow-sm'
                            : 'bg-white text-gray-600 border-cream-300 hover:border-burgundy-400'
                        }`}
                      >
                        {tab === 'All'             && `All (${allRequests.length})`}
                        {tab === 'Sacramental'     && `📋 Sacramental (${sacramentalCount})`}
                        {tab === 'Appointment'     && `📅 Appointments (${appointmentCount})`}
                        {tab === 'Mass Intention'  && `✝ Mass Intentions (${massIntentionCount})`}
                      </button>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b-2 border-cream-200 text-left bg-cream-50 uppercase tracking-widest font-bold text-[10px]">
                          <th className="py-3 px-3">#</th>
                          <th className="py-3 px-3">Name</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Purpose / Service</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Source</th>
                          <th className="py-3 px-3">Appt. Date</th>
                          <th className="py-3 px-3">Submitted</th>
                          <th className="py-3 px-3">Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        {filteredRequests.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-16 text-center text-gray-400 italic">
                              No requests found matching your filters.
                            </td>
                          </tr>
                        ) : filteredRequests.map(r => (
                          <tr key={r.id} className="hover:bg-cream-50 transition-colors">
                            <td className="py-3 px-3 text-gray-400 font-mono text-xs">#{r.id}</td>
                            <td className="py-3 px-3">
                              <p className="font-bold text-burgundy-900 truncate max-w-[140px]">{r.fullName}</p>
                              {r.userName && r.userName !== r.fullName && (
                                <p className="text-gray-400 text-xs">via {r.userName}</p>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                r.certificateType === 'Mass Intention'
                                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                                  : r.certificateType === 'Appointment'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-burgundy-50 text-burgundy-700 border-burgundy-200'
                              }`}>
                                {r.certificateType}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-600 text-xs max-w-[120px] truncate" title={r.purpose}>
                              {r.purpose || '—'}
                            </td>
                            <td className="py-3 px-3"><Badge status={r.status} /></td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.source === 'kiosk' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
                                {r.source === 'kiosk' ? 'Kiosk' : 'Web'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500 text-xs font-mono">
                              {r.appointmentDate || '—'}
                            </td>
                            <td className="py-3 px-3 text-gray-400 text-xs font-mono">{r.createdAt}</td>
                            <td className="py-3 px-3 text-xs font-bold">
                              {r.amountDue > 0
                                ? <span className="text-green-700">₱{r.amountDue.toLocaleString()}</span>
                                : <span className="text-gray-300">—</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Financial Ledger ────────────────────────────────── */}
                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                  <div className="card shadow-sm p-0 overflow-hidden">
                    <div className="bg-cream-50 p-6 border-b border-cream-200">
                      <h3 className="text-burgundy-900 font-bold text-lg uppercase tracking-wide">Recent Financial Ledger</h3>
                      <p className="text-gray-500 text-xs mt-1">Last 10 approved / released requests with fees</p>
                    </div>
                    <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-cream-100 text-gray-500 text-left sticky top-0 z-10">
                          <tr>
                            <th className="py-3 px-4 font-bold text-xs uppercase">Date</th>
                            <th className="py-3 px-4 font-bold text-xs uppercase">Type</th>
                            <th className="py-3 px-4 font-bold text-xs uppercase">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-100">
                          {ledger.length > 0 ? ledger.map((item, i) => (
                            <tr key={i} className="hover:bg-cream-50">
                              <td className="py-3 px-4 font-mono text-gray-400 text-xs">{item.date}</td>
                              <td className="py-3 px-4 font-bold text-burgundy-800">{item.type}</td>
                              <td className="py-3 px-4 font-bold text-green-700">₱{Number(item.amount).toLocaleString()}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={3} className="py-6 text-center text-gray-400 italic">No approved requests to show yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="card shadow-sm">
                    <h3 className="text-burgundy-900 font-bold text-lg mb-5 uppercase tracking-wide">Status Breakdown</h3>
                    <div className="space-y-3">
                      {['Pending','Processing','Approved','Released','Rejected','Cancelled'].map(s => {
                        const count = allRequests.filter(r => r.status === s).length;
                        const pct   = allRequests.length > 0 ? Math.round((count / allRequests.length) * 100) : 0;
                        const colors = {
                          Pending: 'bg-amber-400', Processing: 'bg-blue-500', Approved: 'bg-green-500',
                          Released: 'bg-purple-500', Rejected: 'bg-red-500', Cancelled: 'bg-gray-400',
                        };
                        return (
                          <div key={s}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-gray-700">{s}</span>
                              <span className="text-gray-500 font-mono">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-cream-200 rounded-full h-2">
                              <div className={`${colors[s]} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Audit Logs ──────────────────────────────────────── */}
                <div className="card shadow-md border-cream-300">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-cream-200">
                    <h2 className="font-head text-2xl font-bold text-burgundy-900 tracking-wide uppercase">Audit &amp; Security Logs</h2>
                    <span className="text-xs text-gray-400 italic">Tracking all staff actions for verification integrity.</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b-2 border-cream-200 text-left bg-cream-50 uppercase tracking-widest font-bold text-[10px]">
                          <th className="py-4 px-4">Timestamp</th>
                          <th className="py-4 px-4">Administrator</th>
                          <th className="py-4 px-4">Action Taken</th>
                          <th className="py-4 px-4">Request Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-cream-50">
                            <td className="py-4 px-4 text-gray-400 font-mono text-xs">{log.time}</td>
                            <td className="py-4 px-4 font-bold text-burgundy-900">{log.admin}</td>
                            <td className="py-4 px-4"><span className="bg-burgundy-100 text-burgundy-700 px-3 py-1 rounded-full font-bold text-[10px]">{log.action}</span></td>
                            <td className="py-4 px-4 font-mono font-bold text-gray-500">{log.target}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-400 italic">No administrator actions have been logged yet.</td>
                          </tr>
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
