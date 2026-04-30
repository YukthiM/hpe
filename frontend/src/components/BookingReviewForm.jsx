import { useState } from 'react';
import { bookingsAPI } from '../api';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

const TAGS = ['Punctual', 'Professional', 'Quality Work', 'Friendly', 'Fast', 'Reliable'];

export default function BookingReviewForm({ bookingId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a star rating.');
    setLoading(true);
    try {
      await bookingsAPI.submitReview(bookingId, { rating, comment, tags: selectedTags });
      toast.success('Review submitted! Thank you 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-500/5">
      <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Star size={18} className="text-yellow-400 fill-yellow-400" />
        Rate Your Experience
      </h3>

      {/* Star picker */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={32}
              className={`transition-colors ${
                star <= (hovered || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-white/20'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500 dark:text-white/50 self-center">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedTags.includes(tag)
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/10 hover:border-indigo-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share details about your experience…"
        rows={3}
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition resize-none mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !rating}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}
