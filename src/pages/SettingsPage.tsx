import React, { useState } from 'react';
import { usePlant } from '../context/PlantContext';
import {
  Sliders,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const {
    isSimulationRunning,
    toggleSimulation,
    simulationInterval,
    dbStatus,
    fetchLatestData,
  } = usePlant();

  const [intervalMs, setIntervalMs] = useState(simulationInterval);
  const [speedSaved, setSpeedSaved] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [reseedDone, setReseedDone] = useState(false);

  const handleUpdateSpeed = async () => {
    try {
      const res = await api.setSimulationSpeed(intervalMs);
      if (res.success) {
        setSpeedSaved(true);
        setTimeout(() => setSpeedSaved(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update speed:', err);
    }
  };

  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      const res = await fetch('/api/simulation/reseed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReseedDone(true);
        fetchLatestData();
        setTimeout(() => setReseedDone(false), 3000);
      }
    } catch (err) {
      console.error('Failed to reseed database:', err);
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders className="h-5 w-5 text-cyan-400" />
          <span>SCADA Inflow Engine & Database Diagnostic Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust background sensor sample frequencies, review MongoDB connection state, and calibrate threshold limits
        </p>
      </div>

      {/* Simulation Engine Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SCADA Inflow Stream Frequency</h3>
              <p className="text-xs text-slate-400">Controls background sample generation and MongoDB ingestion rate</p>
            </div>
          </div>
          <button
            onClick={toggleSimulation}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
              isSimulationRunning
                ? 'bg-amber-600/20 text-amber-300 border border-amber-600/40 hover:bg-amber-600/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isSimulationRunning ? 'Pause Stream' : 'Resume Stream'}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Sample Frequency Interval:</span>
            <span className="text-white font-bold">{intervalMs / 1000} seconds ({intervalMs} ms)</span>
          </div>

          <input
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={intervalMs}
            onChange={(e) => setIntervalMs(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1.0s (High Throughput)</span>
            <span>4.0s (Nominal Industrial)</span>
            <span>10.0s (Low Power)</span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpdateSpeed}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
            >
              {speedSaved ? '✓ Applied Frequency' : 'Save Sample Rate'}
            </button>
          </div>
        </div>
      </div>

      {/* Database Diagnostic Status */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">MongoDB Architecture State</h3>
            <p className="text-xs text-slate-400">Strict MERN database layer handling collections and queries</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <span className="text-slate-400">Connection Mode:</span>
            <p className="text-sm font-bold text-emerald-400">
              {dbStatus.type === 'mongodb' ? 'MongoDB Atlas / External Cluster' : 'High-Performance Embedded Engine'}
            </p>
            <p className="text-[11px] text-slate-500">
              Configured via MONGO_URI in .env file. Automatic fallback ensures zero downtime.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <span className="text-slate-400">Active Collections:</span>
            <p className="text-sm font-bold text-cyan-300">9 Core MongoDB Schemas</p>
            <p className="text-[11px] text-slate-500">
              User, WaterReading, ChemicalDosage, Anomaly, Equipment, MaintenanceRecord, Alert, ChatMessage, Report
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Reset default historical data & equipment baseline:</span>
          <button
            onClick={handleReseed}
            disabled={isReseeding}
            className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors"
          >
            {reseedDone ? '✓ Reseeded Baseline' : isReseeding ? 'Reseeding...' : 'Reseed Demo Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
