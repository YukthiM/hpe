import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jobsAPI, reviewsAPI } from '../api';
import StarRating from '../components/StarRating';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const REVIEW_TAGS = ['Punctual', 'Professional', 'Quality Work', 'Clean', 'Fair Price', 'Friendly', 'Expert', 'Highly Recommend'];

export default function ReviewPage() {
  const { qrToken } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ reviewerName: '', reviewerEmail: '', comment: '', tags: [] });

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await jobsAPI.verifyQR(qrToken);
        setJob(data.job);
      } catch (err) {
        const msg = err.response?.data?.message || 'Invalid QR code';
        const isUsed = err.response?.data?.alreadyReviewed;
        if (isUsed) setAlreadyReviewed(true);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [qrToken]);

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reviewerName.trim()) return toast.error('Please enter your name');
    setSubmitting(true);
    try {
      await reviewsAPI.submit(qrToken, { ...form, rating });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Success state
  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Review Submitted!</h1>
        <p className="text-white/60 mb-6">
          Your verified review has been recorded. Thank you for helping build trust in the gig economy!
        </p>
        <div className="glass p-4 text-left">
          <p className="text-white/50 text-xs font-medium mb-1">🔗 Blockchain Integrity</p>
          <p className="text-white/30 text-xs font-mono">Your review is cryptographically hashed and cannot be altered.</p>
        </div>
        <div className="mt-6">
          <a href="/" className="btn-primary inline-block px-8">Return to GigVerify</a>
        </div>
      </div>
    </div>
  );

  // Already reviewed
  if (alreadyReviewed) return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500/40 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={40} className="text-yellow-400" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Already Reviewed</h1>
        <p className="text-white/60">This QR code has already been used to submit a review. Each job can only have one verified review.</p>
      </div>
    </div>
  );

  // Invalid QR
  if (error && !job) return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-sm w-full text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-danger/20 border-2 border-danger/40 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={40} className="text-danger" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Invalid QR Code</h1>
        <p className="text-white/60">{error}</p>
      </div>
    </div>
  );

  const worker = job?.worker;
  const initials = worker?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen px-4 py-8 max-w-sm mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
          <Zap size={13} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-medium">Verified Review</span>
        </div>
        <h1 className="font-display text-2xl font-bold">Rate Your Experience</h1>
        <p className="text-white/50 text-sm mt-1">Your review is cryptographically verified</p>
      </div>

      {/* Worker card */}
      {worker && (
        <div className="card mb-5 flex items-center gap-3">
          {worker.avatar ? (
            <img src={worker.avatar} alt={worker.name} className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold">{worker.name}</p>
            {job.skill && <p className="text-white/50 text-sm">{job.skill}</p>}
            {job.title && <p className="text-white/40 text-xs mt-0.5">{job.title}</p>}
          </div>
        </div>
      )}

      {/* Review form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star rating */}
        <div className="card text-center">
          <p className="text-white/70 text-sm font-medium mb-3">How would you rate the work?</p>
          <div className="flex justify-center mb-2">
            <StarRating rating={rating} interactive onChange={setRating} size={40} />
          </div>
          <p className="text-white/50 text-sm">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
          </p>
        </div>

        {/* Tags */}
        <div>
          <p className="text-white/70 text-sm font-medium mb-2">What stood out? (optional)</p>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  form.tags.includes(tag)
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                    : 'border-white/10 text-white/50 hover:border-white/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">Your Review (optional)</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Describe your experience with this worker..."
            rows={3} className="input-field resize-none"
          />
        </div>

        {/* Name */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">Your Name *</label>
          <input
            value={form.reviewerName}
            onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
            required placeholder="Anita Singh" className="input-field"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">Your Email (optional)</label>
          <input
            type="email"
            value={form.reviewerEmail}
            onChange={(e) => setForm({ ...form, reviewerEmail: e.target.value })}
            placeholder="anita@example.com" className="input-field"
          />
        </div>

        <div className="glass p-3">
          <p className="text-white/40 text-xs">
            🔐 This review is linked to a unique QR code from the actual job. It cannot be faked or duplicated.
          </p>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
          {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '⭐'}
          {submitting ? 'Submitting...' : 'Submit Verified Review'}
        </button>
      </form>
    </div>
  );
}
