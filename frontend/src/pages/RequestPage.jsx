import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import SmartQLogo from '../components/common/SmartQLogo';
import StatusBadge from '../components/admin/StatusBadge';
import useAuth from '../hooks/useAuth';

const STEPS = ['Personal Info', 'Certificate Details', 'Upload Documents', 'Review & Submit'];
const CERT_TYPES = ['Baptismal', 'Confirmation', 'Marriage', 'Death'];
const TABS = ['My Sacramental Requests', 'My Appointments', 'Payment History', 'New Certificate Request'];

const initialForm = {
  fullName: '', contactNumber: '', address: '',
  certificateType: '', purpose: '', dateOfSacrament: '',
  appointmentDate: '', appointmentTime: '',
};

export default function RequestPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('My Sacramental Requests');
  
  // Form State
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  // Data State
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/requests');
      setRequests(data.requests);
    } catch {} finally { setFetching(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

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
      setActiveTab('My Sacramental Requests');
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
    <div className="min-h-screen flex flex-col bg-panel-right">
      
      {/* ── Custom Header ──────────────────────────────────────────────────── */}
      <div className="sys-header flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Back to home">
            <SmartQLogo height={56} />
          </Link>
          <div className="h-8 w-px bg-burgundy-700 mx-2" />
          <span className="text-white font-bold text-lg tracking-wider uppercase font-sans hidden sm:block">
            MY PROFILE
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
            <div className="w-16 h-16 rounded-full bg-cream-400/20 border border-cream-400/30
                            flex items-center justify-center text-3xl mb-2">
              👤
            </div>
            <p className="text-cream-200 font-head font-bold text-lg mt-3 tracking-wide">
              Welcome back!
            </p>
            <p className="text-cream-400 text-base font-bold mt-1">
              {user?.name}
            </p>
          </div>

          <div className="mb-6 space-y-2 mt-4">
            <p className="text-cream-400 text-xs uppercase tracking-widest mb-4 font-bold">
              Activity Overview
            </p>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left font-medium rounded-md transition-all duration-150 select-none ${activeTab === tab ? 'bg-cream-400 text-burgundy-900 shadow-sm border border-cream-500' : 'text-cream-100 hover:bg-burgundy-800'}`}
                style={{ fontSize: '15px', padding: '14px 18px' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-burgundy-700">
            <button onClick={handleLogout} className="panel-btn mt-3 text-center w-full">Sign Out</button>
          </div>
        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <main className="panel-right flex justify-center">
          <div className="panel-right-content w-full max-w-5xl animate-slide-up">
            
            {success && (
              <div className="alert-success mb-6 flex justify-between items-center text-base">
                <span>✅ Request #{success.id} submitted! Track it in your history.</span>
                <button className="underline text-green-700 font-semibold" onClick={() => setSuccess(null)}>Dismiss</button>
              </div>
            )}

            {/* TAB 1: My Sacramental Requests */}
            {activeTab === 'My Sacramental Requests' && (
              <div>
                <h1 className="right-section-title">My Sacramental Requests</h1>
                <p className="text-gray-600 text-base mb-8 -mt-2">Track the real-time status of all your submitted documents.</p>
                
                <div className="card">
                  {fetching ? (
                    <div className="text-center py-12">
                      <div className="w-10 h-10 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-cream-50 rounded-lg border-2 border-dashed border-cream-200">
                      <p className="text-5xl mb-4">📭</p>
                      <p className="text-lg text-gray-600 font-medium">No requests yet.</p>
                      <button onClick={() => setActiveTab('New Certificate Request')} className="btn-primary mt-6">Submit Your First Request</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((r) => (
                        <div key={r.id} className="bg-cream-50 border border-cream-300 hover:border-burgundy-300 transition-colors rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-burgundy-900 text-lg font-bold">{r.certificateType} Certificate</p>
                              <span className="text-gray-400 text-sm font-mono bg-white px-2 py-0.5 rounded border">#{r.id}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-1"><span className="font-semibold text-gray-500 w-20 inline-block">Purpose:</span> {r.purpose}</p>
                            <p className="text-gray-600 text-sm"><span className="font-semibold text-gray-500 w-20 inline-block">Submitted:</span> {new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <StatusBadge status={r.status} />
                            {r.status === 'Ready for Release' && (
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-bold">Please pick up soon!</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: My Appointments */}
            {activeTab === 'My Appointments' && (
              <div>
                <h1 className="right-section-title">My Appointments</h1>
                <p className="text-gray-600 text-base mb-8 -mt-2">View your integrated schedule and upcoming pickup times.</p>
                
                <div className="card bg-white/60">
                  {requests.filter(r => r.appointmentDate).length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <p className="text-5xl mb-4">📅</p>
                      <p className="text-lg text-gray-600 font-medium">No upcoming appointments.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {requests.filter(r => r.appointmentDate).map((r) => (
                        <div key={r.id} className="bg-white border-2 border-cream-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-burgundy-600"></div>
                          <p className="text-burgundy-900 font-bold text-xl mb-1">{new Date(r.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-gray-800 text-lg font-medium mb-4">⏰ {r.appointmentTime}</p>
                          <div className="bg-cream-100 p-3 rounded-md">
                            <p className="text-sm font-semibold text-burgundy-800">{r.certificateType} Certificate</p>
                            <p className="text-xs text-gray-500 mt-1">Request #{r.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Payment History */}
            {activeTab === 'Payment History' && (
              <div>
                <h1 className="right-section-title">Payment History</h1>
                <p className="text-gray-600 text-base mb-8 -mt-2">Review your past transactions and document fees.</p>
                
                <div className="card p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-burgundy-50 border-b-2 border-burgundy-100">
                        <tr>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Date</th>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Description</th>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Amount</th>
                          <th className="p-4 font-bold text-burgundy-900 text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-gray-500 text-base">
                            No payment history available yet.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: New Certificate Request */}
            {activeTab === 'New Certificate Request' && (
              <div className="max-w-3xl mx-auto">
                <h1 className="right-section-title">New Certificate Request</h1>
                <p className="text-gray-600 text-base mb-8 -mt-2">Fill out the details below to request a new sacramental document.</p>

                {error && <div className="alert-error mb-5 text-base">{error}</div>}

                <div className="flex gap-2 mb-8">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex-1">
                      <div className={`h-2 rounded-full transition-colors duration-300 ${i <= step ? 'bg-burgundy-600' : 'bg-cream-300'}`} />
                      <p className={`text-xs mt-2 font-bold ${i === step ? 'text-burgundy-800' : 'text-gray-400'}`}>{s}</p>
                    </div>
                  ))}
                </div>

                <div className="card p-8 bg-white/90">
                  {step === 0 && (
                    <div className="space-y-5 animate-fade-in">
                      <p className="form-section-title text-lg">Personal Information</p>
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

                  {step === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <p className="form-section-title text-lg">Certificate Details</p>
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

                  {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <p className="form-section-title text-lg">Supporting Documents & Pickup</p>
                      <div>
                        <label className="form-label">Upload Documents (Max 5 files)</label>
                        <div className="border-2 border-dashed border-cream-400 rounded-xl p-10 text-center hover:border-burgundy-400 transition-colors bg-cream-50 cursor-pointer">
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
                              <li key={i} className="flex items-center gap-3 text-base bg-cream-100 rounded-lg px-4 py-3">
                                <span className="text-xl">📄</span>
                                <span className="text-gray-800 font-medium flex-1 truncate">{f.name}</span>
                                <span className="text-gray-500 text-sm">{(f.size / 1024).toFixed(0)} KB</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-5 mt-4">
                        <div>
                          <label className="form-label">Preferred Pickup Date</label>
                          <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} className="form-input" min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="form-label">Preferred Time</label>
                          <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} className="form-input" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="animate-fade-in space-y-4">
                      <p className="form-section-title text-lg">Review Before Submitting</p>
                      <div className="bg-cream-50 border border-cream-200 rounded-xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-4">
                          {[
                            ['Full Name', form.fullName],
                            ['Contact', form.contactNumber],
                            ['Address', form.address],
                            ['Certificate Type', form.certificateType],
                            ['Purpose', form.purpose],
                            ['Date of Sacrament', form.dateOfSacrament || 'Not specified'],
                            ['Appointment', form.appointmentDate ? `${form.appointmentDate} at ${form.appointmentTime}` : 'Not set'],
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
                    {step > 0
                      ? <button onClick={() => setStep(s => s - 1)} className="btn-secondary px-8 py-3.5 text-base">← Back</button>
                      : <div />}
                    {step < STEPS.length - 1
                      ? <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary px-10 py-3.5 text-base font-bold">Next →</button>
                      : <button onClick={handleSubmit} disabled={loading || !form.fullName || !form.certificateType} className="btn-primary px-10 py-3.5 text-base font-bold">
                          {loading ? 'Submitting...' : '✓ Submit Request'}
                        </button>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
