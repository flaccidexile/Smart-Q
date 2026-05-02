import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SmartQLogo from '../components/common/SmartQLogo';
import useAuth from '../hooks/useAuth';

export default function AppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    date: null,
    time: '',
    name: '',
    email: '',
    phone: '',
  });

  const steps = [
    'Select Service',
    'Choose Date & Time',
    'Contact Details',
    'Confirmation'
  ];

  const services = [
    { id: 'baptism', title: 'Baptismal', desc: 'Schedule a baptismal ceremony' },
    { id: 'confirmation', title: 'Confirmation', desc: 'Schedule a confirmation ceremony' },
    { id: 'wedding', title: 'Wedding', desc: 'Schedule a wedding ceremony' },
    { id: 'counseling', title: 'Counseling', desc: 'Schedule a counseling session' },
  ];

  // Dummy calendar data
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const availableDays = [2, 5, 8, 12, 15, 18, 22, 25, 28]; // dummy available dates

  const timeSlots = {
    morning: ['09:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen flex flex-col bg-panel-right relative">
      {/* ── Navbar & Branding ──────────────────────────────────────────────── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Back to home">
            <SmartQLogo height={56} />
          </Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans">
            Appointment Scheduling
          </span>
        </div>
        <Link 
          to="/" 
          className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2 px-6 rounded-md shadow transition text-base"
        >
          ← Back to Home
        </Link>
      </div>

      {/* ── Sidebar & Progress Tracking ──────────────────────────────────────── */}
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
            {steps.map((s, i) => {
              const isActive = step === i + 1;
              const isPast = step > i + 1;
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

        {/* ── Integrated Scheduling Interface ──────────────────────────────────── */}
        <main className="panel-right flex items-center justify-center relative">
          
          <div className="panel-right-content w-full max-w-2xl animate-slide-up bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-cream-300 shadow-lg">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div>
                <h1 className="right-section-title">Select Service</h1>
                <p className="text-gray-600 text-base mb-6 -mt-2">Choose the type of appointment you need to schedule.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setFormData({...formData, service: s.id})}
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all duration-200 ${formData.service === s.id ? 'border-burgundy-600 bg-burgundy-50 shadow-md' : 'border-cream-300 hover:border-burgundy-400 bg-white'}`}
                    >
                      <h3 className="font-bold text-burgundy-900 text-lg mb-1">{s.title}</h3>
                      <p className="text-sm text-gray-600">{s.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={nextStep} 
                    disabled={!formData.service}
                    className="btn-primary py-3.5 px-8 text-base font-bold"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div>
                <h1 className="right-section-title">Choose Date & Time</h1>
                <p className="text-gray-600 text-base mb-6 -mt-2">Select an available day and time slot.</p>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Calendar */}
                  <div className="flex-1 bg-white p-4 rounded-lg border border-cream-300 shadow-sm">
                    <div className="text-center font-bold text-burgundy-900 mb-4 text-lg">May 2026</div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                      <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Empty slots for start of month */}
                      <div className="p-2"></div><div className="p-2"></div><div className="p-2"></div><div className="p-2"></div>
                      
                      {daysInMonth.map(day => {
                        const isAvailable = availableDays.includes(day);
                        const isSelected = formData.date === day;
                        return (
                          <div 
                            key={day}
                            onClick={() => isAvailable && setFormData({...formData, date: day, time: ''})}
                            className={`p-2 rounded-md text-sm transition-all ${
                              isSelected ? 'bg-burgundy-700 text-white font-bold shadow-md transform scale-110' : 
                              isAvailable ? 'bg-cream-200 text-burgundy-900 cursor-pointer hover:bg-cream-300 font-medium' : 
                              'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="w-full md:w-48">
                    {formData.date ? (
                      <div className="animate-fade-in">
                        <h3 className="font-bold text-burgundy-900 mb-3 border-b border-cream-300 pb-1">Morning</h3>
                        <div className="space-y-2 mb-4">
                          {timeSlots.morning.map(time => (
                            <button
                              key={time}
                              onClick={() => setFormData({...formData, time})}
                              className={`w-full py-2 px-3 text-sm rounded border text-left transition-colors ${formData.time === time ? 'bg-burgundy-700 text-white border-burgundy-700 font-bold' : 'bg-white border-cream-400 text-gray-700 hover:border-burgundy-500'}`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                        <h3 className="font-bold text-burgundy-900 mb-3 border-b border-cream-300 pb-1">Afternoon</h3>
                        <div className="space-y-2">
                          {timeSlots.afternoon.map(time => (
                            <button
                              key={time}
                              onClick={() => setFormData({...formData, time})}
                              className={`w-full py-2 px-3 text-sm rounded border text-left transition-colors ${formData.time === time ? 'bg-burgundy-700 text-white border-burgundy-700 font-bold' : 'bg-white border-cream-400 text-gray-700 hover:border-burgundy-500'}`}
                            >
                              {time}
                            </button>
                          ))}
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
                  <button 
                    onClick={nextStep} 
                    disabled={!formData.date || !formData.time}
                    className="btn-primary py-3.5 px-8 text-base font-bold"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Details */}
            {step === 3 && (
              <div>
                <h1 className="right-section-title">Contact Details</h1>
                <p className="text-gray-600 text-base mb-6 -mt-2">Provide your information so we can confirm your appointment.</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="Juan Dela Cruz" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="you@example.com" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-input" placeholder="09123456789" 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={prevStep} className="btn-secondary py-3.5 px-8 text-base">Back</button>
                  <button 
                    onClick={nextStep} 
                    disabled={!formData.name || !formData.email}
                    className="btn-primary py-3.5 px-8 text-base font-bold"
                  >
                    Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h1 className="text-3xl font-bold text-burgundy-900 mb-2 font-head uppercase">Ready to Confirm</h1>
                <p className="text-gray-600 text-base mb-8">Please review your appointment details below.</p>
                
                <div className="bg-cream-50 border border-cream-300 rounded-lg p-6 text-left max-w-md mx-auto mb-8 shadow-sm">
                  <div className="grid grid-cols-3 gap-y-4 text-sm">
                    <div className="text-gray-500 font-semibold uppercase tracking-wider">Service</div>
                    <div className="col-span-2 font-bold text-burgundy-900 capitalize">{formData.service}</div>
                    
                    <div className="text-gray-500 font-semibold uppercase tracking-wider">Date</div>
                    <div className="col-span-2 font-bold text-gray-900">May {formData.date}, 2026</div>
                    
                    <div className="text-gray-500 font-semibold uppercase tracking-wider">Time</div>
                    <div className="col-span-2 font-bold text-gray-900">{formData.time}</div>
                    
                    <div className="text-gray-500 font-semibold uppercase tracking-wider">Name</div>
                    <div className="col-span-2 font-bold text-gray-900">{formData.name}</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={prevStep} className="btn-secondary py-3.5 px-8 text-base">Edit Details</button>
                  <button 
                    onClick={() => {
                      alert("Appointment confirmed! (Mock)");
                      navigate('/');
                    }} 
                    className="btn-primary py-3.5 px-10 text-lg font-bold shadow-lg"
                  >
                    Confirm Appointment
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
