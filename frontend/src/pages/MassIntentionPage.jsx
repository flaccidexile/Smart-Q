import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SmartQLogo from '../components/common/SmartQLogo';
import useAuth from '../hooks/useAuth';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const today = new Date();
const YEAR  = today.getFullYear();
const MONTH = today.getMonth(); // 0-indexed

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

// Simulate blocked dates: every 1st Sunday = Pro Populo; also some past dates
const PRO_POPULO_DAYS = [4]; // day numbers in month that are "Pro Populo"
const PAST_CUTOFF     = today.getDate() + 2; // must be 48h ahead

const INTENTION_TYPES = [
  { value: 'deceased',     label: '† Deceased (Soul / In Memoriam)' },
  { value: 'healing',      label: '🙏 Healing / Sick' },
  { value: 'birthday',     label: '🎂 Birthday / Anniversary' },
  { value: 'thanksgiving', label: '✨ Special Petition / General Thanksgiving' },
];

const MASS_TIMES = [
  { value: '0600', label: '6:00 AM', blocked: false },
  { value: '0800', label: '8:00 AM (Sundays only)', blocked: false },
  { value: '1000', label: '10:00 AM (Sundays only)', blocked: false },
  { value: '1500', label: '3:00 PM (Sundays only)',  blocked: false },
  { value: '1630', label: '4:30 PM (Sundays only)',  blocked: false },
  { value: '1800', label: '6:00 PM', blocked: false },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

/* ──────────────────────────────────────────────────────────────────────────── */
export default function MassIntentionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    intentionType: '',
    recipientName: '',
    massDate: null,        // day number
    massTime: '',
    requesterName: '',
    contactInfo: '',
    physicalCard: false,
    priestNote: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [viewMonth, setViewMonth] = useState(MONTH);
  const [viewYear,  setViewYear]  = useState(YEAR);
  const [errors, setErrors] = useState({});

  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstDay     = getFirstDayOfMonth(viewYear, viewMonth);

  function isDayBlocked(day) {
    // Block past + less-than-48h days (same month only)
    if (viewYear === YEAR && viewMonth === MONTH && day < PAST_CUTOFF) return 'past';
    if (PRO_POPULO_DAYS.includes(day)) return 'pro-populo';
    return false;
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.intentionType)  e.intentionType  = 'Please select an intention type.';
    if (!form.recipientName.trim()) e.recipientName = "Please enter the recipient's name.";
    if (!form.massDate)        e.massDate       = 'Please select a Mass date.';
    if (!form.massTime)        e.massTime       = 'Please select a Mass time.';
    if (!form.requesterName.trim()) e.requesterName = 'Please enter your full name.';
    if (!form.contactInfo.trim())   e.contactInfo   = 'Please enter your email or phone.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  }

  /* ── Calendar nav ─────────────────────────────────────────────────────── */
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    set('massDate', null); set('massTime', '');
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    set('massDate', null); set('massTime', '');
  }

  /* ── Success screen ───────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sys-header" style={{ height: '92px' }}>
          <Link to="/" aria-label="Home"><SmartQLogo height={64} /></Link>
          <div className="h-8 w-px bg-burgundy-700 mx-3" />
          <span className="text-white font-bold text-xl tracking-widest uppercase font-head flex-1 text-center">
            Request a Mass Intention
          </span>
          <Link to="/" className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2.5 px-7 rounded-md shadow transition text-sm shrink-0">
            ← Back to Home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center bg-panel-right relative overflow-hidden">
          {/* watermark */}
          <span className="pointer-events-none select-none absolute bottom-[-40px] right-[-30px] font-head font-bold text-[260px] leading-none tracking-[-8px] text-[rgba(180,140,100,0.07)] z-0">SMARTQ</span>

          <div className="relative z-10 text-center bg-white/80 backdrop-blur border border-cream-300 rounded-2xl shadow-xl p-16 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-head text-3xl font-bold text-burgundy-900 uppercase tracking-widest mb-3">Request Submitted</h1>
            <p className="text-gray-600 text-base mb-2">
              Your Mass intention for <strong className="text-burgundy-800">{form.recipientName}</strong> has been received.
            </p>
            <p className="text-gray-500 text-sm mb-8 italic">
              You will receive a confirmation via {form.contactInfo.includes('@') ? 'email' : 'SMS'} within 24 hours.
            </p>
            {form.physicalCard && (
              <p className="text-burgundy-700 text-sm font-semibold mb-6 bg-cream-100 border border-cream-300 rounded-md px-4 py-2">
                📬 A physical Mass card will be prepared for you upon pickup.
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button onClick={() => { setSubmitted(false); setForm({ intentionType:'', recipientName:'', massDate:null, massTime:'', requesterName:'', contactInfo:'', physicalCard:false, priestNote:'' }); }} className="btn-secondary py-3 px-8">
                New Request
              </button>
              <Link to="/" className="btn-primary py-3 px-8 font-bold">Return Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Form ────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header className="sys-header" style={{ height: '92px' }} id="mass-intention-header">
        <Link to="/" aria-label="Home" className="shrink-0"><SmartQLogo height={64} /></Link>
        <div className="h-8 w-px bg-burgundy-700 mx-3" aria-hidden="true" />
        <h1 className="text-white font-bold text-xl tracking-widest uppercase font-head flex-1 text-center">
          Request a Mass Intention
        </h1>
        <Link
          to="/"
          id="mass-intention-back-btn"
          className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2.5 px-7 rounded-md shadow transition text-sm shrink-0"
        >
          ← Back to Home
        </Link>
      </header>

      {/* ── Split Window ────────────────────────────────────────────────────── */}
      <div className="split-window flex-1" style={{ minHeight: 'calc(100vh - 92px)' }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <aside className="panel-left animate-slide-in-l">
          <div className="panel-left-header">
            <SmartQLogo height={64} variant="light" />
            <p className="text-cream-300 text-sm mt-4 text-center leading-relaxed font-medium tracking-wide">
              Sacramental Records<br />Request System
            </p>
          </div>

          <div className="flex flex-col gap-0 mt-2">
            <p className="text-cream-400 text-[11px] uppercase tracking-widest mb-3 font-semibold">Quick Actions</p>
            <Link to="/register" id="sidebar-btn-request">
              <button className="panel-btn" style={{ fontSize: '14px', padding: '14px 18px' }}>
                Request Sacramental Records
                <span className="block text-[11px] font-normal text-gray-600 mt-1">
                  (Baptismal &amp; Confirmation Certificate)
                </span>
              </button>
            </Link>
            <Link to="/appointment" id="sidebar-btn-appointment">
              <button className="panel-btn" style={{ fontSize: '14px', padding: '14px 18px' }}>Schedule an Appointment</button>
            </Link>
            <Link to="/kiosk" id="sidebar-btn-kiosk">
              <button className="panel-btn" style={{ fontSize: '14px', padding: '14px 18px' }}>Walk-In Kiosk</button>
            </Link>
            <Link to="/mass-intention" id="sidebar-btn-mass-intention">
              <button className="panel-btn active" style={{ fontSize: '14px', padding: '14px 18px' }}>✝ Request Mass Intention</button>
            </Link>
          </div>

          {/* Stats footer / Sign In */}
          <div className="mt-auto pt-8 border-t border-burgundy-700 space-y-3">
            {user ? (
              <>
                {[
                  { value: '24/7',  label: 'Online Access' },
                  { value: '3 min', label: 'Average Submit Time' },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-cream-300 text-sm">{s.label}</span>
                    <span className="text-cream-200 font-bold text-base">{s.value}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className="text-cream-400 text-xs text-center">Already registered?</p>
                <Link to="/login">
                  <button className="panel-btn mt-3 text-center w-full">Sign In</button>
                </Link>
              </>
            )}
          </div>
        </aside>

        {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
        <main className="panel-right overflow-y-auto" id="mass-intention-main">
          <div className="panel-right-content w-full max-w-5xl mx-auto animate-slide-up">

            {/* ── Theological subtext card ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border-t-8 border-t-burgundy-900 p-8 mb-6 text-center">
              <h2 className="font-head text-2xl font-bold tracking-widest uppercase text-burgundy-900 mb-3">
                ✝ The Tradition of Mass Intentions
              </h2>
              <p className="text-gray-700 text-base leading-relaxed max-w-3xl mx-auto">
                Offering a Mass intention is one of the most profound acts of prayer in the Catholic faith. By dedicating a 
                Holy Mass for a loved one — living or deceased — the faithful unite their intercessions with the sacrifice of 
                Christ on the altar. This sacred tradition, rooted in the theology of the Communion of Saints, allows graces 
                to flow to those for whom the Mass is offered.
              </p>
              <div className="mt-5 text-sm italic text-burgundy-700 font-medium">
                "The Mass is the most perfect form of prayer." — Pope Paul VI
              </div>
            </div>

            {/* ── 48-hour alert ─────────────────────────────────────────────── */}
            <div className="alert-info flex items-start gap-3 mb-8 rounded-xl border-l-4 border-l-burgundy-700 px-5 py-4">
              <span className="text-burgundy-700 text-xl shrink-0 mt-0.5">⏰</span>
              <p className="text-burgundy-800 text-sm italic leading-relaxed">
                <strong className="not-italic font-bold">Note:</strong> Online requests must be submitted at least 
                <strong className="not-italic"> 48 hours prior</strong> to the Mass time for inclusion in the 
                printed liturgy list. Requests submitted after this window will be carried over to the next 
                available Mass.
              </p>
            </div>

            {/* ── Central Form Container ────────────────────────────────────── */}
            <form
              id="mass-intention-form"
              onSubmit={handleSubmit}
              className="bg-white/85 backdrop-blur border border-cream-300 rounded-2xl shadow-lg p-8"
              noValidate
            >
              {/* Section: Intention Details */}
              <p className="form-section-title">✝ Intention Details</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Intention Type */}
                <div>
                  <label className="form-label" htmlFor="intention-type">Intention Type</label>
                  <select
                    id="intention-type"
                    className="form-input"
                    value={form.intentionType}
                    onChange={e => set('intentionType', e.target.value)}
                  >
                    <option value="">— Select intention type —</option>
                    {INTENTION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {errors.intentionType && <p className="form-error">{errors.intentionType}</p>}
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="form-label" htmlFor="recipient-name">Name of Person / Entity</label>
                  <input
                    id="recipient-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Juan Dela Cruz / The Dela Cruz Family"
                    value={form.recipientName}
                    onChange={e => set('recipientName', e.target.value)}
                  />
                  {errors.recipientName && <p className="form-error">{errors.recipientName}</p>}
                </div>
              </div>

              {/* Section: Mass Schedule */}
              <p className="form-section-title mt-2">📅 Mass Schedule</p>
              {(errors.massDate || errors.massTime) && (
                <p className="form-error mb-3">{errors.massDate || errors.massTime}</p>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Integrated Calendar */}
                <div className="bg-cream-50 border border-cream-300 rounded-xl p-5 shadow-sm">
                  {/* Month Nav */}
                  <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-900 font-bold flex items-center justify-center transition-colors">‹</button>
                    <span className="font-head font-bold text-burgundy-900 text-base tracking-wide">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-900 font-bold flex items-center justify-center transition-colors">›</button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {DAY_NAMES.map(d => (
                      <div key={d} className="text-center text-[11px] font-bold text-gray-500 uppercase">{d}</div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const blocked = isDayBlocked(day);
                      const isSelected = form.massDate === day && viewMonth === MONTH;
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={!!blocked}
                          title={blocked === 'pro-populo' ? 'Pro Populo — For the People (not available)' : blocked === 'past' ? 'Must be 48h in advance' : ''}
                          onClick={() => { set('massDate', day); set('massTime', ''); }}
                          className={`
                            mx-auto w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center
                            transition-all duration-150 select-none
                            ${isSelected
                              ? 'bg-burgundy-700 text-white font-bold shadow-md scale-110'
                              : blocked
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                : 'bg-cream-200 text-burgundy-900 hover:bg-cream-400 cursor-pointer'
                            }
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex gap-4 flex-wrap text-[11px] text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-burgundy-700 inline-block" />Selected</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cream-300 inline-block" />Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />Unavailable / Pro Populo</span>
                  </div>
                </div>

                {/* Mass Time Selector */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-burgundy-800 uppercase tracking-wide mb-1">Select Mass Time</p>
                  {form.massDate ? (
                    MASS_TIMES.map(t => {
                      const selected = form.massTime === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => set('massTime', t.value)}
                          className={`
                            w-full text-left px-5 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-150
                            ${selected
                              ? 'border-burgundy-700 bg-burgundy-700 text-white shadow-md'
                              : 'border-cream-300 bg-white text-gray-700 hover:border-burgundy-400 hover:bg-cream-50'
                            }
                          `}
                        >
                          {selected ? '✓ ' : ''}{t.label}
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-cream-300 rounded-xl text-gray-400 text-sm text-center py-10 px-4">
                      ← Please select a date first<br />to see available Mass times.
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Requester Info */}
              <p className="form-section-title mt-2">👤 Your Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="form-label" htmlFor="requester-name">Full Name</label>
                  <input
                    id="requester-name"
                    type="text"
                    className="form-input"
                    placeholder="Your full name"
                    value={form.requesterName}
                    onChange={e => set('requesterName', e.target.value)}
                  />
                  {errors.requesterName && <p className="form-error">{errors.requesterName}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="contact-info">Contact Info (Email / Phone)</label>
                  <input
                    id="contact-info"
                    type="text"
                    className="form-input"
                    placeholder="e.g. juan@email.com or 09171234567"
                    value={form.contactInfo}
                    onChange={e => set('contactInfo', e.target.value)}
                  />
                  {errors.contactInfo && <p className="form-error">{errors.contactInfo}</p>}
                </div>
              </div>

              {/* Section: Additional Options */}
              <p className="form-section-title mt-2">⚙️ Additional Options</p>

              {/* Physical Mass Card Toggle */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-cream-50 border border-cream-200 rounded-xl">
                <button
                  type="button"
                  id="physical-card-toggle"
                  role="switch"
                  aria-checked={form.physicalCard}
                  onClick={() => set('physicalCard', !form.physicalCard)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-burgundy-400 shrink-0
                    ${form.physicalCard ? 'bg-burgundy-700' : 'bg-gray-300'}
                  `}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.physicalCard ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <div>
                  <p className="font-semibold text-burgundy-900 text-sm">Physical Mass Card Required?</p>
                  <p className="text-gray-500 text-xs mt-0.5">A printed Mass card will be prepared for collection at the parish office.</p>
                </div>
              </div>

              {/* Priest Note */}
              <div className="mb-8">
                <label className="form-label" htmlFor="priest-note">Optional Note for the Priest</label>
                <textarea
                  id="priest-note"
                  className="form-input resize-none"
                  rows={3}
                  placeholder="e.g. 'Safe travel to Canada', 'Successful surgery for Lola Nena', 'Thanksgiving for 50th wedding anniversary'…"
                  value={form.priestNote}
                  onChange={e => set('priestNote', e.target.value)}
                />
                <p className="text-gray-400 text-xs mt-1">This note is private and shared only with the celebrating priest.</p>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between gap-4 border-t border-cream-300 pt-6">
                <Link to="/" className="btn-secondary py-3.5 px-8 text-sm font-semibold">Cancel</Link>
                <button
                  type="submit"
                  id="mass-intention-submit"
                  className="btn-primary text-base font-bold py-4 px-12 shadow-lg"
                  style={{ fontSize: '1rem', letterSpacing: '0.05em' }}
                >
                  Submit Request →
                </button>
              </div>
            </form>

            {/* Spacer */}
            <div className="h-12" />
          </div>
        </main>
      </div>
    </div>
  );
}
