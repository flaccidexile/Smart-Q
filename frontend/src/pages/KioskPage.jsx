import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const CERT_TYPES = ['Baptismal', 'Confirmation', 'Marriage', 'Death'];
const STEPS = ['Certificate Info', 'Personal Details', 'Documents', 'Confirm'];

const initialForm = {
  fullName: '', contactNumber: '', address: '',
  certificateType: '', purpose: '', dateOfSacrament: '',
  appointmentDate: '', appointmentTime: '',
};

export default function KioskPage() {
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState(initialForm);
  const [files, setFiles]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(null);
  const [error, setError]   = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('source', 'kiosk');
      files.forEach((f) => fd.append('documents', f));
      const { data } = await axiosInstance.post('/requests', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDone(data.request);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  const reset = () => { setStep(0); setForm(initialForm); setFiles([]); setDone(null); setError(''); };

  // Success screen
  if (done) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-8">
        <div className="max-w-lg w-full text-center animate-slide-up">
          <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">Request Submitted!</h2>
          <p className="text-slate-400 text-lg mb-4">Your request has been received successfully.</p>
          <div className="glass p-6 mb-8">
            <p className="text-slate-400 text-sm mb-2">Your Request ID</p>
            <p className="text-brand-400 font-bold text-5xl font-display">#{done.id}</p>
            <p className="text-slate-500 text-sm mt-3">
              Please note this ID to track your request at smartq.com/track
            </p>
          </div>
          <button onClick={reset} className="btn-primary text-lg px-10 py-4">
            New Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Kiosk Header */}
      <div className="text-center pt-10 pb-6 px-4 border-b border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/30">
          <span className="text-navy-900 font-bold text-2xl font-display">SQ</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white">
          SMART <span className="text-brand-400">Q</span> — Walk-In Kiosk
        </h1>
        <p className="text-slate-400 mt-1">Sacramental Records Request System</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Step Progress */}
        <div className="flex gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div className={`h-2 rounded-full mb-2 transition-all duration-300 ${i <= step ? 'bg-brand-500' : 'bg-slate-800'}`} />
              <p className={`text-xs font-medium ${i === step ? 'text-brand-400' : 'text-slate-600'}`}>{s}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 mb-6 text-base">{error}</div>
        )}

        <div className="card">
          {/* Step 0: Certificate Info */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-semibold text-white text-xl mb-4">What certificate do you need?</h2>
              <div className="grid grid-cols-2 gap-4">
                {CERT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, certificateType: t })}
                    className={`p-6 rounded-2xl border-2 text-center transition-all duration-200 ${
                      form.certificateType === t
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{
                      { Baptismal: '💧', Confirmation: '✝️', Marriage: '💍', Death: '🕊️' }[t]
                    }</div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-xs text-slate-500 mt-1">Certificate</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="form-label text-base">Purpose / Reason</label>
                <textarea name="purpose" value={form.purpose} onChange={handleChange}
                  className="form-input resize-none text-base" rows={3}
                  placeholder="e.g., For marriage requirements, school enrollment..." />
              </div>
              <div>
                <label className="form-label text-base">Date of Sacrament (if known)</label>
                <input name="dateOfSacrament" type="date" value={form.dateOfSacrament} onChange={handleChange} className="form-input text-base" />
              </div>
            </div>
          )}

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-semibold text-white text-xl mb-4">Your Personal Information</h2>
              <div>
                <label className="form-label text-base">Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} className="form-input text-xl py-4" placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label className="form-label text-base">Contact Number *</label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="form-input text-xl py-4" placeholder="09XXXXXXXXX" />
              </div>
              <div>
                <label className="form-label text-base">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} className="form-input resize-none text-base" rows={2} placeholder="House No., Street, Barangay, City" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-base">Preferred Pickup Date</label>
                  <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} className="form-input text-base" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="form-label text-base">Preferred Time</label>
                  <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} className="form-input text-base" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-semibold text-white text-xl mb-4">Upload Supporting Documents</h2>
              <div className="border-2 border-dashed border-slate-600 rounded-2xl p-10 text-center hover:border-brand-500/50 transition-colors mb-4">
                <input id="kiosk-upload" type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setFiles(Array.from(e.target.files))} className="hidden" />
                <label htmlFor="kiosk-upload" className="cursor-pointer">
                  <div className="text-5xl mb-4">📁</div>
                  <p className="text-slate-300 text-lg font-medium">Tap to attach documents</p>
                  <p className="text-slate-500 text-sm mt-2">Valid ID, supporting documents — JPG, PNG, PDF (max 5MB)</p>
                </label>
              </div>
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300">
                      <span className="text-xl">📄</span>
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-semibold text-white text-xl mb-6">Confirm Your Request</h2>
              <div className="space-y-3">
                {[
                  ['Certificate Type', form.certificateType],
                  ['Full Name', form.fullName],
                  ['Contact Number', form.contactNumber],
                  ['Purpose', form.purpose],
                  ['Appointment', form.appointmentDate ? `${form.appointmentDate} ${form.appointmentTime}` : 'Not set'],
                  ['Documents', files.length ? `${files.length} file(s)` : 'None'],
                ].map(([label, val]) => val && (
                  <div key={label} className="flex items-start gap-4 bg-slate-800/50 rounded-xl px-5 py-4">
                    <span className="text-slate-500 text-base w-40 shrink-0">{label}</span>
                    <span className="text-white text-base font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 gap-4">
            {step > 0
              ? <button onClick={() => setStep(s => s - 1)} className="btn-secondary text-lg px-8 py-4">← Back</button>
              : <div />}
            {step < STEPS.length - 1
              ? <button onClick={() => setStep(s => s + 1)}
                  disabled={
                    (step === 0 && !form.certificateType) ||
                    (step === 1 && (!form.fullName || !form.contactNumber))
                  }
                  className="btn-primary text-lg px-8 py-4">Next →</button>
              : <button onClick={handleSubmit} disabled={loading} className="btn-primary text-lg px-8 py-4 flex-1">
                  {loading ? 'Submitting...' : '✓ Submit Request'}
                </button>}
          </div>
        </div>
      </div>
    </div>
  );
}
