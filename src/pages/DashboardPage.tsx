import React from 'react';
import { usePlant } from '../context/PlantContext';
import { MetricGauge } from '../components/common/MetricGauge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Droplet,
  Flame,
  Activity,
  Wind,
  Sparkles,
  ShieldAlert,
  Wrench,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Layers,
} from 'lucide-react';
import { TabType } from '../components/common/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: TabType) => void;
  onOpenChat: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenChat }) => {
  const {
    latestReading,
    readingHistory,
    anomalies,
    alerts,
    activeAlertsCount,
    activeRates,
    equipmentList,
    acknowledgeAlert,
    isSimulationRunning,
  } = usePlant();

  const ph = latestReading?.ph ?? 7.32;
  const turbidity = latestReading?.turbidity ?? 1.65;
  const temperature = latestReading?.temperature ?? 19.8;
  const flowRate = latestReading?.flowRate ?? 245;

  // Determine Overall Plant State
  let overallStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  if (latestReading?.status === 'Critical' || activeAlertsCount >= 3) {
    overallStatus = 'Critical';
  } else if (latestReading?.status === 'Warning' || activeAlertsCount > 0) {
    overallStatus = 'Warning';
  }

  // Calculate high-risk equipment
  const criticalEquipment = equipmentList.filter((e) => e.status !== 'Operational' || e.maintenanceRisk === 'High');

  return (
    <div className="space-y-6">
      {/* Top Banner / Plant SCADA Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Water Treatment Plant Central Control
            </h1>
            <StatusBadge status={overallStatus === 'Normal' ? 'Plant Operational' : overallStatus === 'Warning' ? 'Attention Required' : 'Critical Hazard'} />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Intake Flow: {flowRate} m³/h • Effluent Outlet: 0.22 NTU • SCADA Node: Station 04-Alpha
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-600/25 hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Consult AI Assistant</span>
          </button>
          <button
            onClick={() => onNavigate('dosage')}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            <span>Dosage Optimizer</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION A: WATER QUALITY OVERVIEW GAUGES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span>A. Core Water Quality Parameters (Real-Time)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Updated {latestReading ? new Date(latestReading.timestamp).toLocaleTimeString() : 'Just now'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricGauge
            label="Potential Hydrogen (pH)"
            value={ph}
            unit="pH"
            min={4.0}
            max={11.0}
            nominalMin={6.5}
            nominalMax={8.5}
            status={ph < 6.0 || ph > 9.0 ? 'Critical' : ph < 6.5 || ph > 8.5 ? 'Warning' : 'Normal'}
            icon={Droplet}
            description="Optimal coagulant destabilization occurs between pH 6.8 - 7.6."
            onClick={() => onNavigate('monitoring')}
          />

          <MetricGauge
            label="Turbidity"
            value={turbidity}
            unit="NTU"
            min={0.0}
            max={20.0}
            nominalMin={0.1}
            nominalMax={5.0}
            status={turbidity > 10.0 ? 'Critical' : turbidity > 5.0 ? 'Warning' : 'Normal'}
            icon={Wind}
            description="Treated water target is < 1.0 NTU. Rapid sand filters active."
            onClick={() => onNavigate('monitoring')}
          />

          <MetricGauge
            label="Water Temperature"
            value={temperature}
            unit="°C"
            min={5.0}
            max={40.0}
            nominalMin={10.0}
            nominalMax={25.0}
            status={temperature > 30.0 || temperature < 8.0 ? 'Warning' : 'Normal'}
            icon={Flame}
            description="Influences chlorine contact time kinetics and dissolved oxygen saturation."
            onClick={() => onNavigate('monitoring')}
          />

          <MetricGauge
            label="Plant Flow Rate"
            value={flowRate}
            unit="m³/h"
            min={0}
            max={500}
            nominalMin={120}
            nominalMax={450}
            status={flowRate < 80 ? 'Critical' : flowRate > 480 ? 'Warning' : 'Normal'}
            icon={Activity}
            description="Intake Low-Lift Pump #01 delivering continuous raw surface supply."
            onClick={() => onNavigate('monitoring')}
          />
        </div>
      </div>

      {/* SECTION B & C: CHEMICAL DOSAGE & ANOMALY DETECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* B. Chemical Dosage Preview */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950 border border-indigo-800/40 text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  B. AI Chemical Dosage Optimization
                </h3>
                <p className="text-xs text-slate-400">Jar-test kinetics calibrated against current turbidity & pH</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('dosage')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Full Dosage Page</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Alum Coagulant</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-white">{activeRates.alum}</span>
                <span className="text-xs text-slate-400">mg/L</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Auto-metered</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Sodium Hypochlorite</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-white">{activeRates.chlorine}</span>
                <span className="text-xs text-slate-400">mg/L</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>0.5 ppm residual</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Soda Ash (Buffer)</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-white">{activeRates.sodaAsh}</span>
                <span className="text-xs text-slate-400">mg/L</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>pH Neutralizer</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <span className="text-[11px] font-medium text-slate-400">Polymer Floc Aid</span>
              <div className="mt-1 flex items-baseline gap-1 font-mono">
                <span className="text-xl font-bold text-white">{activeRates.polymer}</span>
                <span className="text-xs text-slate-400">mg/L</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Floc bridging</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-cyan-900/30 bg-cyan-950/20 p-3 flex items-center justify-between text-xs">
            <span className="text-cyan-300">
              💡 Gemini Recommendation: Water chemistry stabilized. Floc sedimentation rate is optimal in clarifier basin #1.
            </span>
            <button
              onClick={() => onNavigate('dosage')}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex-shrink-0 cursor-pointer"
            >
              Analyze with Gemini
            </button>
          </div>
        </div>

        {/* C. Anomaly Detection Widget */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-950 border border-rose-800/40 text-rose-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  C. Anomaly Detection
                </h3>
              </div>
              <button
                onClick={() => onNavigate('anomalies')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                View ({anomalies.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {anomalies.slice(0, 3).map((anom) => (
                <div
                  key={anom._id || anom.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{anom.anomalyType}</span>
                    <StatusBadge status={anom.severity} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {anom.parameter}: {anom.currentValue} (Target: {anom.expectedRange})
                    </span>
                    <span>{new Date(anom.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}

              {anomalies.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                  <span>No active anomalies detected in current stream.</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('anomalies')}
            className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-800/60 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Open Anomaly Log & Test Injections →
          </button>
        </div>
      </div>

      {/* SECTION D, E, F: PREDICTIVE MAINTENANCE, RECENT ALERTS, SYSTEM STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D. Predictive Maintenance Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950 border border-amber-800/40 text-amber-400">
                <Wrench className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                D. Predictive Maintenance
              </h3>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              All Assets ({equipmentList.length})
            </button>
          </div>

          <div className="space-y-3">
            {equipmentList.slice(0, 3).map((eq) => (
              <div
                key={eq._id || eq.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-200">{eq.equipmentName}</span>
                  <StatusBadge status={eq.maintenanceRisk === 'High' ? 'High Risk' : eq.status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-2">
                  <span>Hours: {eq.operatingHours} / {eq.maxOperatingHours}h</span>
                  <span>Health: {eq.healthScore}%</span>
                </div>
                {/* Health progress bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      eq.healthScore > 80 ? 'bg-emerald-400' : eq.healthScore > 65 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${eq.healthScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* E. Recent Alerts */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950 border border-red-800/40 text-red-400">
                <Bell className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                E. Recent Alerts ({alerts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Alerts Feed
            </button>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert._id || alert.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs flex items-start justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{alert.title}</span>
                    <StatusBadge status={alert.severity} size="sm" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{alert.message}</p>
                </div>
                {alert.status === 'Active' && (
                  <button
                    onClick={() => acknowledgeAlert(alert._id || alert.id || '')}
                    className="flex-shrink-0 text-[10px] bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-300 text-slate-300 rounded px-2 py-1 border border-slate-700 transition-colors"
                  >
                    Ack
                  </button>
                )}
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                <span>Zero alerts. System nominal.</span>
              </div>
            )}
          </div>
        </div>

        {/* F. System Status & SCADA Telemetry */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800/40 text-cyan-400">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                F. System & SCADA Status
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">SCADA Inflow Stream</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  {isSimulationRunning ? '4000ms TICK' : 'PAUSED'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Database Layer</span>
                <span className="text-cyan-400">MongoDB (Active)</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">AI Integration</span>
                <span className="text-indigo-400">Gemini 3.8 Flash</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Est. Daily Volume</span>
                <span className="text-white">{(flowRate * 24).toLocaleString()} m³/day</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Compliance Rate</span>
                <span className="text-emerald-400 font-bold">98.6%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-blue-500 transition-all cursor-pointer"
          >
            Generate Certified Plant Audit Report →
          </button>
        </div>
      </div>
    </div>
  );
};
