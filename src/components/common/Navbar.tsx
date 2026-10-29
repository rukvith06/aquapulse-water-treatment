import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlant } from '../../context/PlantContext';
import {
  Waves,
  Play,
  Pause,
  AlertTriangle,
  Zap,
  Database,
  User as UserIcon,
  LogOut,
  ChevronDown,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  onOpenChat: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat, onOpenSettings }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const {
    isSimulationRunning,
    toggleSimulation,
    injectAnomaly,
    activeAlertsCount,
    dbStatus,
    triggerImmediateTick,
    latestReading,
  } = usePlant();

  const [showAnomalyMenu, setShowAnomalyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  const handleInject = async (type: string) => {
    setIsInjecting(true);
    await injectAnomaly(type);
    setIsInjecting(false);
    setShowAnomalyMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 md:px-6 backdrop-blur-md">
      {/* Brand & Plant Identity */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
          <Waves className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">AquaPulse</span>
            <span className="hidden sm:inline-block rounded bg-cyan-950 border border-cyan-800/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-400">
              SCADA v2.4
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400">
            AI-Powered Water Treatment Monitoring & Optimization
          </p>
        </div>
      </div>

      {/* Center SCADA Telemetry Stream Controls */}
      <div className="hidden lg:flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isSimulationRunning && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isSimulationRunning ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-xs font-mono font-medium text-slate-300">
            {isSimulationRunning ? 'LIVE SCADA STREAM' : 'SIMULATION PAUSED'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <button
          onClick={toggleSimulation}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          title={isSimulationRunning ? 'Pause SCADA stream' : 'Resume SCADA stream'}
        >
          {isSimulationRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{isSimulationRunning ? 'Pause' : 'Resume'}</span>
        </button>

        <button
          onClick={triggerImmediateTick}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          title="Force immediate sensor sample"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sample</span>
        </button>
      </div>

      {/* Action Controls & User */}
      <div className="flex items-center gap-3">
        {/* Anomaly Testing Quick Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAnomalyMenu(!showAnomalyMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-900/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Simulate Anomaly</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showAnomalyMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400">
                Trigger Plant Stress Scenario:
              </div>
              <button
                disabled={isInjecting}
                onClick={() => handleInject('ph_acid')}
                className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
              >
                <span>🧪 Acid Influx Surge (pH 3.4)</span>
                <span className="text-[10px] text-rose-400 font-mono">Critical</span>
              </button>
              <button
                disabled={isInjecting}
                onClick={() => handleInject('turbidity_spike')}
                className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
              >
                <span>🌧️ Storm Turbidity (16.4 NTU)</span>
                <span className="text-[10px] text-rose-400 font-mono">Critical</span>
              </button>
              <button
                disabled={isInjecting}
                onClick={() => handleInject('flow_drop')}
                className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
              >
                <span>⚠️ Intake Pump Cavitation (52 m³/h)</span>
                <span className="text-[10px] text-amber-400 font-mono">Warning</span>
              </button>
              <button
                disabled={isInjecting}
                onClick={() => handleInject('temp_spike')}
                className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
              >
                <span>🔥 Thermal Inversion (33.5 °C)</span>
                <span className="text-[10px] text-amber-400 font-mono">Warning</span>
              </button>
            </div>
          )}
        </div>

        {/* Database Chip */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-[11px] font-mono text-slate-400">
          <Database className="h-3.5 w-3.5 text-emerald-400" />
          <span>MongoDB: {dbStatus.type === 'mongodb' ? 'Atlas Connected' : 'Engine Ready'}</span>
        </div>

        {/* User Profile / Quick Login Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 hover:border-slate-700 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-900/50 text-cyan-400 font-semibold text-xs">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                {user ? user.name.split(' ')[0] : 'Guest'}
              </p>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase">
                {user?.role || 'Visitor'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              {user ? (
                <>
                  <div className="border-b border-slate-800 px-3 py-2">
                    <p className="text-xs font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-400 border border-cyan-800/40">
                      Role: {user.role}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onOpenSettings) onOpenSettings();
                      }}
                      className="w-full text-left rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sliders className="h-3.5 w-3.5 text-slate-400" />
                      <span>Settings & Thresholds</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left rounded-lg px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-2">
                  <p className="text-xs font-medium text-slate-400 mb-2">Switch Demo Credentials:</p>
                  <button
                    onClick={() => {
                      quickLoginAs('Admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-slate-800 font-medium"
                  >
                    👑 Log in as Admin (Plant Director)
                  </button>
                  <button
                    onClick={() => {
                      quickLoginAs('Operator');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-slate-800 font-medium"
                  >
                    🛠️ Log in as Operator (Shift Engineer)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
