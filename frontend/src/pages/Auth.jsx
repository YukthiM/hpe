import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState(searchParams.get('role') || 'worker');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', skills: '', location: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        const { data } = await authAPI.login({ email: form.email, password: form.password });
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
        navigate(data.user.role === 'worker' ? '/dashboard' : '/discover');
      } else {
        const skillsArr = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
        const { data } = await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          skills: skillsArr,
          location: form.location,
        });
        login(data.token, data.user);
        toast.success(`Account created! Welcome, ${data.user.name.split(' ')[0]}!`);
        navigate(data.user.role === 'worker' ? '/dashboard' : '/discover');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 rounded-full px-4 py-1.5 mb-4">
            <Zap size={14} className="text-primary-400" />
            <span className="text-primary-400 text-sm font-medium">GigVerify</span>
          </div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{tab === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{tab === 'login' ? 'Sign in to your account' : 'Join as a gig worker or client'}</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-surface-3)' }}>
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={tab !== t ? { color: 'var(--text-muted)' } : {}}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-primary-500 text-white shadow-glow' : 'hover:opacity-80'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Role selector (signup only) */}
        {tab === 'signup' && (
          <div className="flex gap-3 mb-5">
            {['worker', 'client'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={role !== r ? { borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' } : {}}
              className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                  role === r
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : ''
                }`}
              >
                <span className="text-2xl">{r === 'worker' ? '🔧' : '👤'}</span>
                <span className="text-xs font-medium capitalize">{r === 'worker' ? 'Gig Worker' : 'Client'}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="Rahul Sharma" className="input-field" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              placeholder="you@example.com" className="input-field" />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={handleChange} required placeholder="Min. 6 characters" className="input-field pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: 'var(--text-faint)' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {tab === 'signup' && role === 'worker' && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Skills (comma separated)</label>
                <input name="skills" value={form.skills} onChange={handleChange}
                  placeholder="Electrician, Plumbing, Carpentry" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location</label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="Mumbai, Maharashtra" className="input-field" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-4 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {tab === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              tab === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-faint)' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-500 dark:hover:text-primary-300">
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
