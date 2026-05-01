import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SmartQLogo from '../../components/common/SmartQLogo';
import useAuth from '../../hooks/useAuth';

export default function ReportsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reportData, setReportData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axiosInstance.get('/admin/reports');
        setReportData(data.reportData || []);
        setTotalRevenue(data.totalRevenue || 0);
        setLedger(data.ledger || []);
        setAuditLogs(data.auditLogs || []);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

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
            SYSTEM REPORTS
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
            <div className="w-16 h-16 rounded-full bg-cream-400/20 border border-cream-400/30 flex items-center justify-center text-3xl mb-2">
              📈
            </div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">Data & Analytics</p>
            <p className="text-cream-400 text-base font-bold mt-1">{user?.name}</p>
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">Navigation</p>
            <Link to="/admin" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📊 Dashboard</button>
            </Link>
            <Link to="/admin/requests" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📋 Verify Requests</button>
            </Link>
            <Link to="/admin/calendar" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📅 Manage Calendar</button>
            </Link>
            <Link to="/admin/reports" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500" style={{ fontSize: '15px', padding: '14px 18px' }}>📈 System Reports</button>
            </Link>
            <Link to="/track" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>🔍 Track ID</button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-burgundy-700">
             <button className="btn-secondary w-full text-xs py-3 mb-2">📥 Export PDF Summary</button>
             <button className="btn-secondary w-full text-xs py-3">📊 Download Excel Log</button>
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
                <h1 className="right-section-title mb-0 pb-0 border-0 text-3xl">Analytics & Productivity</h1>
                <p className="text-gray-600 text-base mt-2">Historical data overview for sacramental requests and operational efficiency.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20 text-gray-500 font-bold">Loading Database Records...</div>
            ) : (
              <>
                {/* Efficiency Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                   {[
                     { label: 'Avg. Processing Time', val: '1.4 Days', icon: '⚡' },
                     { label: 'Request-to-Release', val: '2.8 Days', icon: '📬' },
                     { label: 'Total Revenue (Fees)', val: `₱${totalRevenue.toLocaleString()}`, icon: '💰' },
                     { label: 'Total Donations', val: '₱0', icon: '🙏' },
                   ].map((m, i) => (
                     <div key={i} className="card bg-burgundy-900 text-white p-6 shadow-md border-0">
                        <div className="flex justify-between items-center mb-4 opacity-70">
                           <p className="text-[10px] font-bold uppercase tracking-widest">{m.label}</p>
                           <span>{m.icon}</span>
                        </div>
                        <p className="text-3xl font-bold font-head text-cream-200">{m.val}</p>
                     </div>
                   ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                   {/* Request Volume Chart */}
                   <div className="card shadow-sm">
                      <h3 className="text-burgundy-900 font-bold text-lg mb-8 uppercase tracking-wide">Request Volume Over Time</h3>
                      <div className="h-64 flex items-end justify-center gap-4 px-4 pb-8 border-b-2 border-l-2 border-cream-200 relative">
                         {reportData.map((d, i) => {
                           // Scale height relative to the max value, so the highest bar is always 100%
                           const maxVal = Math.max(...reportData.map(r => r.value), 1);
                           const heightPercent = (d.value / maxVal) * 100;
                           
                           return (
                             <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                                <div className="bg-burgundy-700 w-12 rounded-t-md hover:bg-burgundy-600 transition-all duration-300 relative shadow-md"
                                     style={{ height: `${heightPercent}%` }}>
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-burgundy-900 text-white text-xs font-bold px-2.5 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 whitespace-nowrap">
                                       {d.value} Requests
                                    </span>
                                </div>
                                <p className="text-gray-500 font-bold text-[11px] absolute -bottom-8 uppercase tracking-tighter">{d.label}</p>
                             </div>
                           )
                         })}
                         {reportData.length === 0 && (
                           <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">
                             No data available for the last 6 months.
                           </div>
                         )}
                      </div>
                   </div>

                   {/* Financial Ledger */}
                   <div className="card shadow-sm p-0 overflow-hidden">
                      <div className="bg-cream-50 p-6 border-b border-cream-200">
                         <h3 className="text-burgundy-900 font-bold text-lg uppercase tracking-wide">Recent Financial Ledger</h3>
                      </div>
                      <div className="overflow-x-auto h-[260px] overflow-y-auto">
                         <table className="w-full text-sm">
                            <thead className="bg-cream-100 text-gray-500 text-left sticky top-0 z-10 shadow-sm">
                               <tr>
                                  <th className="py-3 px-4 font-bold text-xs uppercase">Date</th>
                                  <th className="py-3 px-4 font-bold text-xs uppercase">Type</th>
                                  <th className="py-3 px-4 font-bold text-xs uppercase">Amount</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-cream-100">
                               {ledger.length > 0 ? ledger.map((item, i) => (
                                 <tr key={i} className="hover:bg-cream-50">
                                    <td className="py-3 px-4 font-mono text-gray-400">{item.date}</td>
                                    <td className="py-3 px-4 font-bold text-burgundy-800">{item.type}</td>
                                    <td className="py-3 px-4 font-bold text-green-700">₱{item.amount.toLocaleString()}</td>
                                 </tr>
                               )) : (
                                 <tr>
                                    <td colSpan="3" className="py-6 text-center text-gray-400 italic">No approved requests to show yet.</td>
                                 </tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>

                {/* Audit & Security Logs */}
                <div className="card shadow-md border-cream-300">
                   <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-cream-200">
                      <h2 className="font-head text-2xl font-bold text-burgundy-900 tracking-wide uppercase">Audit & Security Logs</h2>
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
                                 <td colSpan="4" className="py-6 text-center text-gray-400 italic">No administrator actions have been logged yet.</td>
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
