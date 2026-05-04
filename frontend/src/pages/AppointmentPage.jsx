import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SmartQLogo from '../components/common/SmartQLogo';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';

const today = new Date();
const YEAR  = today.getFullYear();
const MONTH = today.getMonth();

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const SERVICES = [
  { id: 'baptism',      title: 'Baptismal Ceremony',   desc: 'Schedule a baptismal ceremony',   icon: '💧' },
  { id: 'confirmation', title: 'Confirmation',          desc: 'Schedule a confirmation ceremony', icon: '✝️' },
  { id: 'wedding',      title: 'Wedding Ceremony',       desc: 'Schedule a wedding ceremony',      icon: '💍' },
  { id: 'counseling',   title: 'Counseling Session',    desc: 'Schedule a counseling session',    icon: '🙏' },
];

const TIME_SLOTS = {
  morning:   ['09:00', '10:00', '11:00'],
  afternoon: ['13:00', '14:00', '15:00', '16:00'],
};

function formatTime12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${period}`;
}

const STEPS = ['Select Service', 'Choose Date & Time', 'Contact Details', 'Confirm'];

export default function AppointmentPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [step, setStep]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [done, setDone]   = useState(null);

  // Calendar state
  const [viewMonth, setViewMonth] = useState(MONTH);
  const [viewYear,  setViewYear]  = useState(YEAR);

  const [formData, setFormData] = useState({
    service:  '',
    selDay:   null,
    selMonth: null,
    selYear:  null,
    time:     '',
    name:     user?.name || '',
    email:    user?.email || '',
    phone:    '',
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDayOfMonth(viewYear, viewMonth);

  function isBlocked(day) {
    const dt = new Date(viewYear, viewMonth, day);
    return dt <= today; // can't pick past dates
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setFormData(f => ({ ...f, selDay: null, time: '' }));
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setFormData(f => ({ ...f, selDay: null, time: '' }));
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  async function handleConfirm() {
    if (!user) { navigate('/login'); return; }

    const month    = String(formData.selMonth + 1).padStart(2, '0');
    const day      = String(formData.selDay).padStart(2, '0');
    const apptDate = `${formData.selYear}-${month}-${day}`;
    const service  = SERVICES.find(s => s.id === formData.service);

    setLoading(true);
    setApiError('');
    try {
      const { data } = await axiosInstance.post('/requests', {
        fullName:        formData.name,
        certificateType: 'Appointment',
        purpose:         service?.title || formData.service,
        contactNumber:   formData.phone,
        appointmentDate: apptDate,
        appointmentTime: formData.time,
        notes:           `Email: ${formData.email}`,
        source:          'online',
      });
      setDone(data.request);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Success Screen ─────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-panel-right">
        <div className="sys-header flex items-center gap-4">
          <Link to="/" aria-label="Back to home"><SmartQLogo height={56} /></Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans">Appointment Scheduling</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full text-center animate-slide-up bg-white/80 backdrop-blur border border-cream-300 rounded-2xl shadow-xl p-14">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-head text-3xl font-bold text-burgundy-900 uppercase tracking-widest mb-3">
              Appointment Confirmed!
            </h1>
            <p className="text-gray-600 text-base mb-2">
              Your appointment has been received. Reference ID: <strong className="text-burgundy-800">#{done.id}</strong>
            </p>
            <p className="text-gray-500 text-sm mb-8 italic">
              You can track your appointment status using this ID.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/" className="btn-secondary py-3 px-8">Back to Home</Link>
              <Link to="/track" className="btn-primary py-3 px-8 font-bold">Track Status</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-panel-right relative">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Back to home"><SmartQLogo height={56} /></Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans">
            Appointment Scheduling
          </span>
        </div>
        <Link to="/" className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2 px-6 rounded-md shadow transition text-base">
          ← Back to Home
        </Link>
      </div>

      {/* ── Split Panel ─────────────────────────────────────────────────────── */}
      <div className="split-window flex-1">
        <aside className="panel-left animate-slide-in-l">
          <div className="panel-left-header">
            <SmartQLogo height={64} />
            <p className="text-cream-300 text-sm mt-5 text-center leading-relaxed">
              Sacramental Records<br />Request System
            </p>
          </div>

          <div className="mt-6">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">
              Appointment Steps
            </p>
            {STEPS.map((s, i) => {
              const isActive = step === i + 1;
              const isPast   = step > i + 1;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-md mb-2 transition-colors ${isActive ? 'bg-cream-200 text-burgundy-900 shadow-md font-bold' : 'text-cream-200'}`}
                >
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isActive ? 'bg-burgundy-700 text-cream-200' : isPast ? 'bg-green-600 text-white' : 'bg-burgundy-800 text-cream-400'}`}>
                    {isPast ? '✓' : i + 1}
                  </span>
                  <span className="text-sm">{s}</span>
                </div>
              );
            })}
          </div>

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

        {/* ── Main panel ────────────────────────────────────────────────────── */}
        <main className="panel-right flex items-center justify-center relative">
          <div className="panel-right-content w-full max-w-2xl animate-slide-up bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-cream-300 shadow-lg">

            {apiError && <div className="alert-error mb-6">{apiError}</div>}

            {/* ── Step 1: Select Service ────────────────────────────────── */}
            {step === 1 && (
              <div>
                <h1 className="right-section-title">Select Service</h1>
                <p className="text-gray-600 text-base mb-6 -mt-2">Choose the type of appointment you need to schedule.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SERVICES.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setFormData({ ...formData, service: s.id })}
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${formData.service === s.id ? 'border-burgundy-600 bg-burgundy-50 shadow-md' : 'border-cream-300 hover:border-burgundy-400 bg-white'}`}
                    >
                      <div className="text-3xl mb-2">{s.icon}</div>
                      <h3 className="font-bold text-burgundy-900 text-lg mb-1">{s.title}</h3>
                      <p className="text-sm text-gray-600">{s.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={nextStep} disabled={!formData.service} className="btn-primary py-3.5 px-8 text-base font-bold">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Date & Time ───────────────────────────────────── */}
            {step === 2 && (
              <div>
                <h1 className="right-section-title">Choose Date &amp; Time</h1>
                <p className="text-gray-600 text-base mb-6 -mt-2">Select an available day and time slot.</p>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Calendar */}
                  <div className="flex-1 bg-cream-50 border border-cream-300 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-900 font-bold flex items-center justify-center">‹</button>
                      <span className="font-head font-bold text-burgundy-900 text-base">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                      <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full bg-burgundy-100 hover:bg-burgundy-200 text-burgundy-900 font-bold flex items-center justify-center">›</button>
                    </div>
                    <div className="grid grid-cols-7 mb-2">
                      {DAY_NAMES.map(d => (
                        <div key={d} className="text-center text-[11px] font-bold text-gray-500 uppercase">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1">
                      {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const blocked    = isBlocked(day);
                        const isSelected = formData.selDay === day && formData.selMonth === viewMonth && formData.selYear === viewYear;
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={blocked}
                            onClick={() => setFormData(f => ({ ...f, selDay: day, selMonth: viewMonth, selYear: viewYear, time: '' }))}
                            className={`
                              mx-auto w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center transition-all
                              ${isSelected ? 'bg-burgundy-700 text-white font-bold shadow-md scale-110'
                                : blocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-cream-200 text-burgundy-900 hover:bg-cream-400 cursor-pointer'}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="w-full md:w-52">
                    {formData.selDay ? (
                      <div className="animate-fade-in space-y-4">
                        <div>
                          <h3 className="font-bold text-burgundy-900 mb-2 border-b border-cream-300 pb-1 text-sm">Morning</h3>
                          <div className="space-y-2">
                            {TIME_SLOTS.morning.map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setFormData(f => ({ ...f, time: t }))}
                                className={`w-full py-2 px-3 text-sm rounded border text-left transition-colors ${formData.time === t ? 'bg-burgundy-700 text-white border-burgundy-700 font-bold' : 'bg-white border-cream-400 text-gray-700 hover:border-burgundy-500'}`}
                              >
                                {formatTime12h(t)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-burgundy-900 mb-2 border-b border-cream-300 pb-1 text-sm">Afternoon</h3>
                          <div className="space-y-2">
                            {TIME_SLOTS.afternoon.map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setFormData(f => ({ ...f, time: t }))}
                                className={`w-full py-2 px-3 text-sm rounded border text-left transition-colors ${formData.time === t ? 'bg-burgundy-700 text-white border-burgundy-700 font-bold' : 'bg-white border-cream-400 text-gray-700 hover:border-burgundy-500'}`}
                              >
                                {formatTime12h(t)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-4 border-2 border-dashed border-cream-300 rounded-lg text-gray-400 text-sm">
                        Please select an available date first.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={prevStep} className="btn-secondary py-3.5 px-8 text-base">Back</button>
                  <button onClick={nextStep} disabled={!formData.selDay || !formData.time} className="btn-primary py-3.5 px-8 text-base font-bold">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Contact Details ───────────────────────────────── */}
            {step === 3 && (
              <div>
                <h1 className="right-section-title">Contact Details</h1>
                <p className="text-gray-600 text-base mb-6 -mt-2">Provide your information so we can confirm your appointment.</p>

                <div className="space-y-5">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-input" placeholder="Juan Dela Cruz"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="you@example.com"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-input" placeholder="09123456789"
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={prevStep} className="btn-secondary py-3.5 px-8 text-base">Back</button>
                  <button onClick={nextStep} disabled={!formData.name} className="btn-primary py-3.5 px-8 text-base font-bold">
                    Review
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4: Confirm ───────────────────────────────────────── */}
            {step === 4 && (
              <div className="text-center">
                <h1 className="text-3xl font-bold text-burgundy-900 mb-2 font-head uppercase">Ready to Confirm</h1>
                <p className="text-gray-600 text-base mb-8">Please review your appointment details below.</p>

                <div className="bg-cream-50 border border-cream-300 rounded-lg p-6 text-left max-w-md mx-auto mb-8 shadow-sm">
                  <div className="grid grid-cols-3 gap-y-4 text-sm">
                    {[
                      ['Service',  SERVICES.find(s => s.id === formData.service)?.title || formData.service],
                      ['Date',     formData.selDay ? `${MONTH_NAMES[formData.selMonth]} ${formData.selDay}, ${formData.selYear}` : '—'],
                      ['Time',     formData.time ? formatTime12h(formData.time) : '—'],
                      ['Name',     formData.name],
                      ['Phone',    formData.phone || '—'],
                    ].map(([label, val]) => (
                      <>
                        <div key={label} className="text-gray-500 font-semibold uppercase tracking-wider">{label}</div>
                        <div className="col-span-2 font-bold text-burgundy-900">{val}</div>
                      </>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={prevStep} className="btn-secondary py-3.5 px-8 text-base">Edit Details</button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="btn-primary py-3.5 px-10 text-lg font-bold shadow-lg"
                  >
                    {loading ? 'Confirming…' : 'Confirm Appointment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
