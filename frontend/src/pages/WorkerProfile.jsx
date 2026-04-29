import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workersAPI, reviewsAPI } from '../api';
import ReputationBadge from '../components/ReputationBadge';
import StarRating from '../components/StarRating';
import VerifiedBadge from '../components/VerifiedBadge';
import { MapPin, Briefcase, Share2, ChevronLeft, Shield, ExternalLink, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await workersAPI.getById(id);
        setData(res.data);
        setReviews(res.data.reviews || []);
      } catch (err) {
        toast.error('Worker not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const shareProfile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${data?.worker?.name} — GigVerify`, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied!');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return null;
  const { worker, portfolio } = data;
  const initials = worker.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-surface/80 backdrop-blur-lg border-b border-white/5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/60 hover:text-white transition">
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium text-sm truncate max-w-[200px]">{worker.name}</span>
        <button onClick={shareProfile} className="text-white/60 hover:text-white transition">
          <Share2 size={18} />
        </button>
      </div>

      {/* Hero section */}
      <div className="relative bg-gradient-to-b from-primary-600/20 to-transparent px-5 pt-6 pb-4">
        <div className="flex items-start gap-4">
          {worker.avatar ? (
            <img src={worker.avatar} alt={worker.name} className="w-20 h-20 rounded-3xl object-cover border-2 border-primary-500/30" />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-primary-500/30">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-xl">{worker.name}</h1>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <VerifiedBadge status={worker.idVerificationStatus} size="sm" />
              {worker.isAvailable && (
                <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs">
                  ● Available
                </span>
              )}
            </div>
            {worker.location && (
              <p className="text-white/50 text-sm flex items-center gap-1 mt-1.5">
                <MapPin size={13} /> {worker.location}
              </p>
            )}
          </div>
        </div>

        {/* Reputation */}
        <div className="flex items-center gap-4 mt-4 p-4 bg-surface-2/60 rounded-2xl border border-white/5">
          <ReputationBadge score={worker.reputationScore} tier={worker.reputationTier} size="md" />
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <StarRating rating={worker.averageRating} size={14} />
              <span className="text-white/70 text-sm font-medium">{(worker.averageRating || 0).toFixed(1)}</span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">{worker.totalRatings} verified reviews • {worker.completedJobsCount} jobs</p>
          </div>
        </div>

        {/* Skills */}
        {worker.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {worker.skills.map((s) => (
              <span key={s} className="badge bg-primary-500/15 text-primary-400 border border-primary-500/20 px-3 py-1 text-sm">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Badges */}
        {worker.badges?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {worker.badges.map((b, i) => (
              <span key={i} className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs px-2 py-0.5">
                {b.icon} {b.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-5 sticky top-12 z-10 bg-surface">
        {[
          { key: 'about', label: 'About' },
          { key: 'portfolio', label: 'Work' },
          { key: 'reviews', label: `Reviews (${reviews.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-primary-500 text-primary-400' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4">
        {/* About tab */}
        {tab === 'about' && (
          <div className="space-y-4 animate-fade-in">
            {portfolio?.about && (
              <div className="card">
                <h3 className="font-semibold text-sm text-white/70 mb-2">About</h3>
                <p className="text-white/80 text-sm leading-relaxed">{portfolio.about}</p>
              </div>
            )}
            {worker.experience > 0 && (
              <div className="card flex items-center gap-3">
                <Clock size={20} className="text-primary-400" />
                <div>
                  <p className="font-medium text-sm">{worker.experience} years experience</p>
                  <p className="text-white/40 text-xs">In the field</p>
                </div>
              </div>
            )}
            {portfolio?.certifications?.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-white/70 mb-3">Certifications</h3>
                <div className="space-y-2">
                  {portfolio.certifications.map((cert, i) => (
                    <div key={i} className="card flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <Shield size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cert.name}</p>
                        {cert.issuer && <p className="text-white/50 text-xs">{cert.issuer}</p>}
                        {cert.issueDate && (
                          <p className="text-white/30 text-xs mt-0.5">
                            {new Date(cert.issueDate).getFullYear()}
                            {cert.expiryDate ? ` – ${new Date(cert.expiryDate).getFullYear()}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portfolio tab */}
        {tab === 'portfolio' && (
          <div className="animate-fade-in">
            {portfolio?.workImages?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {portfolio.workImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-surface-3">
                    <img src={img.url} alt={img.caption || 'Work'} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30">
                <p className="text-4xl mb-2">📷</p>
                <p className="text-sm">No work images yet</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {tab === 'reviews' && (
          <div className="space-y-3 animate-fade-in">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <p className="text-4xl mb-2">💬</p>
                <p className="text-sm">No reviews yet</p>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{r.reviewerName}</p>
                      <StarRating rating={r.rating} size={13} />
                    </div>
                    <div className="text-right">
                      <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs">
                        ✓ Verified
                      </span>
                      <p className="text-white/30 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  {r.comment && <p className="text-white/70 text-sm leading-relaxed">{r.comment}</p>}
                  {r.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.tags.map((tag, i) => (
                        <span key={i} className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Integrity hash */}
                  {r.integrityHash && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-white/20 text-xs font-mono truncate">
                        🔗 {r.integrityHash.slice(0, 32)}...
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
