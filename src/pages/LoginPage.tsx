import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Waves, LogIn, Shield, User, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, quickLoginAs, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 mb-3">
            <Waves className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">AquaPulse SCADA System</h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-Powered Water Treatment Monitoring & Optimization Platform
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Authorized Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. operator@aquapulse.io"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Security Credential / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to SCADA Dashboard'}
          </button>
        </form>

        {/* 1-Click Demo Evaluation Credentials */}
        <div className="mt-6 border-t border-slate-800 pt-5">
          <p className="text-[11px] text-slate-400 font-medium text-center uppercase tracking-wider mb-2.5">
            Quick 1-Click Evaluation Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => quickLoginAs('Admin')}
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-left hover:border-cyan-500 hover:bg-slate-800 transition-colors"
            >
              <div className="font-bold text-cyan-300 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Plant Director</p>
            </button>

            <button
              onClick={() => quickLoginAs('Operator')}
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-left hover:border-emerald-500 hover:bg-slate-800 transition-colors"
            >
              <div className="font-bold text-emerald-300 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>Operator</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Shift Engineer</p>
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Need new plant personnel credentials? </span>
          <button
            onClick={onSwitchToRegister}
            className="font-semibold text-cyan-400 hover:underline cursor-pointer"
          >
            Register Personnel
          </button>
        </div>
      </div>
    </div>
  );
};
