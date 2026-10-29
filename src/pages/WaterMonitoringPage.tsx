import React, { useState } from 'react';
import { usePlant } from '../context/PlantContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Activity,
  Plus,
  RefreshCw,
  Droplet,
  Wind,
  Flame,
  Gauge,
  SlidersHorizontal,
  Download,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';

export const WaterMonitoringPage: React.FC = () => {
  const {
    latestReading,
    readingHistory,
    triggerImmediateTick,
    fetchLatestData,
  } = usePlant();

  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedParam, setSelectedParam] = useState<'all' | 'ph' | 'turbidity' | 'temperature' | 'flowRate'>('all');
  const [manualForm, setManualForm] = useState({
    ph: 7.2,
    turbidity: 1.5,
    temperature: 20.0,
    flowRate: 240,
    dissolvedOxygen: 7.4,
    conductivity: 320,
    stage: 'Treated Outlet',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ph = latestReading?.ph ?? 7.32;
  const turbidity = latestReading?.turbidity ?? 1.65;
  const temperature = latestReading?.temperature ?? 19.8;
  const flowRate = latestReading?.flowRate ?? 245;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.addManualReading(manualForm);
      if (res.success) {
        setShowManualModal(false);
        fetchLatestData();
      }
    } catch (err) {
      console.error('Failed to submit manual reading:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sparkline data calculation for SVG chart
  const reversedHistory = [...readingHistory].reverse();
  const maxTurb = Math.max(...reversedHistory.map((r) => r.turbidity), 5.0);
  const maxFlow = Math.max(...reversedHistory.map((r) => r.flowRate), 400);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <span>Water Quality Sensor Telemetry & Inflow Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time IoT sensor telemetry streams from Intake, Clarifiers, Filters, and Final Distribution Outlets
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerImmediateTick()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Poll Sensors Now</span>
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Log Grab Sample</span>
          </button>
        </div>
      </div>

      {/* 4 Sensor Cards with Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* pH Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400">
                <Droplet className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Potential Hydrogen</h3>
                <span className="text-xs text-slate-500">Probe: Alpha-pH-920</span>
              </div>
            </div>
            <StatusBadge status={ph < 6.0 || ph > 9.0 ? 'Critical' : ph < 6.5 || ph > 8.5 ? 'Warning' : 'Normal'} />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold font-mono text-white">{ph.toFixed(2)}</span>
              <span className="ml-1 text-xs text-slate-400 font-mono">pH units</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">Target: 6.5 – 8.5</span>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
            <span>Electrochemical: ±0.02</span>
            <span className="text-emerald-400">Within Standard</span>
          </div>
        </div>

        {/* Turbidity Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400">
                <Wind className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Nephelometric Turbidity</h3>
                <span className="text-xs text-slate-500">Sensor: OptiLaser-50</span>
              </div>
            </div>
            <StatusBadge status={turbidity > 10.0 ? 'Critical' : turbidity > 5.0 ? 'Warning' : 'Normal'} />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold font-mono text-white">{turbidity.toFixed(2)}</span>
              <span className="ml-1 text-xs text-slate-400 font-mono">NTU</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">Target: &lt; 5.0 NTU</span>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
            <span>Laser Scattering: 860nm</span>
            <span className={turbidity < 2.0 ? 'text-emerald-400' : 'text-amber-400'}>
              {turbidity < 2.0 ? 'Crystal Clear' : 'Coagulation Active'}
            </span>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Water Temperature</h3>
                <span className="text-xs text-slate-500">Sensor: PT100 RTD</span>
              </div>
            </div>
            <StatusBadge status={temperature > 30.0 || temperature < 8.0 ? 'Warning' : 'Normal'} />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold font-mono text-white">{temperature.toFixed(1)}</span>
              <span className="ml-1 text-xs text-slate-400 font-mono">°C</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">Target: 10 – 25 °C</span>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
            <span>Thermal Gradient: 0.1°/h</span>
            <span className="text-emerald-400">Standard Kinetic</span>
          </div>
        </div>

        {/* Flow Rate Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400">
                <Gauge className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Volumetric Flow Rate</h3>
                <span className="text-xs text-slate-500">Meter: MagFlow-400</span>
              </div>
            </div>
            <StatusBadge status={flowRate < 80 ? 'Critical' : flowRate > 480 ? 'Warning' : 'Normal'} />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold font-mono text-white">{flowRate}</span>
              <span className="ml-1 text-xs text-slate-400 font-mono">m³/h</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">Target: 120 – 450</span>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
            <span>Electromagnetic Flow</span>
            <span className="text-emerald-400">Capacity 62%</span>
          </div>
        </div>
      </div>

      {/* Real-time Multi-Parameter Trend Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Real-Time Sensor Telemetry Timeline (Last 30 Readings)
            </h2>
            <p className="text-xs text-slate-400">Visualizing stream variance across pH, Turbidity, and Intake Flow</p>
          </div>

          {/* Parameter selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-medium">
            <button
              onClick={() => setSelectedParam('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedParam === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setSelectedParam('ph')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedParam === 'ph' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              pH Only
            </button>
            <button
              onClick={() => setSelectedParam('turbidity')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedParam === 'turbidity' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Turbidity Only
            </button>
            <button
              onClick={() => setSelectedParam('flowRate')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedParam === 'flowRate' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Flow Rate Only
            </button>
          </div>
        </div>

        {/* Dynamic SVG Visualizer */}
        <div className="h-64 w-full relative bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-end">
          <svg className="w-full h-48 overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold grid lines */}
            <line x1="0" y1="35" x2="500" y2="35" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="0" y1="115" x2="500" y2="115" stroke="#334155" strokeWidth="1" />

            {/* Turbidity Line (Amber) */}
            {(selectedParam === 'all' || selectedParam === 'turbidity') && (
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={reversedHistory
                  .map((r, i) => {
                    const x = (i / Math.max(1, reversedHistory.length - 1)) * 500;
                    const y = 140 - Math.min(130, (r.turbidity / maxTurb) * 120);
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* pH Line (Cyan) */}
            {(selectedParam === 'all' || selectedParam === 'ph') && (
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={reversedHistory
                  .map((r, i) => {
                    const x = (i / Math.max(1, reversedHistory.length - 1)) * 500;
                    // Scale pH 4.0 - 10.0 to 140 -> 20
                    const y = 140 - Math.min(130, Math.max(10, ((r.ph - 4) / 6) * 120));
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Flow Rate Line (Emerald) */}
            {(selectedParam === 'all' || selectedParam === 'flowRate') && (
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray={selectedParam === 'all' ? '4 2' : 'none'}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={reversedHistory
                  .map((r, i) => {
                    const x = (i / Math.max(1, reversedHistory.length - 1)) * 500;
                    const y = 140 - Math.min(130, (r.flowRate / maxFlow) * 120);
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
          </svg>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-800/60 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              pH Signal (Scaled 4.0 - 10.0)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Turbidity (NTU)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Flow Rate (m³/h)
            </span>
          </div>
        </div>
      </div>

      {/* Historical Readings Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Historical Sensor Log & Lab Calibration Data
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Stored in MongoDB • {readingHistory.length} Total Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">pH</th>
                <th className="px-4 py-3">Turbidity</th>
                <th className="px-4 py-3">Temperature</th>
                <th className="px-4 py-3">Flow Rate</th>
                <th className="px-4 py-3">Dissolved O₂</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {readingHistory.map((reading, idx) => (
                <tr key={reading._id || reading.id || idx} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(reading.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-cyan-300">{reading.stage || 'Treated Outlet'}</td>
                  <td className="px-4 py-3 font-bold text-white">{reading.ph.toFixed(2)}</td>
                  <td className="px-4 py-3 text-amber-300">{reading.turbidity.toFixed(2)} NTU</td>
                  <td className="px-4 py-3 text-slate-300">{reading.temperature.toFixed(1)} °C</td>
                  <td className="px-4 py-3 text-slate-300">{reading.flowRate} m³/h</td>
                  <td className="px-4 py-3 text-slate-400">{reading.dissolvedOxygen || 7.2} mg/L</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={reading.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Manual Sensor Reading */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Log Operator Grab Sample</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter benchtop laboratory measurements to calibrate online SCADA nodes.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">pH Level (4.0 - 11.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.ph}
                    onChange={(e) => setManualForm({ ...manualForm, ph: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Turbidity (NTU)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.turbidity}
                    onChange={(e) => setManualForm({ ...manualForm, turbidity: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualForm.temperature}
                    onChange={(e) => setManualForm({ ...manualForm, temperature: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Flow Rate (m³/h)</label>
                  <input
                    type="number"
                    value={manualForm.flowRate}
                    onChange={(e) => setManualForm({ ...manualForm, flowRate: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Sampling Stage</label>
                <select
                  value={manualForm.stage}
                  onChange={(e) => setManualForm({ ...manualForm, stage: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                >
                  <option value="Intake">Raw Water Intake</option>
                  <option value="Coagulation">Coagulation Basin</option>
                  <option value="Filtration">Rapid Sand Filtration Gallery</option>
                  <option value="Disinfection">Chlorination Contact Basin</option>
                  <option value="Treated Outlet">Treated Outlet Effluent</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Commit to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
