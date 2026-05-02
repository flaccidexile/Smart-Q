import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import SmartQLogo from '../components/common/SmartQLogo';
import useAuth from '../hooks/useAuth';

const features = [
  { icon: '📋', title: 'Online Request Form',    desc: 'Submit baptismal, confirmation, and other sacramental record requests anytime, anywhere.' },
  { icon: '📁', title: 'Document Upload',        desc: 'Upload required IDs and supporting documents securely in one place.' },
  { icon: '🔔', title: 'Status Notifications',  desc: 'Get real-time updates on your request status directly from your personal dashboard.' },
  { icon: '📅', title: 'Appointment Scheduling', desc: 'Choose your preferred pickup date and time to avoid long queues.' },
  { icon: '🖥️', title: 'Digital Kiosk',          desc: 'Walk-in customers can submit requests via a touch-friendly in-parish kiosk.' },
  { icon: '🔒', title: 'Secure & Private',       desc: 'Your records and personal data are protected with enterprise-grade security.' },
];

const steps = [
  { step: '01', title: 'Create Account',    desc: 'Register online in under a minute.' },
  { step: '02', title: 'Fill Request Form', desc: 'Select certificate type and complete the form.' },
  { step: '03', title: 'Upload Documents',  desc: 'Attach required IDs and supporting files.' },
  { step: '04', title: 'Track & Collect',   desc: 'Monitor status and pick up your document.' },
];

export default function LandingPage() {
  const { isAdmin, user } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const requestLink = user ? '/certificate-request' : '/login';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero: Split Panel ─────────────────────────────────────────────── */}
      <div className="split-window flex-1">
        {/* LEFT PANEL */}
        <aside className="panel-left animate-slide-in-l">
          <div className="panel-left-header">
            <SmartQLogo height={64} variant="light" />
            <p className="text-cream-300 text-sm mt-4 leading-relaxed text-center font-medium tracking-wide">
              Sacramental Records<br />Request System
            </p>
          </div>

          <div className="flex flex-col gap-0">
            <p className="text-cream-400 text-[11px] uppercase tracking-widest mb-3 font-semibold">
              Quick Actions
            </p>
            <Link to={user ? '/dashboard?tab=new' : '/login'} id="landing-btn-request">
              <button className="panel-btn" style={{ fontSize: '14px', padding: '14px 18px' }}>
                Request Sacramental Records
                <span className="block text-[11px] font-normal text-gray-600 mt-1">
                  (Baptismal &amp; Confirmation Certificate)
                </span>
              </button>
            </Link>
            <Link to="/appointment" id="landing-btn-appointment">
              <button className="panel-btn" style={{ fontSize: '14px', padding: '14px 18px' }}>Schedule an Appointment</button>
            </Link>

            <Link to="/kiosk" id="landing-btn-kiosk">
              <button className="panel-btn" style={{ fontSize: '14px', padding: '14px 18px' }}>Walk-In Kiosk</button>
            </Link>
            <Link to="/mass-intention" id="landing-btn-mass-intention">
              <button className="panel-btn" style={{ fontSize: '14px', padding: '14px 18px' }}>
                ✝ Request Mass Intention
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-auto pt-8 space-y-3 border-t border-burgundy-700">
            {[
              { value: '24/7',  label: 'Online Access' },
              { value: '3 min', label: 'Average Submit Time' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-cream-300 text-sm">{s.label}</span>
                <span className="text-cream-200 font-bold text-base">{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="panel-right flex justify-center">
          <div className="panel-right-content w-full max-w-5xl animate-slide-up">

            {/* Schedule of Masses Card */}
            <div className="bg-white rounded-2xl shadow-sm border-t-8 border-t-burgundy-900 p-12 mb-14 text-center max-w-4xl mx-auto">
              <h2 className="font-head text-3xl font-bold tracking-widest uppercase text-burgundy-900 mb-10">
                Schedule of Masses
              </h2>

              <div className="space-y-10">
                <div>
                  <p className="font-head text-2xl font-semibold tracking-wide uppercase text-burgundy-900 mb-3">
                    Mondays to Saturdays:
                  </p>
                  <p className="text-4xl font-bold text-burgundy-700">
                    6:00 AM &amp; 6:00 PM
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-24 border-t-2 border-cream-300"></div>
                </div>

                <div>
                  <p className="font-head text-2xl font-semibold tracking-wide uppercase text-burgundy-900 mb-5">
                    Sundays:
                  </p>
                  <p className="text-4xl font-bold text-burgundy-700 leading-snug">
                    6:00 AM, 8:00 AM,<br />
                    10:00 AM, 3:00 PM,<br />
                    4:30 PM, and 6:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="section-divider my-10 border-t-2 border-cream-300" />

            {/* Features Grid */}
            <h2 className="right-section-title text-3xl mb-8">System Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {features.map((f) => (
                <div key={f.title} className="card-hover group p-8">
                  <div className="text-5xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-burgundy-800 text-xl mb-2 group-hover:text-burgundy-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="section-divider my-10 border-t-2 border-cream-300" />

            {/* How It Works */}
            <h2 className="right-section-title text-3xl mb-8">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {steps.map((s, i) => (
                <div key={s.step} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-1 bg-cream-400 z-10 -ml-2" />
                  )}
                  <div className="card text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-burgundy-700 flex items-center justify-center mx-auto mb-4 shadow-md z-20 relative">
                      <span className="text-cream-200 font-bold font-head text-xl">{s.step}</span>
                    </div>
                    <h3 className="font-semibold text-burgundy-800 text-lg mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-base">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-burgundy-800 rounded-2xl p-12 text-center shadow-lg mb-8">
              <h2 className="font-head text-4xl font-bold text-cream-200 mb-4 tracking-wide">
                Ready to Get Started?
              </h2>
              <p className="text-cream-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of parishioners who have already streamlined their sacramental records experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to={user ? '/dashboard' : '/register'} id="landing-cta-register">
                  <button className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto shadow-md">
                    {user ? 'Go to My Requests' : 'Create Free Account'}
                  </button>
                </Link>
                <Link to="/kiosk" id="landing-cta-kiosk">
                  <button className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto shadow-md">
                    Use as Walk-In Kiosk
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-burgundy-900 border-t-2 border-cream-700 py-6 text-center text-cream-400 text-sm">
        <p>© {new Date().getFullYear()} SMART Q — Sacramental Records Request System. All rights reserved.</p>
        <p className="mt-2 text-cream-600">Developed by Team SMART Q · Quezon City, Philippines</p>
      </footer>
    </div>
  );
}
