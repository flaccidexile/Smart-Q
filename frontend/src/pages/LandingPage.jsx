import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const features = [
  {
    icon: '📋',
    title: 'Online Request Form',
    desc: 'Submit baptismal, confirmation, and other sacramental record requests anytime, anywhere.',
  },
  {
    icon: '📁',
    title: 'Document Upload',
    desc: 'Upload required IDs and supporting documents securely in one place.',
  },
  {
    icon: '🔔',
    title: 'Real-Time Tracking',
    desc: 'Monitor your request status from Pending to Released with full transparency.',
  },
  {
    icon: '📅',
    title: 'Appointment Scheduling',
    desc: 'Choose your preferred pickup date and time to avoid long queues.',
  },
  {
    icon: '🖥️',
    title: 'Digital Kiosk',
    desc: 'Walk-in customers can submit requests via a touch-friendly in-parish kiosk.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your records and personal data are protected with enterprise-grade security.',
  },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Register online in under a minute.' },
  { step: '02', title: 'Fill Request Form', desc: 'Select certificate type and complete the form.' },
  { step: '03', title: 'Upload Documents', desc: 'Attach required IDs and supporting files.' },
  { step: '04', title: 'Track & Collect', desc: 'Monitor status and pick up your document.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Decorative glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-slow" />
            <span className="text-brand-400 text-sm font-medium">Now Available Online & In-Parish Kiosk</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
            Your Sacramental Records,{' '}
            <span className="text-gradient">Simplified.</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-slide-up">
            SMART Q modernizes how parishes process baptismal, confirmation, and other
            sacramental certificate requests — no more long queues or manual paperwork.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Request a Certificate
            </Link>
            <Link to="/track" className="btn-secondary text-base px-8 py-3.5">
              Track My Request
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: '100K+', label: 'Annual Requests' },
              { value: '24/7',  label: 'Online Access' },
              { value: '3 min', label: 'Average Submit Time' },
            ].map((s) => (
              <div key={s.label} className="glass p-4 text-center">
                <p className="text-brand-400 font-bold text-xl">{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Everything You Need
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A complete digital solution for sacramental records — built for parishioners and parish administrators.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-hover group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900/40 border-y border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400">Four simple steps to get your certificate.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-brand-500/50 to-transparent z-10" />
                )}
                <div className="card text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-brand-400 font-bold font-display text-lg">{s.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="glass p-10 lg:p-16 glow-gold">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of parishioners who have already streamlined their sacramental records experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-10 py-3.5">Create Free Account</Link>
            <Link to="/kiosk" className="btn-secondary text-base px-10 py-3.5">Use as Walk-In Kiosk</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} SMART Q — Sacramental Records Request System. All rights reserved.</p>
        <p className="mt-1 text-slate-600">Developed by Team SMART Q · Quezon City, Philippines</p>
      </footer>
    </div>
  );
}
