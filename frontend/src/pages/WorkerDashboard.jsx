import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../api';
import ReputationBadge from '../components/ReputationBadge';
import VerifiedBadge from '../components/VerifiedBadge';
import StarRating from '../components/StarRating';
import { Plus, Briefcase, Star, Shield, Share2, Bell, ChevronRight, TrendingUp, CalendarCheck } from 'lucide-react';
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
          <p className="text-white/50 text-sm">Good morning 👋</p>
          <h1 className="font-display text-xl font-bold">{user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={shareProfile} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <Share2 size={18} />
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-xs">
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
            <p className="text-white/50 text-xs">Score Progress</p>
            <div className="w-24 bg-white/10 rounded-full h-2 mt-1">
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
            <p className="font-bold text-xl">{s.value}</p>
            <p className="text-white/50 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="mb-5">
          <h3 className="font-semibold text-sm text-white/70 mb-3">Your Badges</h3>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((b, i) => (
              <span key={i} className="badge bg-primary-500/15 text-primary-300 border border-primary-500/20 px-3 py-1 text-sm">
                {b.icon} {b.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-5">
        <h3 className="font-semibold text-sm text-white/70 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/worker-bookings')} className="card hover:border-primary-500/30 flex items-center gap-3 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CalendarCheck size={20} className="text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Bookings</p>
              <p className="text-white/40 text-xs">View requests</p>
            </div>
          </button>
          <button onClick={() => navigate('/jobs')} className="card hover:border-primary-500/30 flex items-center gap-3 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Plus size={20} className="text-primary-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Add Job</p>
              <p className="text-white/40 text-xs">Generate QR</p>
            </div>
          </button>
          <button onClick={() => navigate('/edit-profile')} className="card hover:border-primary-500/30 flex items-center gap-3 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield size={20} className="text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Edit Profile</p>
              <p className="text-white/40 text-xs">Update info</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent jobs */}
      {!loading && jobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white/70">Recent Jobs</h3>
            <button onClick={() => navigate('/jobs')} className="text-primary-400 text-xs flex items-center gap-1">
              See all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{job.title}</p>
                  <p className="text-white/40 text-xs">{job.skill} • {new Date(job.completedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`badge text-xs ${job.status === 'reviewed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
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
          <h3 className="font-semibold text-sm text-white/70 mb-3">Your Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span key={skill} className="badge bg-surface-3 text-white/70 border border-white/10 px-3 py-1">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
