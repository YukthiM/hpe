import { BadgeCheck } from 'lucide-react';

export default function VerifiedBadge({ status = 'not_submitted', size = 'sm' }) {
  if (status !== 'verified') return null;

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSizes = { sm: 12, md: 14, lg: 16 };

  return (
    <span className={`inline-flex items-center ${sizes[size]} bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-medium`}>
      <BadgeCheck size={iconSizes[size]} className="shrink-0" />
      ID Verified
    </span>
  );
}
