import React, { useState } from 'react';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, activeAlertsCount, acknowledgeAlert, acknowledgeAllAlerts } = usePlant();
  const { user } = useAuth();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = alerts.filter((a) => {
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-400" />
            <span>Industrial Alarm Feed & Event Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time critical events generated from SCADA sensor thresholds, equipment health, and chemical dosing systems
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeAlertsCount > 0 && (
            <button
              onClick={() => acknowledgeAllAlerts()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <CheckCheck className="h-4 w-4 text-cyan-400" />
              <span>Acknowledge All ({activeAlertsCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Severity:</span>
          {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                severityFilter === sev ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          {['All', 'Active', 'Acknowledged'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                statusFilter === st ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const isCritical = alert.severity === 'Critical';
          const isWarning = alert.severity === 'Warning';

          return (
            <div
              key={alert._id || alert.id}
              className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.status === 'Active'
                  ? isCritical
                    ? 'border-rose-900/70 bg-gradient-to-r from-rose-950/30 to-slate-900 shadow-md shadow-rose-950/20'
                    : isWarning
                    ? 'border-amber-900/60 bg-gradient-to-r from-amber-950/30 to-slate-900 shadow-md shadow-amber-950/20'
                    : 'border-slate-800 bg-slate-900/80'
                  : 'border-slate-800/60 bg-slate-950/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${
                    isCritical
                      ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      : isWarning
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                  }`}
                >
                  {isCritical ? <ShieldAlert className="h-5 w-5" /> : isWarning ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-white">{alert.title}</span>
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{alert.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    {alert.threshold && <span>Threshold Spec: {alert.threshold}</span>}
                    {alert.acknowledgedBy && (
                      <span className="text-cyan-400">Acknowledged by {alert.acknowledgedBy}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                {alert.status === 'Active' ? (
                  <button
                    onClick={() => acknowledgeAlert(alert._id || alert.id || '')}
                    className="rounded-xl bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-300 text-slate-200 border border-slate-700 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Acknowledged
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Alarms Present</h3>
            <p className="text-xs text-slate-400 mt-1">
              All SCADA stations report nominal status without threshold alarms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
