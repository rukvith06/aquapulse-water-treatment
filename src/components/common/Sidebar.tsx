import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Sparkles,
  ShieldAlert,
  Wrench,
  Bell,
  LineChart,
  FileText,
  Bot,
  User,
  Sliders,
  Radio,
} from 'lucide-react';
import { usePlant } from '../../context/PlantContext';
import { useAuth } from '../../context/AuthContext';

export type TabType =
  | 'dashboard'
  | 'monitoring'
  | 'dosage'
  | 'anomalies'
  | 'maintenance'
  | 'alerts'
  | 'analytics'
  | 'reports'
  | 'ai-chat'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { activeAlertsCount, activeAnomaliesCount } = usePlant();
  const { user } = useAuth();

  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Water Quality', icon: Activity },
    { id: 'dosage', label: 'AI Chemical Dosage', icon: Sparkles },
    {
      id: 'anomalies',
      label: 'Anomaly Detection',
      icon: ShieldAlert,
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    { id: 'maintenance', label: 'Predictive Maint.', icon: Wrench },
    {
      id: 'alerts',
      label: 'Alerts & Actions',
      icon: Bell,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    { id: 'analytics', label: 'Analytics & Trends', icon: LineChart },
    { id: 'reports', label: 'Reports & Audits', icon: FileText },
    { id: 'ai-chat', label: 'AI Plant Assistant', icon: Bot },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between hidden md:flex">
      {/* Navigation List */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Plant Telemetry & Control
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Configuration & Profile
        </div>

        <button
          onClick={() => onSelectTab('profile')}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
            currentTab === 'profile'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <User className="h-4 w-4 text-slate-500" />
          <span>Operator Profile</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Sliders className="h-4 w-4 text-slate-500" />
          <span>Plant Thresholds</span>
        </button>
      </div>

      {/* Footer Plant Status Mini Card */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/80">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">SCADA Host</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <Radio className="h-3 w-3 animate-pulse text-emerald-400" /> 100% ONLINE
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Stack: MERN (Express + MongoDB)
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate">
            User: {user?.name || 'Authorized Operator'}
          </div>
        </div>
      </div>
    </aside>
  );
};
