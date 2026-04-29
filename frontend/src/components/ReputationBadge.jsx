import { Star } from 'lucide-react';

const tierConfig = {
  Bronze: { color: 'tier-bronze', emoji: '🥉', glow: 'shadow-amber-900/40' },
  Silver: { color: 'tier-silver', emoji: '🥈', glow: 'shadow-slate-400/20' },
  Gold: { color: 'tier-gold', emoji: '🥇', glow: 'shadow-yellow-500/30' },
  Platinum: { color: 'tier-platinum', emoji: '💎', glow: 'shadow-primary-400/30' },
};

export default function ReputationBadge({ score = 0, tier = 'Bronze', size = 'md', showScore = true }) {
  const config = tierConfig[tier] || tierConfig.Bronze;

  const sizes = {
    sm: { badge: 'text-xs px-2 py-0.5', score: 'text-sm', emoji: 'text-sm' },
    md: { badge: 'text-sm px-3 py-1', score: 'text-2xl', emoji: 'text-xl' },
    lg: { badge: 'text-base px-4 py-1.5', score: 'text-4xl', emoji: 'text-2xl' },
  };

  const s = sizes[size] || sizes.md;

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`text-6xl font-bold gradient-text`}>{score}</div>
        <div className={`badge ${config.color} ${s.badge} shadow-lg ${config.glow}`}>
          <span className={s.emoji}>{config.emoji}</span>
          <span>{tier}</span>
        </div>
        {showScore && (
          <p className="text-white/50 text-xs">Reputation Score / 100</p>
        )}
      </div>
    );
  }

  return (
    <div className={`badge ${config.color} ${s.badge} shadow-sm`}>
      <span className={s.emoji}>{config.emoji}</span>
      {showScore && <span className="font-bold">{score}</span>}
      <span>{tier}</span>
    </div>
  );
}
