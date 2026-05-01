import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import SmartQLogo from '../components/common/SmartQLogo';

const CERT_TYPES = ['Baptismal', 'Confirmation', 'Marriage', 'Death'];
const STEPS = ['Certificate Info', 'Personal Details', 'Documents', 'Confirm'];

const CERT_ICONS = {
  Baptismal:    '💧',
  Confirmation: '✝️',
  Marriage:     '💍',
  Death:        '🕊️',
};

const initialForm = {
  fullName: '', contactNumber: '', address: '',
  certificateType: '', purpose: '', dateOfSacrament: '',
  appointmentDate: '', appointmentTime: '',
};

export default function KioskPage() {
  const navigate = useNavigate();

  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(initialForm);
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(null);
  const [error, setError]     = useState('');

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

  /* ── Success Screen ──────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-panel-right">
        <div className="sys-header flex items-center gap-4">
          <SmartQLogo height={56} />
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans">Walk-In Kiosk</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full text-center animate-slide-up">
            <div className="w-28 h-28 bg-green-100 border-2 border-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-head text-4xl font-bold text-burgundy-800 mb-4 uppercase tracking-wide">
              Request Submitted!
            </h2>
            <p className="text-gray-600 text-xl mb-8">Your request has been received successfully.</p>
            <div className="card mb-10">
              <p className="text-gray-500 text-base mb-2">Your Request ID</p>
              <p className="text-burgundy-700 font-bold text-7xl font-head">#{done.id}</p>
              <p className="text-gray-400 text-base mt-4">
                Note this ID to track your request at smartq.com/track
              </p>
            </div>
            <button onClick={reset} className="btn-primary text-xl px-14 py-5">
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Kiosk Layout ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── System Header ─────────────────────────────────────────────── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SmartQLogo height={56} />
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans">Walk-In Kiosk</span>
        </div>
        <span className="text-cream-400 text-xs hidden sm:block">Touch-Friendly Mode</span>
      </div>

      {/* ── Split Panel ──────────────────────────────────────────────────── */}
      <div className="split-window flex-1">

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <aside className="panel-left">
          <div className="panel-left-header">
            <SmartQLogo height={56} variant="light" />
            <p className="text-cream-300 text-sm mt-3 text-center font-medium tracking-wide">
              Walk-In Request Portal
            </p>
          </div>

          {/* Step list */}
          <div className="mt-4 space-y-2">
            <p className="text-cream-400 text-[11px] uppercase tracking-widest mb-3 font-semibold">
              Steps
            </p>
            {STEPS.map((s, i) => (
              <button
                key={s}
                className={`panel-btn-sub w-full text-left flex items-center gap-3 ${i === step ? 'active' : ''}`}
                style={{ fontSize: '13px', padding: '10px 16px' }}
                onClick={() => i < step && setStep(i)}
              >
                <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0
                  ${i < step ? 'bg-green-600 text-white' : i === step ? 'bg-burgundy-700 text-cream-200' : 'bg-burgundy-900/40 text-cream-400'}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                {s}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-burgundy-700">
            <p className="text-cream-400 text-sm text-center leading-relaxed">
              Certificate types available:<br />
              <span className="text-cream-300 font-medium">Baptismal · Confirmation<br />Marriage · Death</span>
            </p>
          </div>
        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <main className="panel-right flex items-center justify-center">
          {/*
            Central portal: large, centred, with comfortable margins.
            max-w-4xl gives substantial width; the panel-right padding
            keeps it away from the edges.
          */}
          <div className="relative z-10 w-full max-w-4xl animate-fade-in">

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex gap-2 mb-3">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-burgundy-600' : 'bg-cream-300'}`} />
                  </div>
                ))}
              </div>
              <p className="text-burgundy-700 text-base font-semibold">
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </p>
            </div>

            {error && <div className="alert-error mb-6 text-base">{error}</div>}

            {/* ── Main portal card ─────────────────────────────────── */}
            <div className="bg-white/75 backdrop-blur border border-cream-300 rounded-2xl shadow-md"
                 style={{ padding: '40px 48px' }}>

              {/* Back to Home button */}
              <button
                onClick={() => navigate('/')}
                id="kiosk-back-home-btn"
                className="inline-flex items-center gap-2 mb-8
                           bg-cream-200 hover:bg-cream-300 text-gray-900
                           font-semibold rounded-lg border border-cream-500
                           transition-all duration-150 select-none"
                style={{
                  fontSize: '15px',
                  padding: '12px 24px',
                  boxShadow: '0 3px 0 0 #b88437, 0 4px 8px rgba(0,0,0,0.12)',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 0 0 #b88437, 0 6px 12px rgba(0,0,0,0.16)'; }}
                onMouseOut={e  => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 3px 0 0 #b88437, 0 4px 8px rgba(0,0,0,0.12)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 1px 0 0 #b88437'; }}
                onMouseUp={e   => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 3px 0 0 #b88437, 0 4px 8px rgba(0,0,0,0.12)'; }}
              >
                {/* Left-arrow icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                  <path fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd" />
                </svg>
                Back to Home
              </button>

              {/* ── Step 0: Certificate Info ───────────────────────── */}
              {step === 0 && (
                <div className="space-y-8 animate-fade-in">
                  <h2 className="font-head text-3xl font-bold text-burgundy-800">
                    What certificate do you need?
                  </h2>

                  {/* Certificate type cards */}
                  <div className="grid grid-cols-2 gap-5">
                    {CERT_TYPES.map((t) => (
                      <button
                        key={t}
                        id={`cert-card-${t.toLowerCase()}`}
                        onClick={() => setForm({ ...form, certificateType: t })}
                        className={`rounded-xl border-2 text-center transition-all duration-150 select-none
                          ${form.certificateType === t
                            ? 'border-burgundy-600 bg-burgundy-50 text-burgundy-800 shadow-md'
                            : 'border-cream-300 bg-cream-50 text-gray-700 hover:border-burgundy-400 hover:shadow-sm'}`}
                        style={{ padding: '32px 20px' }}
                      >
                        <div style={{ fontSize: '48px', lineHeight: 1, marginBottom: '14px' }}>
                          {CERT_ICONS[t]}
                        </div>
                        <p className="font-bold text-xl">{t}</p>
                        <p className="text-base text-gray-400 mt-1">Certificate</p>
                      </button>
                    ))}
                  </div>

                  {/* Purpose field */}
                  <div>
                    <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px' }}>
                      Purpose / Reason
                    </label>
                    <textarea
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      rows={3}
                      placeholder="e.g., For marriage requirements, school enrollment..."
                      className="form-input resize-none"
                      style={{ fontSize: '16px', padding: '14px 16px' }}
                    />
                  </div>

                  {/* Date of Sacrament */}
                  <div>
                    <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px' }}>
                      Date of Sacrament (if known)
                    </label>
                    <div className="relative">
                      <input
                        name="dateOfSacrament"
                        type="date"
                        value={form.dateOfSacrament}
                        onChange={handleChange}
                        className="form-input"
                        style={{ fontSize: '16px', padding: '14px 16px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Personal Details ──────────────────────── */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h2 className="font-head text-3xl font-bold text-burgundy-800 mb-2">
                    Your Personal Information
                  </h2>
                  <div>
                    <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px' }}>Full Name *</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange}
                      className="form-input" style={{ fontSize: '18px', padding: '16px' }}
                      placeholder="Juan Dela Cruz" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px' }}>Contact Number *</label>
                    <input name="contactNumber" value={form.contactNumber} onChange={handleChange}
                      className="form-input" style={{ fontSize: '18px', padding: '16px' }}
                      placeholder="09XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px' }}>Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange}
                      className="form-input resize-none" rows={2}
                      style={{ fontSize: '16px', padding: '14px 16px' }}
                      placeholder="House No., Street, Barangay, City" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px' }}>Preferred Pickup Date</label>
                      <input name="appointmentDate" type="date" value={form.appointmentDate}
                        onChange={handleChange} className="form-input"
                        style={{ fontSize: '16px', padding: '14px 16px' }}
                        min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px' }}>Preferred Time</label>
                      <input name="appointmentTime" type="time" value={form.appointmentTime}
                        onChange={handleChange} className="form-input"
                        style={{ fontSize: '16px', padding: '14px 16px' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Documents ─────────────────────────────── */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <h2 className="font-head text-3xl font-bold text-burgundy-800 mb-8">
                    Upload Supporting Documents
                  </h2>
                  <div className="border-2 border-dashed border-cream-400 rounded-xl text-center hover:border-burgundy-400 transition-colors mb-5 cursor-pointer"
                       style={{ padding: '56px 32px' }}>
                    <input id="kiosk-upload" type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setFiles(Array.from(e.target.files))} className="hidden" />
                    <label htmlFor="kiosk-upload" className="cursor-pointer block">
                      <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: '16px' }}>📁</div>
                      <p className="text-gray-700 text-xl font-medium">Tap to attach documents</p>
                      <p className="text-gray-400 text-base mt-2">Valid ID, supporting documents — JPG, PNG, PDF (max 5MB)</p>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 bg-cream-100 rounded-lg text-base"
                             style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: '24px' }}>📄</span>
                          <span className="flex-1 truncate text-gray-700">{f.name}</span>
                          <span className="text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Confirm ───────────────────────────────── */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <h2 className="font-head text-3xl font-bold text-burgundy-800 mb-8">
                    Confirm Your Request
                  </h2>
                  <div className="space-y-3">
                    {[
                      ['Certificate Type', form.certificateType],
                      ['Full Name', form.fullName],
                      ['Contact Number', form.contactNumber],
                      ['Purpose', form.purpose],
                      ['Appointment', form.appointmentDate ? `${form.appointmentDate} ${form.appointmentTime}` : 'Not set'],
                      ['Documents', files.length ? `${files.length} file(s)` : 'None'],
                    ].map(([label, val]) => val && (
                      <div key={label} className="flex items-start gap-5 bg-cream-50 border border-cream-200 rounded-xl"
                           style={{ padding: '18px 24px' }}>
                        <span className="text-gray-400 text-base w-44 shrink-0">{label}</span>
                        <span className="text-burgundy-800 text-base font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Navigation buttons ────────────────────────────── */}
              <div className="flex justify-between mt-10 gap-5">
                {step > 0
                  ? <button
                      onClick={() => setStep(s => s - 1)}
                      className="btn-secondary"
                      style={{ fontSize: '17px', padding: '16px 36px' }}
                    >
                      ← Back
                    </button>
                  : <div />}

                {step < STEPS.length - 1
                  ? <button
                      id="kiosk-next-btn"
                      onClick={() => setStep(s => s + 1)}
                      disabled={
                        (step === 0 && !form.certificateType) ||
                        (step === 1 && (!form.fullName || !form.contactNumber))
                      }
                      className="btn-primary"
                      style={{ fontSize: '17px', padding: '16px 48px' }}
                    >
                      Next →
                    </button>
                  : <button
                      id="kiosk-submit-btn"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-primary flex-1"
                      style={{ fontSize: '17px', padding: '16px 36px' }}
                    >
                      {loading ? 'Submitting…' : '✓ Submit Request'}
                    </button>}
              </div>
            </div>
            {/* end portal card */}

          </div>
        </main>

      </div>
    </div>
  );
}
