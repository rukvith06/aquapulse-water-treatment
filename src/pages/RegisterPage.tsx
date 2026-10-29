import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Waves, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Operator',
    department: 'Water Quality Operations',
    shift: 'Day Shift (08:00 - 16:00)',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await register(form);
    if (!res.success) {
      setError(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 mb-3">
            <Waves className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Personnel Registration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorize new operator or plant director in MongoDB
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Full Operator Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. alex@aquapulse.io"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Role Permission</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
              >
                <option value="Operator">Operator</option>
                <option value="Admin">Admin (Director)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Shift</label>
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono text-[11px]"
              >
                <option value="Day Shift (08:00 - 16:00)">Day Shift</option>
                <option value="Swing Shift (16:00 - 00:00)">Swing Shift</option>
                <option value="Night Shift (00:00 - 08:00)">Night Shift</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {isLoading ? 'Creating Personnel Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          <span>Already authorized? </span>
          <button
            onClick={onSwitchToLogin}
            className="font-semibold text-cyan-400 hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
