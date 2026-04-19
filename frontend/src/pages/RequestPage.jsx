import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/common/Navbar';
import StatusBadge from '../components/admin/StatusBadge';
import useAuth from '../hooks/useAuth';

const STEPS = ['Personal Info', 'Certificate Details', 'Upload Documents', 'Review & Submit'];
const CERT_TYPES = ['Baptismal', 'Confirmation', 'Marriage', 'Death'];

const initialForm = {
  fullName: '', contactNumber: '', address: '',
  certificateType: '', purpose: '', dateOfSacrament: '',
  appointmentDate: '', appointmentTime: '',
};

export default function RequestPage() {
  const { user } = useAuth();
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(initialForm);
  const [files, setFiles]       = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/requests');
      setRequests(data.requests);
    } catch {} finally { setFetching(false); }
  };

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
      const { data } = await axiosInstance.post('/requests', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(data.request);
      setForm(initialForm);
      setFiles([]);
      setStep(0);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally { setLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return form.fullName && form.contactNumber;
    if (step === 1) return form.certificateType && form.purpose;
    return true;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">My Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name} 👋</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Request Form */}
          <div className="lg:col-span-3">
            <div className="card">
              <h2 className="font-semibold text-white text-lg mb-6">New Certificate Request</h2>

              {/* Step Indicators */}
              <div className="flex gap-2 mb-8">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className={`h-1.5 rounded-full transition-colors duration-300 ${i <= step ? 'bg-brand-500' : 'bg-slate-700'}`} />
                    <p className={`text-xs mt-1.5 font-medium ${i === step ? 'text-brand-400' : 'text-slate-600'}`}>{s}</p>
                  </div>
                ))}
              </div>

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-5 text-sm">
                  ✅ Request #{success.id} submitted! Track it in your history below.
                  <button className="ml-2 underline text-green-300" onClick={() => setSuccess(null)}>Dismiss</button>
                </div>
              )}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-5 text-sm">{error}</div>
              )}

              {/* Step 0: Personal Info */}
              {step === 0 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} className="form-input" placeholder="Juan Dela Cruz" />
                  </div>
                  <div>
                    <label className="form-label">Contact Number *</label>
                    <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="form-input" placeholder="09XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange} className="form-input resize-none" rows={2} placeholder="House No., Street, Barangay, City" />
                  </div>
                </div>
              )}

              {/* Step 1: Certificate Details */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="form-label">Certificate Type *</label>
                    <select name="certificateType" value={form.certificateType} onChange={handleChange} className="form-input">
                      <option value="">Select type...</option>
                      {CERT_TYPES.map((t) => <option key={t} value={t}>{t} Certificate</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Purpose *</label>
                    <textarea name="purpose" value={form.purpose} onChange={handleChange} className="form-input resize-none" rows={3} placeholder="e.g., For marriage requirements, school enrollment..." />
                  </div>
                  <div>
                    <label className="form-label">Date of Sacrament</label>
                    <input name="dateOfSacrament" type="date" value={form.dateOfSacrament} onChange={handleChange} className="form-input" />
                  </div>
                </div>
              )}

              {/* Step 2: Upload */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="form-label">Upload Supporting Documents (Max 5 files)</label>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-brand-500/50 transition-colors">
                      <input id="doc-upload" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
                      <label htmlFor="doc-upload" className="cursor-pointer">
                        <div className="text-4xl mb-3">📁</div>
                        <p className="text-slate-300 font-medium text-sm">Click to upload or drag files here</p>
                        <p className="text-slate-500 text-xs mt-1">JPG, PNG, PDF — max 5MB each</p>
                      </label>
                    </div>
                    {files.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {files.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-2">
                            <span>📄</span> {f.name} <span className="text-slate-500 ml-auto">{(f.size / 1024).toFixed(0)} KB</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Preferred Appointment Date</label>
                      <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} className="form-input" min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className="form-label">Preferred Time</label>
                      <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="animate-fade-in space-y-3">
                  <h3 className="text-slate-300 font-medium text-sm mb-2">Review your information before submitting:</h3>
                  {[
                    ['Full Name', form.fullName],
                    ['Contact', form.contactNumber],
                    ['Address', form.address],
                    ['Certificate Type', form.certificateType],
                    ['Purpose', form.purpose],
                    ['Date of Sacrament', form.dateOfSacrament],
                    ['Appointment', form.appointmentDate ? `${form.appointmentDate} ${form.appointmentTime}` : 'Not set'],
                    ['Documents', files.length ? `${files.length} file(s) attached` : 'None'],
                  ].map(([label, val]) => val && (
                    <div key={label} className="flex items-start gap-3 bg-slate-800/50 rounded-xl px-4 py-3">
                      <span className="text-slate-500 text-sm w-36 shrink-0">{label}</span>
                      <span className="text-slate-200 text-sm">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {step > 0
                  ? <button onClick={() => setStep(s => s - 1)} className="btn-secondary">← Back</button>
                  : <div />}
                {step < STEPS.length - 1
                  ? <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary">Next →</button>
                  : <button onClick={handleSubmit} disabled={loading || !form.fullName || !form.certificateType} className="btn-primary">
                      {loading ? 'Submitting...' : 'Submit Request ✓'}
                    </button>}
              </div>
            </div>
          </div>

          {/* My Requests */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="font-semibold text-white text-lg mb-4">My Request History</h2>
              {fetching ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <p className="text-3xl mb-3">📭</p>
                  <p>No requests yet. Submit your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div key={r.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-white text-sm font-medium">{r.certificateType} Certificate</p>
                          <p className="text-slate-500 text-xs">Request #{r.id}</p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-slate-400 text-xs mt-2">
                        {r.appointmentDate ? `📅 ${r.appointmentDate}` : '📅 No appointment set'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Track */}
            <div className="card mt-4">
              <p className="text-slate-400 text-sm text-center">Share a request by ID</p>
              <Link to="/track" className="btn-secondary w-full text-center text-sm mt-3 block">
                🔍 Track a Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
