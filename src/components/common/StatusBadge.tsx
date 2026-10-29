import React from 'react';

interface StatusBadgeProps {
  status: 'Normal' | 'Warning' | 'Critical' | 'Optimal' | 'Detected' | 'Investigating' | 'Resolved' | 'Operational' | 'Maintenance Required' | 'Offline' | 'Active' | 'Acknowledged' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status?.toLowerCase() || 'normal';

  let bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let dotClass = 'bg-emerald-400';

  if (normalized.includes('critical') || normalized.includes('offline') || normalized === 'high') {
    bgClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    dotClass = 'bg-rose-400 animate-pulse';
  } else if (
    normalized.includes('warning') ||
    normalized.includes('maintenance') ||
    normalized.includes('investigating') ||
    normalized === 'medium' ||
    normalized.includes('adjustment')
  ) {
    bgClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    dotClass = 'bg-amber-400';
  } else if (normalized.includes('acknowledged') || normalized.includes('resolved') || normalized === 'low') {
    bgClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    dotClass = 'bg-cyan-400';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bgClass} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {status}
    </span>
  );
};
