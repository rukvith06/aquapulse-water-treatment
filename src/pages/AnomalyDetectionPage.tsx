import React, { useState } from 'react';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  Search,
  AlertTriangle,
  FileQuestion,
} from 'lucide-react';
import { api } from '../services/api';

export const AnomalyDetectionPage: React.FC = () => {
  const { anomalies, injectAnomaly, fetchLatestData } = usePlant();
  const { user } = useAuth();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [paramFilter, setParamFilter] = useState('All');
  const [selectedAnomaly, setSelectedAnomaly] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  const filtered = anomalies.filter((a) => {
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    if (paramFilter !== 'All' && a.parameter !== paramFilter) return false;
    return true;
  });

  const handleInject = async (type: string) => {
    setIsInjecting(true);
    await injectAnomaly(type);
    setIsInjecting(false);
  };

  const handleResolve = async (status: 'Investigating' | 'Resolved') => {
    if (!selectedAnomaly) return;
    setIsResolving(true);
    try {
      const res = await api.updateAnomalyStatus(selectedAnomaly._id || selectedAnomaly.id, {
        status,
        resolutionNotes,
        resolvedBy: user?.name || 'Operator',
      });
      if (res.success) {
        setSelectedAnomaly(null);
        setResolutionNotes('');
        fetchLatestData();
      }
    } catch (err) {
      console.error('Failed to update anomaly status:', err);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span>Automated Anomaly Detection Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold violation and statistical gradient detection running in Node.js server logic
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            Active: <span className="text-rose-400 font-bold">{anomalies.filter((a) => a.status !== 'Resolved').length}</span>
          </span>
          <span className="text-xs font-mono text-slate-400">
            Total Logged: <span className="text-white font-bold">{anomalies.length}</span>
          </span>
        </div>
      </div>

      {/* Anomaly Simulation Test Bench */}
      <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
          <Zap className="h-4 w-4" />
          <span>Interactive Anomaly Injection Test Bench (Demonstration Mode)</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Click any scenario to inject sudden environmental stress and watch the Node.js rule engine trigger instant anomaly records, alert logs, and Gemini dosing updates.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleInject('ph_acid')}
            disabled={isInjecting}
            className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-left hover:bg-rose-900/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">Acid Influx Surge</span>
              <span className="text-[10px] text-rose-400 font-mono font-bold">pH 3.4</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Acid industrial discharge into river intake.</p>
          </button>

          <button
            onClick={() => handleInject('turbidity_spike')}
            disabled={isInjecting}
            className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-left hover:bg-rose-900/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">Storm Turbidity</span>
              <span className="text-[10px] text-rose-400 font-mono font-bold">16.4 NTU</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Severe rainfall erosion runoff surge.</p>
          </button>

          <button
            onClick={() => handleInject('flow_drop')}
            disabled={isInjecting}
            className="rounded-xl border border-amber-900/60 bg-amber-950/40 p-3 text-left hover:bg-amber-900/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Pump Cavitation</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">52 m³/h</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Intake pump suction debris blinding.</p>
          </button>

          <button
            onClick={() => handleInject('temp_spike')}
            disabled={isInjecting}
            className="rounded-xl border border-amber-900/60 bg-amber-950/40 p-3 text-left hover:bg-amber-900/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">Thermal Shock</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">33.5 °C</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Thermal cooling tower discharge.</p>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Severity:</span>
          </span>
          {['All', 'Critical', 'Medium', 'Low'].map((sev) => (
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

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Parameter:</span>
          {['All', 'pH', 'Turbidity', 'Flow Rate', 'Temperature'].map((param) => (
            <button
              key={param}
              onClick={() => setParamFilter(param)}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                paramFilter === param ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {param}
            </button>
          ))}
        </div>
      </div>

      {/* Detected Anomalies Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Anomaly Type</th>
                <th className="px-4 py-3">Parameter</th>
                <th className="px-4 py-3">Detected Value</th>
                <th className="px-4 py-3">Expected Range</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((anom) => (
                <tr key={anom._id || anom.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(anom.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{anom.anomalyType}</td>
                  <td className="px-4 py-3 text-cyan-300">{anom.parameter}</td>
                  <td className="px-4 py-3 font-bold text-rose-400">{anom.currentValue}</td>
                  <td className="px-4 py-3 text-slate-400">{anom.expectedRange}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={anom.severity} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={anom.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedAnomaly(anom);
                        setResolutionNotes(anom.resolutionNotes || '');
                      }}
                      className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-cyan-900/60 hover:text-cyan-300 border border-slate-700 transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500 font-sans">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No matching anomalies found</p>
                    <p className="text-slate-500 mt-1">Water parameters are within nominal operational tolerances.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Resolution Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">{selectedAnomaly.anomalyType}</h3>
              </div>
              <StatusBadge status={selectedAnomaly.severity} />
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Parameter:</span>
                <span className="text-white font-bold">{selectedAnomaly.parameter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Observed Value:</span>
                <span className="text-rose-400 font-bold">{selectedAnomaly.currentValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Standard Spec:</span>
                <span className="text-emerald-400 font-bold">{selectedAnomaly.expectedRange}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 font-sans">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">
                  Recommended Engineering Action:
                </span>
                <p className="text-slate-200">{selectedAnomaly.recommendedAction}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <label className="block text-slate-300 font-medium">Operator Resolution Notes (MongoDB Log):</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Detail corrective actions taken (e.g. flushed backwash lines, throttled intake VFD, increased lime metering)..."
                className="w-full h-24 rounded-xl border border-slate-700 bg-slate-800 p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => handleResolve('Investigating')}
                disabled={isResolving}
                className="rounded-xl border border-amber-600/50 bg-amber-600/20 px-4 py-2 font-semibold text-amber-300 hover:bg-amber-600/30"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleResolve('Resolved')}
                disabled={isResolving}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
              >
                Resolve Anomaly
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
