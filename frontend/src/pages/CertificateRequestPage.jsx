import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import SmartQLogo from '../components/common/SmartQLogo';
import useAuth from '../hooks/useAuth';

const STEPS = ['Personal Info', 'Certificate Details', 'Upload Documents', 'Payment Method', 'Review & Submit'];
const CERT_TYPES = ['Baptismal', 'Confirmation', 'Marriage', 'Death'];
const CERT_PRICES = { Baptismal: 150, Confirmation: 150, Marriage: 300, Death: 100 };

const initialForm = {
  fullName: '', contactNumber: '', address: '',
  certificateType: '', purpose: '', dateOfSacrament: '',
  appointmentDate: '', appointmentTime: '', paymentMethod: 'onsite',
};

export default function CertificateRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) return setError('Maximum 5 files allowed.');
    setFiles(selected);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('documents', f));
      if (form.paymentMethod === 'online' && paymentProofFile) fd.append('paymentProof', paymentProofFile);
      const { data } = await axiosInstance.post('/requests', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(data.request);
      setForm(initialForm);
      setFiles([]);
      setPaymentProofFile(null);
      setStep(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return form.fullName && form.contactNumber;
    if (step === 1) return form.certificateType && form.purpose;
    if (step === 3) return form.paymentMethod !== 'online' || !!paymentProofFile;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-panel-right">
      {/* ── Header ── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Back to home"><SmartQLogo height={56} /></Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            Request Sacramental Records
          </span>
        </div>
        <Link to="/" className="bg-cream-200 hover:bg-cream-300 text-burgundy-900 font-bold py-2 px-6 rounded-md shadow transition text-base">
          ← Back to Home
        </Link>
      </div>

      <div className="split-window flex-1">
        {/* ── LEFT PANEL ── */}
        <aside className="panel-left animate-slide-in-l">
          <div className="panel-left-header">
            <SmartQLogo height={64} variant="light" />
            <p className="text-cream-300 text-sm mt-4 leading-relaxed text-center font-medium tracking-wide">
              Sacramental Records<br />Request System
            </p>
          </div>

          <div className="mt-6">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">Registration Steps</p>
            {STEPS.map((s, i) => {
              const isActive = step === i;
              const isPast = step > i;
              return (
                <div key={s} className={`flex items-center gap-3 py-2.5 px-3 rounded-md mb-2 transition-colors ${isActive ? 'bg-cream-200 text-burgundy-900 shadow-md font-bold' : 'text-cream-200'}`}>
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isActive ? 'bg-burgundy-700 text-cream-200' : isPast ? 'bg-green-600 text-white' : 'bg-burgundy-800 text-cream-400'}`}>
                    {isPast ? '✓' : i + 1}
                  </span>
                  <span className="text-sm">{s}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-8 border-t border-burgundy-700 space-y-3">
            {[{ value: '24/7', label: 'Online Access' }, { value: '3 min', label: 'Average Submit Time' }].map((s) => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-cream-300 text-sm">{s.label}</span>
                <span className="text-cream-200 font-bold text-base">{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="panel-right flex justify-center">
          <div className="panel-right-content w-full animate-slide-up">

            {success && (
              <div className="alert-success mb-6 flex justify-between items-center text-base">
                <span>✅ Request #{success.id} submitted successfully!</span>
                <div className="flex gap-4">
                  <button className="underline text-green-700 font-semibold" onClick={() => navigate('/dashboard')}>View My Requests</button>
                  <button className="underline text-green-700 font-semibold" onClick={() => { setSuccess(null); setStep(0); }}>New Request</button>
                </div>
              </div>
            )}

            <h1 className="right-section-title">New Certificate Request</h1>
            <p className="text-gray-600 text-base mb-8 -mt-2">Fill out the details below to request a new sacramental document.</p>

            {error && <div className="alert-error mb-5 text-base">{error}</div>}

            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full transition-colors duration-300 ${i <= step ? 'bg-burgundy-600' : 'bg-cream-300'}`} />
                  <p className={`text-xs mt-2 font-bold ${i === step ? 'text-burgundy-800' : 'text-gray-400'}`}>{s}</p>
                </div>
              ))}
            </div>

            <div className="card p-10 bg-white/90">
              {/* Step 0 */}
              {step === 0 && (
                <div className="space-y-6 animate-fade-in">
                  <p className="text-burgundy-800 font-head font-bold text-base uppercase tracking-widest border-b-2 border-cream-300 pb-3">Personal Information</p>
                  <div><label className="form-label">Full Name *</label><input name="fullName" value={form.fullName} onChange={handleChange} className="form-input" placeholder="Juan Dela Cruz" /></div>
                  <div><label className="form-label">Contact Number *</label><input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="form-input" placeholder="09XXXXXXXXX" /></div>
                  <div><label className="form-label">Address</label><textarea name="address" value={form.address} onChange={handleChange} className="form-input resize-none" rows={2} placeholder="House No., Street, Barangay, City" /></div>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <p className="text-burgundy-800 font-head font-bold text-base uppercase tracking-widest border-b-2 border-cream-300 pb-3">Certificate Details</p>
                  <div>
                    <label className="form-label">Certificate Type *</label>
                    <select name="certificateType" value={form.certificateType} onChange={handleChange} className="form-input">
                      <option value="">Select type...</option>
                      {CERT_TYPES.map((t) => <option key={t} value={t}>{t} Certificate</option>)}
                    </select>
                    {form.certificateType && <p className="text-sm font-bold text-burgundy-700 mt-2 bg-burgundy-50 p-2 rounded inline-block">Fee: ₱{CERT_PRICES[form.certificateType].toFixed(2)}</p>}
                  </div>
                  <div><label className="form-label">Purpose *</label><textarea name="purpose" value={form.purpose} onChange={handleChange} className="form-input resize-none" rows={3} placeholder="e.g., For marriage requirements, school enrollment..." /></div>
                  <div><label className="form-label">Date of Sacrament</label><input name="dateOfSacrament" type="date" value={form.dateOfSacrament} onChange={handleChange} className="form-input" /></div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <p className="text-burgundy-800 font-head font-bold text-base uppercase tracking-widest border-b-2 border-cream-300 pb-3">Supporting Documents & Pickup</p>
                  <div>
                    <label className="form-label">Upload Documents (Max 5 files)</label>
                    <div className="border-2 border-dashed border-cream-400 rounded-xl p-10 text-center hover:border-burgundy-400 transition-colors bg-cream-50">
                      <input id="doc-upload" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                      <label htmlFor="doc-upload" className="cursor-pointer block">
                        <div className="text-5xl mb-4">📁</div>
                        <p className="text-gray-800 font-bold text-lg">Tap to upload or drag files here</p>
                        <p className="text-gray-500 text-sm mt-1">JPG, PNG, PDF — max 5MB each</p>
                      </label>
                    </div>
                    {files.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {files.map((f, i) => (
                          <li key={i} className="flex items-center gap-3 bg-cream-100 rounded-lg px-4 py-3">
                            <span className="text-xl">📄</span>
                            <span className="text-gray-800 font-medium flex-1 truncate">{f.name}</span>
                            <span className="text-gray-500 text-sm">{(f.size / 1024).toFixed(0)} KB</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div><label className="form-label">Preferred Pickup Date</label><input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} className="form-input" min={new Date().toISOString().split('T')[0]} /></div>
                    <div><label className="form-label">Preferred Time</label><input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} className="form-input" /></div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <p className="text-burgundy-800 font-head font-bold text-base uppercase tracking-widest border-b-2 border-cream-300 pb-3">Payment Method</p>
                  <div className="bg-cream-100 p-4 rounded-lg flex justify-between items-center border border-cream-300">
                    <span className="font-bold text-burgundy-900">Total Amount Due:</span>
                    <span className="text-2xl font-head font-bold text-burgundy-700">₱{form.certificateType ? CERT_PRICES[form.certificateType].toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="space-y-4">
                    {[{ val: 'onsite', title: 'Pay On-Site (Cash)', desc: 'Pay at the parish office when you pick up your document.' },
                      { val: 'online', title: 'Pay Online (GCash)', desc: 'Transfer payment via GCash and upload the screenshot.' }].map((opt) => (
                      <label key={opt.val} className={`block border-2 rounded-xl p-5 cursor-pointer transition-colors ${form.paymentMethod === opt.val ? 'border-burgundy-600 bg-burgundy-50' : 'border-cream-300 hover:border-burgundy-400'}`}>
                        <div className="flex items-center gap-4">
                          <input type="radio" name="paymentMethod" value={opt.val} checked={form.paymentMethod === opt.val} onChange={handleChange} className="w-5 h-5 text-burgundy-600" />
                          <div><p className="font-bold text-burgundy-900 text-lg">{opt.title}</p><p className="text-sm text-gray-600">{opt.desc}</p></div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {form.paymentMethod === 'online' && (
                    <div className="p-6 border border-dashed border-cream-400 bg-white rounded-xl">
                      <p className="font-bold text-burgundy-900 mb-2">GCash Payment Details</p>
                      <p className="text-gray-600 mb-4">Please send <strong>₱{CERT_PRICES[form.certificateType]}</strong> to:</p>
                      <div className="bg-cream-50 p-6 rounded-xl border border-cream-200 mb-6 flex flex-col items-center justify-center">
                        <img 
                          src="/gcashqr.jfif" 
                          alt="GCash / InstaPay QR Code" 
                          className="w-48 h-48 mb-3 rounded-lg border border-gray-200 shadow-sm object-contain"
                        />
                        <p className="font-bold text-burgundy-900 text-lg">Scan to Pay</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Smart Q Parish via GCash/InstaPay</p>
                      </div>
                      <label className="form-label">Upload GCash Receipt *</label>
                      <input type="file" accept="image/*" onChange={(e) => setPaymentProofFile(e.target.files[0])} className="form-input mt-1" />
                      {paymentProofFile && <p className="text-sm text-green-700 mt-2">✓ {paymentProofFile.name} attached</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="animate-fade-in space-y-4">
                  <p className="text-burgundy-800 font-head font-bold text-base uppercase tracking-widest border-b-2 border-cream-300 pb-3">Review Before Submitting</p>
                  <div className="bg-cream-50 border border-cream-200 rounded-xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-4">
                      {[['Full Name', form.fullName], ['Contact', form.contactNumber], ['Address', form.address],
                        ['Certificate Type', form.certificateType], ['Purpose', form.purpose],
                        ['Date of Sacrament', form.dateOfSacrament || 'Not specified'],
                        ['Appointment', form.appointmentDate ? `${form.appointmentDate} at ${form.appointmentTime}` : 'Not set'],
                        ['Payment Method', form.paymentMethod === 'online' ? 'GCash (Online)' : 'Cash (On-site)'],
                        ['Amount Due', `₱${form.certificateType ? CERT_PRICES[form.certificateType].toFixed(2) : '0.00'}`],
                        ['Documents', files.length ? `${files.length} file(s) attached` : 'None'],
                      ].map(([label, val]) => val && (
                        <div key={label} className="col-span-1 sm:col-span-3 grid grid-cols-3 border-b border-cream-200 pb-3 last:border-0 last:pb-0">
                          <span className="text-gray-500 font-bold uppercase tracking-wider text-xs col-span-1 pt-1">{label}</span>
                          <span className="text-burgundy-900 text-base font-semibold col-span-2">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-10 gap-4">
                {step > 0 ? <button onClick={() => setStep(s => s - 1)} className="btn-secondary px-8 py-3.5 text-base">← Back</button> : <div />}
                {step < STEPS.length - 1
                  ? <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary px-10 py-3.5 text-base font-bold">Next →</button>
                  : <button onClick={handleSubmit} disabled={loading || !form.fullName || !form.certificateType} className="btn-primary px-10 py-3.5 text-base font-bold">{loading ? 'Submitting...' : '✓ Submit Request'}</button>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
