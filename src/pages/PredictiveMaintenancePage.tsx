import React, { useState } from 'react';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Wrench,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { Equipment } from '../types';

export const PredictiveMaintenancePage: React.FC = () => {
  const { equipmentList, fetchLatestData } = usePlant();
  const { user } = useAuth();

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    maintenanceType: 'Preventive',
    description: '',
    partsReplaced: '',
    cost: 450,
    downtimeHours: 2.0,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    setIsSubmitting(true);

    try {
      const res = await api.createMaintenanceRecord({
        equipmentId: selectedEquipment.code,
        equipmentName: selectedEquipment.equipmentName,
        maintenanceType: logForm.maintenanceType,
        description: logForm.description || `Scheduled ${logForm.maintenanceType} service performed.`,
        performedBy: user?.name || 'Lead Technician',
        partsReplaced: logForm.partsReplaced ? logForm.partsReplaced.split(',').map((s) => s.trim()) : [],
        cost: Number(logForm.cost),
        downtimeHours: Number(logForm.downtimeHours),
        notes: logForm.notes,
        status: 'Completed',
      });

      if (res.success) {
        setShowLogModal(false);
        setSelectedEquipment(null);
        fetchLatestData();
      }
    } catch (err) {
      console.error('Failed to log maintenance:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-amber-400" />
            <span>Predictive Asset Health & Maintenance Forecasting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time equipment telemetry: running hours, vibration analysis, thermal dissipation, and wear modeling in Node.js
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Total Monitored Assets: <span className="text-white font-bold">{equipmentList.length}</span>
          </span>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipmentList.map((eq) => {
          const hoursPercent = Math.min(100, Math.round((eq.operatingHours / eq.maxOperatingHours) * 100));
          const isHighRisk = eq.maintenanceRisk === 'High' || eq.status !== 'Operational';

          return (
            <div
              key={eq._id || eq.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                isHighRisk
                  ? 'border-rose-900/60 bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-900 shadow-lg shadow-rose-950/20'
                  : 'border-slate-800 bg-slate-900/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{eq.code}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{eq.equipmentName}</h3>
                    <p className="text-xs text-slate-400">{eq.location}</p>
                  </div>
                  <StatusBadge status={eq.maintenanceRisk === 'High' ? 'High Risk' : eq.status} size="sm" />
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 my-3 rounded-xl bg-slate-950/70 p-2.5 text-center font-mono border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Health</span>
                    <p className={`text-sm font-bold mt-0.5 ${eq.healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {eq.healthScore}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Vibration</span>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{eq.vibrationLevel} mm/s</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Motor Temp</span>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{eq.motorTemperature} °C</p>
                  </div>
                </div>

                {/* Operating Hours Progress */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Operating Wear:</span>
                    <span className="text-white font-medium">
                      {eq.operatingHours} / {eq.maxOperatingHours} hrs ({hoursPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hoursPercent > 90 ? 'bg-rose-500' : hoursPercent > 75 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${hoursPercent}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-1 text-xs text-slate-400 font-mono border-t border-slate-800/80 pt-2.5">
                  <div className="flex justify-between">
                    <span>Last Overhaul:</span>
                    <span className="text-slate-300">{new Date(eq.lastMaintenance).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Due Date:</span>
                    <span className={isHighRisk ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {new Date(eq.nextMaintenance).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Recommendation Note */}
                <div className="mt-3 rounded-lg bg-slate-950/60 p-2.5 text-xs text-slate-300 border border-slate-800/60">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                    AI Predictive Recommendation:
                  </span>
                  <p className="line-clamp-2">{eq.maintenanceRecommendation}</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedEquipment(eq);
                  setShowLogModal(true);
                }}
                className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-300 py-2 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Log Maintenance / Reset Risk
              </button>
            </div>
          );
        })}
      </div>

      {/* Log Maintenance Modal */}
      {showLogModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Log Completed Service</h3>
            <p className="text-xs text-slate-400 mb-4">
              Recording service for <span className="text-cyan-400 font-semibold">{selectedEquipment.equipmentName}</span> will recalibrate its health score to 98% in MongoDB.
            </p>

            <form onSubmit={handleLogMaintenance} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Service Type</label>
                <select
                  value={logForm.maintenanceType}
                  onChange={(e) => setLogForm({ ...logForm, maintenanceType: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                >
                  <option value="Preventive">Preventive Maintenance (PM)</option>
                  <option value="Corrective">Corrective Repair</option>
                  <option value="Calibration">Sensor/Meter Calibration</option>
                  <option value="Overhaul">Component Overhaul</option>
                  <option value="Inspection">Visual & Thermal Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Work Description</label>
                <input
                  type="text"
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  placeholder="e.g. Replaced peristaltic dosing tube & seals"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Parts Replaced (comma separated)</label>
                  <input
                    type="text"
                    value={logForm.partsReplaced}
                    onChange={(e) => setLogForm({ ...logForm, partsReplaced: e.target.value })}
                    placeholder="e.g. Gaskets, Impeller"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Downtime (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={logForm.downtimeHours}
                    onChange={(e) => setLogForm({ ...logForm, downtimeHours: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Commit Maintenance Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
