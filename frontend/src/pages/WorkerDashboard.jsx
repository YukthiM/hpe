import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../api';
import ReputationBadge from '../components/ReputationBadge';
import VerifiedBadge from '../components/VerifiedBadge';
import StarRating from '../components/StarRating';
import { Plus, Briefcase, Star, Shield, Share2, Bell, ChevronRight, TrendingUp, CalendarCheck, Mic } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await jobsAPI.getMyJobs();
        setJobs(data.jobs?.slice(0, 3) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // Refresh user to get latest reputation
    refreshUser();
  }, []);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const shareProfile = async () => {
    const url = `${window.location.origin}/profile/${user.publicProfileSlug || user._id}`;
    if (navigator.share) {
      await navigator.share({ title: `${user.name} — GigVerify Profile`, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied!');
    }
  };

  const quickStats = [
    { label: 'Jobs Done', value: user?.completedJobsCount || 0, icon: <Briefcase size={18} className="text-primary-400" /> },
    { label: 'Avg Rating', value: (user?.averageRating || 0).toFixed(1), icon: <Star size={18} className="text-yellow-400" fill="currentColor" /> },
    { label: 'Reviews', value: user?.totalRatings || 0, icon: <TrendingUp size={18} className="text-emerald-400" /> },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Good morning 👋</p>
          <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={shareProfile} className="w-10 h-10 rounded-xl flex items-center justify-center transition" style={{ background: 'var(--overlay-md)', color: 'var(--text-secondary)' }}>
            <Share2 size={18} />
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="w-10 h-10 rounded-xl flex items-center justify-center transition text-xs" style={{ background: 'var(--overlay-md)', color: 'var(--text-secondary)' }}>
            Out
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="card bg-gradient-to-br from-primary-600/20 to-purple-600/10 border-primary-500/20 mb-5">
        <div className="flex items-center gap-4 mb-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-lg">{user?.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <VerifiedBadge status={user?.idVerificationStatus} size="sm" />
              {!user?.idVerified && (
                <button onClick={() => navigate('/verify-id')} className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                  ⚠️ Verify ID
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center justify-between">
          <ReputationBadge score={user?.reputationScore} tier={user?.reputationTier} size="md" />
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Score Progress</p>
            <div className="w-24 rounded-full h-2 mt-1" style={{ background: 'var(--overlay-md)' }}>
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${user?.reputationScore || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {quickStats.map((s) => (
          <div key={s.label} className="card text-center py-4">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="mb-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Your Badges</h3>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b, i) => (
              <span key={i} className="badge bg-primary-500/15 text-primary-600 dark:text-primary-300 border border-primary-500/20 px-3 py-1 text-sm">
                {b.icon} {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Voice AI promo banner ── */}
      <button
        onClick={() => navigate('/voice-assistant')}
        className="w-full mb-5 rounded-2xl overflow-hidden relative group active:scale-95 transition-all"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}
      >
        {/* Shimmer */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }}
        />
        <div className="flex items-center gap-4 p-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Mic size={28} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-display font-bold text-white text-base leading-tight">
              🎙️ Build Profile with Voice
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              Just speak — AI fills your profile instantly
            </p>
            <div className="flex gap-1.5 mt-2">
              {['Hindi', 'English', 'Hinglish'].map(l => (
                <span key={l} className="text-[10px] bg-white/20 text-white/90 px-2 py-0.5 rounded-full font-medium">{l}</span>
              ))}
            </div>
          </div>
          <ChevronRight size={20} className="text-white/70 shrink-0" />
        </div>
      </button>

      {/* Quick actions */}
      <div className="mb-5">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/worker-bookings')} className="card hover:border-primary-500/30 flex items-center gap-3 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CalendarCheck size={20} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Bookings</p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>View requests</p>
            </div>
          </button>
          <button onClick={() => navigate('/jobs')} className="card hover:border-primary-500/30 flex items-center gap-3 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
              <Plus size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Add Job</p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Generate QR</p>
            </div>
          </button>
          <button onClick={() => navigate('/edit-profile')} className="card hover:border-primary-500/30 flex items-center gap-3 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Shield size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Edit Profile</p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Update info</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent jobs */}
      {!loading && jobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>Recent Jobs</h3>
            <button onClick={() => navigate('/jobs')} className="text-primary-600 dark:text-primary-400 text-xs flex items-center gap-1">
              See all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg-surface-3)' }}>
                  <Briefcase size={18} style={{ color: 'var(--text-faint)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{job.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{job.skill} • {new Date(job.completedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`badge text-xs ${job.status === 'reviewed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'}`}>
                  {job.status === 'reviewed' ? '✓ Reviewed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {user?.skills?.length > 0 && (
        <div className="mt-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Your Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span key={skill} className="badge px-3 py-1" style={{ background: 'var(--bg-surface-3)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)', border: '1px solid' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
