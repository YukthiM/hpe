import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workersAPI } from '../api';
import WorkerCard from '../components/WorkerCard';
import { Search, TrendingUp, Star, MapPin } from 'lucide-react';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [topWorkers, setTopWorkers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [workersRes, skillsRes] = await Promise.all([
          workersAPI.getAll({ limit: 6, sort: 'reputationScore' }),
          workersAPI.getSkills(),
        ]);
        setTopWorkers(workersRes.data.workers || []);
        setSkills((skillsRes.data.skills || []).slice(0, 12));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const popularCategories = [
    { name: 'Electrician', emoji: '⚡', color: 'bg-yellow-500/15 text-yellow-400' },
    { name: 'Plumber', emoji: '🔧', color: 'bg-blue-500/15 text-blue-400' },
    { name: 'Tutor', emoji: '📚', color: 'bg-emerald-500/15 text-emerald-400' },
    { name: 'Carpenter', emoji: '🪚', color: 'bg-amber-500/15 text-amber-400' },
    { name: 'Painter', emoji: '🎨', color: 'bg-pink-500/15 text-pink-400' },
    { name: 'Cleaner', emoji: '🧹', color: 'bg-purple-500/15 text-purple-400' },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/50 text-sm">Hello 👋</p>
          <h1 className="font-display text-xl font-bold">{user?.name?.split(' ')[0]}</h1>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="text-white/40 text-xs px-3 py-1.5 rounded-lg bg-white/10">
          Sign out
        </button>
      </div>

      {/* Search bar */}
      <div
        onClick={() => navigate('/search')}
        className="flex items-center gap-3 bg-surface-3 border border-white/10 rounded-2xl px-4 py-3.5 mb-6 cursor-pointer hover:border-primary-500/30 transition"
      >
        <Search size={18} className="text-white/40" />
        <span className="text-white/40 text-sm">Search by skill, location...</span>
      </div>

      {/* Popular categories */}
      <div className="mb-6">
        <h2 className="font-semibold text-sm text-white/70 mb-3">Popular Categories</h2>
        <div className="grid grid-cols-3 gap-2">
          {popularCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/search?skill=${encodeURIComponent(cat.name)}`)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/10 ${cat.color} hover:scale-105 transition-all active:scale-95`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top rated workers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-white/70 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary-400" /> Top Rated Workers
          </h2>
          <button onClick={() => navigate('/search')} className="text-primary-400 text-xs">
            See all
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topWorkers.map((worker) => (
              <WorkerCard key={worker._id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
