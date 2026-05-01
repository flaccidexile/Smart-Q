import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import SmartQLogo from '../../components/common/SmartQLogo';
import useAuth from '../../hooks/useAuth';

export default function CalendarPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const { data } = await axiosInstance.get('/admin/calendar');
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Failed to load calendar", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Calendar generation logic
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon, etc.
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = selectedDate.toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Check for dynamic conflicts
  const conflicts = appointments.filter(a => a.conflict);

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
            MANAGE CALENDAR
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
              📅
            </div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">Calendar Admin</p>
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
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500" style={{ fontSize: '15px', padding: '14px 18px' }}>📅 Manage Calendar</button>
            </Link>
            <Link to="/admin/reports" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>📈 System Reports</button>
            </Link>
            <Link to="/track" className="block">
              <button className="w-full text-left font-medium rounded-md transition-all duration-150 select-none text-cream-100 hover:bg-burgundy-800" style={{ fontSize: '15px', padding: '14px 18px' }}>🔍 Track ID</button>
            </Link>
          </div>

          {/* Block Dates Tool */}
          <div className="mt-8 pt-6 border-t border-burgundy-700">
             <p className="text-cream-400 text-[10px] uppercase tracking-widest mb-4 font-bold">Availability Tool</p>
             <button className="btn-secondary w-full text-xs py-3 mb-3">🚫 Block Selected Date</button>
             <div className="bg-burgundy-900/40 rounded-lg p-4">
                <p className="text-cream-300 text-[11px] leading-relaxed italic">Select a date on the master schedule to prevent public bookings for holidays or parish events.</p>
             </div>
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
                <h1 className="right-section-title mb-0 pb-0 border-0 text-3xl">Master Schedule</h1>
                <p className="text-gray-600 text-base mt-2">Centralized view of all web and kiosk appointments.</p>
              </div>
              <div className="flex gap-3">
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Web
                 </div>
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span> Kiosk
                 </div>
                 <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span> Conflict
                 </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Calendar Grid */}
              <div className="lg:col-span-3 card p-0 overflow-hidden shadow-md">
                <div className="bg-burgundy-900 p-6 flex justify-between items-center text-white">
                   <h2 className="text-2xl font-bold font-head uppercase tracking-widest">{monthName} {currentYear}</h2>
                   <div className="flex gap-2">
                      <button onClick={handlePrevMonth} className="p-2 hover:bg-burgundy-800 rounded transition-colors">←</button>
                      <button onClick={handleNextMonth} className="p-2 hover:bg-burgundy-800 rounded transition-colors">→</button>
                   </div>
                </div>
                <div className="grid grid-cols-7 bg-burgundy-800 text-cream-200 text-center font-bold py-3 border-b border-burgundy-700">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-px bg-cream-300">
                   {/* Empty days for start of month offset */}
                   {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="bg-cream-50 h-32 opacity-50"></div>)}
                   
                   {calendarDays.map(d => {
                      const dayStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                      const dayApps = appointments.filter(a => a.date === dayStr);
                      const hasConflict = dayApps.some(a => a.conflict);

                      return (
                        <div key={d} className="bg-white h-32 p-2 hover:bg-cream-50 transition-colors relative group cursor-pointer border border-transparent hover:border-burgundy-200 overflow-y-auto">
                           <span className="text-gray-400 font-bold text-sm">{d}</span>
                           <div className="mt-1 space-y-1">
                              {dayApps.map((a, idx) => (
                                <div key={idx} className={`text-[10px] p-1 rounded-sm text-white font-bold truncate ${a.conflict ? 'bg-red-500 animate-pulse' : a.source === 'Web' ? 'bg-blue-500' : 'bg-purple-500'}`} title={`Request #${a.id}: ${a.time} - ${a.type}`}>
                                   {a.time} - {a.type}
                                </div>
                              ))}
                           </div>
                           {hasConflict && (
                             <div className="absolute inset-0 bg-red-100/30 pointer-events-none border-2 border-red-500/50"></div>
                           )}
                        </div>
                      );
                   })}
                </div>
              </div>

              {/* Slot Config & Sidebar */}
              <div className="space-y-6">
                <div className="card shadow-sm border-cream-400">
                   <h3 className="text-burgundy-900 font-bold text-lg mb-4 uppercase tracking-wide">Slot Configuration</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase">Mass Intentions Cap</label>
                         <input type="number" defaultValue={5} className="form-input mt-1" />
                         <p className="text-[10px] text-gray-400 mt-1">Maximum bookings per hour.</p>
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

                {conflicts.length > 0 && (
                  <div className="card shadow-sm border-amber-300 bg-amber-50">
                     <h3 className="text-amber-800 font-bold text-lg mb-3 uppercase tracking-wide">⚠️ Alert</h3>
                     <p className="text-amber-900 text-sm leading-relaxed font-medium">
                       Conflicts detected on {conflicts.length} appointment(s). Please verify schedule overlap.
                     </p>
                     <button className="text-amber-700 underline text-xs font-bold mt-4">Resolve Conflicts →</button>
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
