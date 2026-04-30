import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: '🔍', title: 'Search & Discover', desc: 'Find verified gig workers by skill, location, and rating.' },
    { icon: '📱', title: 'QR Verified Reviews', desc: 'Only real clients can leave reviews via unique QR codes.' },
    { icon: '🏆', title: 'Reputation Score', desc: 'Dynamic score built from ratings, jobs, and verified badges.' },
    { icon: '🪪', title: 'ID Verification', desc: 'Government ID check simulation for trusted profiles.' },
  ];

  const steps = [
    { n: '01', text: 'Create your worker profile' },
    { n: '02', text: 'Complete a job & generate QR' },
    { n: '03', text: 'Client scans & reviews' },
    { n: '04', text: 'Build your verified reputation' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-5 md:px-6 lg:px-8 pt-16 pb-12 text-center relative z-10">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 rounded-full px-4 py-1.5 mb-8">
            <Zap size={14} className="text-primary-500 dark:text-primary-400" />
            <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">GigVerify Platform</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Your Verified<br />
            <span className="gradient-text">Gig Identity</span>
          </h1>

          <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Build trust with verified reviews, showcase your portfolio, and get discovered by clients who value authenticity.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/auth?role=worker')}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
            >
              I'm a Gig Worker <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/auth?role=client')}
              className="btn-secondary w-full text-base py-4"
            >
              I'm Looking to Hire
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /> No fake reviews</span>
            <span className="flex items-center gap-1"><Shield size={12} className="text-primary-500 dark:text-primary-400" /> ID verified</span>
            <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" fill="currentColor" /> Reputation score</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-8">
        <h2 className="font-display text-xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
          Why GigVerify?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.title} className="card hover:border-primary-500/30 transition-all duration-300">
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-8">
        <h2 className="font-display text-xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
          How It Works
        </h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-500/20" />
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-4 mb-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm shrink-0 relative z-10">
                {s.n}
              </div>
              <div className="pt-3">
                <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-5 md:px-6 lg:px-8 py-8 pb-16">
        <div className="card bg-gradient-card border-primary-500/20 text-center py-8">
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Start Building Trust</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Join thousands of verified gig workers</p>
          <button onClick={() => navigate('/auth')} className="btn-primary px-8">
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
