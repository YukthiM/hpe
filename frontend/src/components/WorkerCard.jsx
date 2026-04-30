import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import ReputationBadge from './ReputationBadge';
import VerifiedBadge from './VerifiedBadge';
import { MapPin, Briefcase, CalendarPlus } from 'lucide-react';

export default function WorkerCard({ worker }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = worker.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="card hover:border-primary-500/30 hover:shadow-glow cursor-pointer transition-all duration-300 active:scale-[0.99] animate-fade-in">
      <div
        onClick={() => navigate(`/profile/${worker.publicProfileSlug || worker._id}`)}
        className="flex items-start gap-3"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          {worker.avatar ? (
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-14 h-14 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
          )}
          {worker.idVerified && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeWidth="2" stroke="white" fill="none" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{worker.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <StarRating rating={worker.averageRating} size={12} />
                <span className="text-gray-500 dark:text-white/50 text-xs">
                  {worker.averageRating?.toFixed(1)} ({worker.totalRatings})
                </span>
              </div>
            </div>
            <ReputationBadge score={worker.reputationScore} tier={worker.reputationTier} size="sm" showScore={false} />
          </div>

          {/* Location & Jobs */}
          <div className="flex items-center gap-3 mt-2 text-gray-400 dark:text-white/50 text-xs">
            {worker.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {worker.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase size={11} /> {worker.completedJobsCount} jobs
            </span>
          </div>

          {/* Skills */}
          {worker.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {worker.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="text-xs bg-primary-500/15 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              {worker.skills.length > 3 && (
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>+{worker.skills.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Now button — only for clients */}
      {user?.role === 'client' && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/book/${worker._id}`); }}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl
            bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs
            hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all shadow-sm"
        >
          <CalendarPlus size={14} /> Book Now
        </button>
      )}
    </div>
  );
}

