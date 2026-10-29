import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Clock,
  Briefcase,
  CheckCircle2,
  Key,
  LogOut,
  Mail,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const ProfilePage: React.FC = () => {
  const { user, logout, quickLoginAs, updateProfile } = useAuth();
  const [department, setDepartment] = useState(user?.department || 'Operations Wing');
  const [shift, setShift] = useState(user?.shift || 'Day Shift (08:00 - 16:00)');
  const [name, setName] = useState(user?.name || 'Operator');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile({ name, department, shift });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="h-5 w-5 text-cyan-400" />
          <span>Operator Credentials & Role Access Control</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Identity management and role-based access for SCADA telemetry and chemical dosing calibration
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-bold text-2xl">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.name || 'Authorized Operator'}</h2>
              <p className="text-xs text-slate-400">{user?.email || 'operator@aquapulse.io'}</p>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={user?.role === 'Admin' ? 'Admin Access' : 'Plant Operator'} />
                <span className="text-[11px] text-slate-500 font-mono">SCADA Authorization Level 3</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => quickLoginAs('Admin')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-slate-700 transition-colors"
            >
              Switch to Admin
            </button>
            <button
              onClick={() => quickLoginAs('Operator')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-slate-700 transition-colors"
            >
              Switch to Operator
            </button>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Authorized Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-400 text-xs font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Assigned Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Duty Shift Assignment</label>
              <input
                type="text"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {saved ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-4 w-4" /> Profile credentials updated in MongoDB!
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-mono">Stored securely in MongoDB User collection</span>
            )}
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      </div>

      {/* Role Permissions Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 font-mono text-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          MERN Role-Based Access Privileges (RBAC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5">
            <span className="font-bold text-cyan-400 font-sans">Plant Operator Privileges:</span>
            <p>✓ View real-time SCADA telemetry</p>
            <p>✓ Acknowledge threshold alarms</p>
            <p>✓ Log benchtop grab samples</p>
            <p>✓ Consult Gemini AI Assistant</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5">
            <span className="font-bold text-emerald-400 font-sans">Plant Director (Admin) Privileges:</span>
            <p>✓ All Operator capabilities</p>
            <p>✓ Commit AI chemical dosage changes to SCADA</p>
            <p>✓ Log completed equipment overhaul records</p>
            <p>✓ Sign & export official regulatory audit reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};
