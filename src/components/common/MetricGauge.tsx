import React from 'react';
import { StatusBadge } from './StatusBadge';
import { LucideIcon } from 'lucide-react';

interface MetricGaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  nominalMin: number;
  nominalMax: number;
  status: 'Normal' | 'Warning' | 'Critical';
  icon: LucideIcon;
  description?: string;
  onClick?: () => void;
}

export const MetricGauge: React.FC<MetricGaugeProps> = ({
  label,
  value,
  unit,
  min,
  max,
  nominalMin,
  nominalMax,
  status,
  icon: Icon,
  description,
  onClick,
}) => {
  // Percentage for the gauge bar
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const nominalMinPct = ((nominalMin - min) / (max - min)) * 100;
  const nominalMaxPct = ((nominalMax - min) / (max - min)) * 100;

  const isLow = value < nominalMin;
  const isHigh = value > nominalMax;

  let accentColor = 'from-emerald-500 to-teal-400';
  let borderColor = 'border-slate-800 hover:border-slate-700';

  if (status === 'Critical') {
    accentColor = 'from-rose-500 to-pink-500';
    borderColor = 'border-rose-900/50 shadow-lg shadow-rose-950/20';
  } else if (status === 'Warning') {
    accentColor = 'from-amber-500 to-orange-400';
    borderColor = 'border-amber-900/50 shadow-lg shadow-amber-950/20';
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-slate-900/90 border ${borderColor} p-5 backdrop-blur-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">{label}</h4>
            <p className="text-xs text-slate-500">Range: {nominalMin} - {nominalMax} {unit}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Main value display */}
      <div className="mt-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-white font-mono">
            {typeof value === 'number' ? value.toFixed(unit === 'm³/h' ? 0 : 2) : value}
          </span>
          <span className="text-sm font-medium text-slate-400 font-mono">{unit}</span>
        </div>
        <div className="text-right">
          {isLow && <span className="text-xs font-semibold text-rose-400">Below Target</span>}
          {isHigh && <span className="text-xs font-semibold text-rose-400">Above Target</span>}
          {!isLow && !isHigh && <span className="text-xs font-medium text-emerald-400">Optimal Range</span>}
        </div>
      </div>

      {/* Range Bar Indicator */}
      <div className="mt-4">
        <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          {/* Target Safe Zone marker */}
          <div
            className="absolute top-0 bottom-0 bg-slate-700/80"
            style={{
              left: `${nominalMinPct}%`,
              width: `${nominalMaxPct - nominalMinPct}%`,
            }}
          />
          {/* Actual Fill */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${accentColor} transition-all duration-700 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>{min}</span>
          <span className="text-slate-400">{nominalMin} - {nominalMax} (Target)</span>
          <span>{max}</span>
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs text-slate-400 line-clamp-1 border-t border-slate-800/80 pt-2">
          {description}
        </p>
      )}
    </div>
  );
};
