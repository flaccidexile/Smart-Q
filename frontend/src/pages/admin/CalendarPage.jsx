import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SmartQLogo from '../../components/common/SmartQLogo';
import useAuth from '../../hooks/useAuth';

/* ── Mock Mass Intention dates (sync with MassIntentionsView) ────────────── */
const MOCK_MASS_INTENTIONS = [
  { date: '2026-05-10', time: '6:00 AM',  recipientName: 'Lolo Jose Santos',     intentionType: 'deceased'    },
  { date: '2026-05-11', time: '6:00 PM',  recipientName: 'Ana Reyes',            intentionType: 'healing'     },
  { date: '2026-05-15', time: '8:00 AM',  recipientName: 'The Dela Cruz Family', intentionType: 'birthday'    },
  { date: '2026-05-18', time: '10:00 AM', recipientName: 'St. Joseph Youth',     intentionType: 'thanksgiving'},
];

const INTENTION_COLORS = {
  deceased:     'bg-gray-600',
  healing:      'bg-blue-500',
  birthday:     'bg-purple-500',
  thanksgiving: 'bg-green-600',
};

export default function CalendarPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [viewDate, setViewDate]         = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedDay, setSelectedDay]   = useState(null);   // YYYY-MM-DD
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [lastResolvedIds, setLastResolvedIds] = useState(null); // For undo
  const [successMsg, setSuccessMsg]     = useState('');

  const fetchCalendar = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/calendar');
      setAppointments(data.appointments || []);
      if (data.blockedDates) {
        setBlockedDates(new Set(data.blockedDates));
      }
    } catch {
      /* backend not yet wired — silently continue with empty list */
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ── Calendar helpers ──────────────────────────────────────────────────── */
  const currentYear     = viewDate.getFullYear();
  const currentMonth    = viewDate.getMonth();
  const daysInMonth     = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays    = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName       = viewDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const toKey = (d) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  /* ── Functional: Block a selected date ────────────────────────────────── */
  const handleBlockDate = async () => {
    if (!selectedDay) { alert('Please click a day on the calendar first.'); return; }
    try {
      const { data } = await axiosInstance.post('/admin/calendar/block', { date: selectedDay });
      setBlockedDates(prev => {
        const next = new Set(prev);
        if (data.blocked) next.add(selectedDay);
        else next.delete(selectedDay);
        return next;
      });
      flash(data.message);
    } catch (error) {
      alert('Failed to update blocked date.');
    }
  };

  /* ── Functional: Resolve conflicts ───────────────────────────────────── */
  const activeConflicts = appointments.filter(a => a.conflict && !a.conflictResolved);

  const handleResolveConflicts = async () => {
    if (activeConflicts.length === 0) { alert('No active conflicts to resolve.'); return; }
    const ids = activeConflicts.map(a => a.id);
    try {
      await axiosInstance.post('/admin/calendar/resolve', { ids, resolve: true });
      setLastResolvedIds(ids);
      setAppointments(prev => prev.map(a => ids.includes(a.id) ? { ...a, conflictResolved: true } : a));
      flash(`${ids.length} conflict(s) marked as resolved.`);
    } catch (error) {
      alert('Failed to resolve conflicts.');
    }
  };

  const handleUndoResolve = async () => {
    if (!lastResolvedIds || lastResolvedIds.length === 0) return;
    try {
      await axiosInstance.post('/admin/calendar/resolve', { ids: lastResolvedIds, resolve: false });
      setAppointments(prev => prev.map(a => lastResolvedIds.includes(a.id) ? { ...a, conflictResolved: false } : a));
      setLastResolvedIds(null);
      flash(`Undo successful. Conflicts restored.`);
    } catch (error) {
      alert('Failed to undo resolve.');
    }
  };

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3500); };

  /* ── Build a map: dateKey → {appointments[], massIntentions[]} ─────────── */
  const dayData = {};
  appointments
    .filter(a => !a.conflictResolved)
    .forEach(a => {
      if (!dayData[a.date]) dayData[a.date] = { apps: [], intentions: [] };
      dayData[a.date].apps.push(a);
    });
  MOCK_MASS_INTENTIONS.forEach(m => {
    if (!dayData[m.date]) dayData[m.date] = { apps: [], intentions: [] };
    dayData[m.date].intentions.push(m);
  });

  return (
    <div className="min-h-screen flex flex-col bg-panel-right">

      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" aria-label="Back to dashboard"><SmartQLogo height={56} /></Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            MANAGE CALENDAR
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
            <div className="w-16 h-16 rounded-full bg-cream-400/20 border border-cream-400/30 flex items-center justify-center text-3xl mb-2">📅</div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">Calendar Admin</p>
            <p className="text-cream-400 text-base font-bold mt-1">{user?.name}</p>
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">Navigation</p>
            {[
              { to: '/admin',                 label: '📊 Dashboard'        },
              { to: '/admin/requests',        label: '📋 Verify Requests'  },
              { to: '/admin/mass-intentions', label: '✝ Mass Intentions'   },
              { to: '/admin/calendar',        label: '📅 Manage Calendar', active: true },
              { to: '/admin/reports',         label: '📈 System Reports'   },
              { to: '/track',                 label: '🔍 Track ID'         },
            ].map(l => (
              <Link key={l.to} to={l.to} className="block">
                <button
                  className={`w-full text-left font-medium rounded-md transition-all duration-150 select-none ${
                    l.active
                      ? 'bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500'
                      : 'text-cream-100 hover:bg-burgundy-800'
                  }`}
                  style={{ fontSize: '15px', padding: '14px 18px' }}
                >{l.label}</button>
              </Link>
            ))}
          </div>

          {/* ── Availability Tool ─────────────────────────────────────────── */}
          <div className="mt-8 pt-6 border-t border-burgundy-700">
            <p className="text-cream-400 text-[10px] uppercase tracking-widest mb-4 font-bold">Availability Tool</p>

            {/* Selected day display */}
            <div className="bg-burgundy-900/40 rounded-lg px-4 py-3 mb-3 text-center">
              {selectedDay
                ? <p className="text-cream-200 text-sm font-bold">{selectedDay}</p>
                : <p className="text-cream-500 text-xs italic">Click a day to select it</p>}
              {selectedDay && blockedDates.has(selectedDay) && (
                <span className="text-xs text-red-300 font-bold">🚫 Currently Blocked</span>
              )}
            </div>

            <button
              onClick={handleBlockDate}
              className="btn-secondary w-full text-xs py-3 mb-3"
            >
              {selectedDay && blockedDates.has(selectedDay) ? '✅ Unblock Selected Date' : '🚫 Block Selected Date'}
            </button>

            <div className="bg-burgundy-900/40 rounded-lg p-4">
              <p className="text-cream-300 text-[11px] leading-relaxed italic">
                Select a date on the calendar, then click the button to block or unblock it for public bookings.
              </p>
            </div>
          </div>

          {/* Alerts / Conflicts */}
          {activeConflicts.length > 0 && (
            <div className="mt-4 bg-red-900/30 border border-red-700/50 rounded-lg p-4">
              <p className="text-red-300 text-[11px] font-bold uppercase tracking-widest mb-2">⚠️ Conflicts</p>
              <p className="text-red-200 text-xs leading-relaxed mb-3">
                {activeConflicts.length} scheduling conflict(s) detected.
              </p>
              <button
                onClick={handleResolveConflicts}
                className="w-full py-2 text-[11px] bg-red-700 hover:bg-red-600 text-white rounded font-bold tracking-wide uppercase transition-colors"
              >
                Resolve All Conflicts →
              </button>
            </div>
          )}

          {/* Undo Action */}
          {lastResolvedIds && lastResolvedIds.length > 0 && (
            <div className="mt-4 bg-green-900/30 border border-green-700/50 rounded-lg p-4">
              <p className="text-green-300 text-[11px] font-bold uppercase tracking-widest mb-2">✅ Conflicts Resolved</p>
              <button
                onClick={handleUndoResolve}
                className="w-full py-2 text-[11px] bg-green-700 hover:bg-green-600 text-white rounded font-bold tracking-wide uppercase transition-colors"
              >
                Undo Last Resolve
              </button>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-burgundy-700">
            <button onClick={handleLogout} className="panel-btn mt-3 text-center w-full">Sign Out</button>
          </div>
        </aside>

        {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
        <main className="panel-right flex justify-center">
          <div className="panel-right-content w-full max-w-7xl animate-slide-up">

            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="right-section-title mb-0 pb-0 border-0 text-3xl">Master Schedule</h1>
                <p className="text-gray-600 text-base mt-2">Centralized view of appointments and Mass Intention requests.</p>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Web Appt.</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" /> Kiosk Appt.</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-600 inline-block" /> Mass Intention</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Conflict</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" /> Blocked</span>
              </div>
            </div>

            {/* Success flash */}
            {successMsg && <div className="alert-success mb-4">✅ {successMsg}</div>}

            <div className="grid lg:grid-cols-4 gap-8">

              {/* ── Calendar Grid ────────────────────────────────────────────── */}
              <div className="lg:col-span-3 card p-0 overflow-hidden shadow-md">
                {/* Month header */}
                <div className="bg-burgundy-900 p-6 flex justify-between items-center text-white">
                  <h2 className="text-2xl font-bold font-head uppercase tracking-widest">{monthName} {currentYear}</h2>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-burgundy-800 rounded transition-colors text-xl">←</button>
                    <button onClick={nextMonth} className="p-2 hover:bg-burgundy-800 rounded transition-colors text-xl">→</button>
                  </div>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 bg-burgundy-800 text-cream-200 text-center font-bold py-3 border-b border-burgundy-700">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-px bg-cream-300">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`e-${i}`} className="bg-cream-50 h-32 opacity-40" />
                  ))}

                  {calendarDays.map(d => {
                    const key     = toKey(d);
                    const data    = dayData[key] || { apps: [], intentions: [] };
                    const blocked = blockedDates.has(key);
                    const hasConflict = data.apps.some(a => a.conflict);
                    const isSelected  = selectedDay === key;

                    return (
                      <div
                        key={d}
                        onClick={() => setSelectedDay(isSelected ? null : key)}
                        className={`
                          relative h-32 p-2 cursor-pointer overflow-y-auto transition-all duration-150
                          ${isSelected  ? 'bg-cream-200 ring-2 ring-burgundy-700 ring-inset' : 'bg-white hover:bg-cream-50'}
                          ${blocked     ? 'opacity-60 bg-orange-50' : ''}
                          border border-transparent hover:border-burgundy-200
                        `}
                      >
                        {/* Day number */}
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold text-sm ${isSelected ? 'text-burgundy-900' : 'text-gray-400'}`}>{d}</span>
                          {blocked && <span className="text-[10px] text-orange-600 font-bold">🚫</span>}
                        </div>

                        {/* Conflict highlight */}
                        {hasConflict && !blocked && (
                          <div className="absolute inset-0 bg-red-100/30 pointer-events-none border-2 border-red-400/50" />
                        )}

                        {/* Appointment dots */}
                        <div className="space-y-0.5">
                          {data.apps.map((a, idx) => (
                            <div
                              key={`a-${idx}`}
                              title={`#${a.id}: ${a.time} - ${a.type}`}
                              className={`text-[10px] px-1 py-0.5 rounded-sm text-white font-bold truncate ${
                                a.conflict ? 'bg-red-500 animate-pulse' : a.source === 'Web' ? 'bg-blue-500' : 'bg-purple-500'
                              }`}
                            >
                              {a.time} {a.type}
                            </div>
                          ))}

                          {/* Mass Intention dots */}
                          {data.intentions.map((m, idx) => (
                            <div
                              key={`m-${idx}`}
                              title={`✝ Mass Intention: ${m.recipientName} @ ${m.time}`}
                              className={`text-[10px] px-1 py-0.5 rounded-sm text-white font-bold truncate ${INTENTION_COLORS[m.intentionType] || 'bg-gray-500'}`}
                            >
                              ✝ {m.time}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Side panel: Config + Day Detail ─────────────────────────── */}
              <div className="space-y-6">

                {/* Day detail when selected */}
                {selectedDay && (dayData[selectedDay]?.apps.length > 0 || dayData[selectedDay]?.intentions.length > 0) ? (
                  <div className="card shadow-sm border-cream-400">
                    <h3 className="text-burgundy-900 font-bold text-base mb-3 uppercase tracking-wide">
                      📅 {selectedDay}
                    </h3>
                    <div className="space-y-2">
                      {(dayData[selectedDay]?.apps || []).map((a, i) => (
                        <div key={i} className={`text-xs p-2 rounded font-semibold text-white ${a.conflict ? 'bg-red-500' : a.source === 'Web' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                          {a.time} — {a.type} ({a.source})
                        </div>
                      ))}
                      {(dayData[selectedDay]?.intentions || []).map((m, i) => (
                        <div key={i} className={`text-xs p-2 rounded font-semibold text-white ${INTENTION_COLORS[m.intentionType] || 'bg-gray-500'}`}>
                          ✝ {m.time} — {m.recipientName}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedDay ? (
                  <div className="card shadow-sm text-center py-6 text-gray-400 text-sm">
                    No events on<br /><strong className="text-burgundy-800">{selectedDay}</strong>
                    {blockedDates.has(selectedDay) && <p className="mt-2 text-orange-600 font-bold text-xs">🚫 This date is blocked</p>}
                  </div>
                ) : null}

                {/* Slot Config */}
                <div className="card shadow-sm border-cream-400">
                  <h3 className="text-burgundy-900 font-bold text-lg mb-4 uppercase tracking-wide">Slot Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Mass Intentions Cap / Mass</label>
                      <input type="number" defaultValue={5} className="form-input mt-1" />
                      <p className="text-[10px] text-gray-400 mt-1">Max Mass Intentions per Mass.</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Wedding Slot Interval</label>
                      <select className="form-input mt-1">
                        <option>2 Hours</option>
                        <option>3 Hours</option>
                      </select>
                    </div>
                    <button className="btn-primary w-full text-sm mt-2">Save Settings</button>
                  </div>
                </div>

                {/* Blocked dates summary */}
                {blockedDates.size > 0 && (
                  <div className="card shadow-sm border-orange-300 bg-orange-50">
                    <h3 className="text-orange-800 font-bold text-sm mb-2 uppercase tracking-wide">🚫 Blocked Dates ({blockedDates.size})</h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {[...blockedDates].sort().map(d => (
                        <div key={d} className="flex justify-between items-center text-xs">
                          <span className="text-orange-900 font-mono">{d}</span>
                          <button onClick={() => setBlockedDates(prev => { const n = new Set(prev); n.delete(d); return n; })}
                            className="text-red-600 hover:text-red-800 font-bold ml-2">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
