import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, interactive = false, onChange, size = 20 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(i + 1)}
          className={`transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}
            fill={i < Math.round(rating) ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}
