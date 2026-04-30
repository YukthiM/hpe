const statusConfig = {
  pending:          { label: 'Pending',          color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',  emoji: '⏳' },
  accepted:         { label: 'Accepted',         color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',        emoji: '✅' },
  rejected:         { label: 'Rejected',         color: 'bg-red-500/15 text-red-400 border-red-500/30',            emoji: '❌' },
  in_progress:      { label: 'In Progress',      color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',  emoji: '🔧' },
  awaiting_payment: { label: 'Awaiting Payment', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', emoji: '💳' },
  paid:             { label: 'Paid',             color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', emoji: '💰' },
  done:             { label: 'Completed',        color: 'bg-green-500/15 text-green-400 border-green-500/30',    emoji: '🎉' },
};

export default function BookingStatusBadge({ status, size = 'md' }) {
  const cfg = statusConfig[status] || { label: status, color: 'bg-white/10 text-white/60 border-white/10', emoji: '•' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${cfg.color} ${sizeClass}`}>
      <span>{cfg.emoji}</span>
      {cfg.label}
    </span>
  );
}
