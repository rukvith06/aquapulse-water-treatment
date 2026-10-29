import React, { useState } from 'react';
import { usePlant } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Sparkles,
  FlaskConical,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { api } from '../services/api';

export const DosageOptimizationPage: React.FC = () => {
  const { latestReading, activeRates, applyChemicalDosages, dosages } = usePlant();
  const { user } = useAuth();

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState<{
    recommendation: string;
    reason: string;
    dosageAdjustment: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    status: 'Optimal' | 'Adjustment Recommended' | 'Critical Adjustment';
    suggestedDosages: {
      alum: number;
      chlorine: number;
      sodaAsh: number;
      polymer: number;
    };
    source: string;
  } | null>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const ph = latestReading?.ph ?? 7.32;
  const turbidity = latestReading?.turbidity ?? 1.65;
  const temperature = latestReading?.temperature ?? 19.8;
  const flowRate = latestReading?.flowRate ?? 245;

  const handleRunAI = async () => {
    setIsLoadingAI(true);
    setApplySuccess(false);
    try {
      const res = await api.getAIDosageRecommendation({
        ph,
        turbidity,
        temperature,
        flowRate,
      });

      if (res.success && res.data) {
        setAiResult(res.data);
      }
    } catch (err) {
      console.error('Failed to get AI dosage recommendation:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleApply = async () => {
    if (!aiResult) return;
    setIsApplying(true);
    try {
      const success = await applyChemicalDosages({
        alum: aiResult.suggestedDosages.alum,
        chlorine: aiResult.suggestedDosages.chlorine,
        sodaAsh: aiResult.suggestedDosages.sodaAsh,
        polymer: aiResult.suggestedDosages.polymer,
        reason: aiResult.reason,
        operatorName: user?.name || 'Operator',
      });
      if (success) {
        setApplySuccess(true);
      }
    } catch (err) {
      console.error('Failed to apply dosages:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>AI Chemical Dosage Recommendation Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Optimizes coagulation, disinfection, and buffering rates using Google Gemini API & jar-test kinetic models
          </p>
        </div>

        <button
          onClick={handleRunAI}
          disabled={isLoadingAI}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className={`h-4 w-4 ${isLoadingAI ? 'animate-spin' : ''}`} />
          <span>{isLoadingAI ? 'Consulting Gemini API...' : 'Generate AI Recommendation'}</span>
        </button>
      </div>

      {/* Real-time Water Conditions Input Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Active Inflow Conditions (Fed into AI Optimizer)</span>
          <span className="font-mono text-[10px] text-cyan-400">Station Sensor Inflow</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-400">Intake pH</span>
            <p className="text-lg font-bold text-white mt-1">{ph.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-400">Turbidity (Colloid Load)</span>
            <p className="text-lg font-bold text-amber-300 mt-1">{turbidity.toFixed(2)} NTU</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-400">Water Temperature</span>
            <p className="text-lg font-bold text-slate-200 mt-1">{temperature.toFixed(1)} °C</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <span className="text-[11px] text-slate-400">Flow Throughput</span>
            <p className="text-lg font-bold text-slate-200 mt-1">{flowRate} m³/h</p>
          </div>
        </div>
      </div>

      {/* Main AI Recommendation Card */}
      {aiResult ? (
        <div className="rounded-2xl border border-indigo-900/50 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-900/60 border border-indigo-700/60 text-indigo-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini Dosage Recommendation</h3>
                <p className="text-xs text-indigo-300">
                  Model: Google Gemini 3.8 Flash • Processed via Node.js/Express Backend
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={aiResult.status} />
              <StatusBadge status={`Risk: ${aiResult.riskLevel}`} />
            </div>
          </div>

          {/* Recommendation & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                AI Recommendation Summary
              </h4>
              <p className="text-sm font-medium text-white leading-relaxed">{aiResult.recommendation}</p>
              <div className="mt-2 text-xs text-cyan-400 font-mono">
                Adjustment: {aiResult.dosageAdjustment}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Technical Chemical Rationale
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{aiResult.reason}</p>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="px-4 py-3">Chemical Reagent</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Current Rate</th>
                  <th className="px-4 py-3 text-cyan-400">Recommended Rate</th>
                  <th className="px-4 py-3">Delta Difference</th>
                  <th className="px-4 py-3">Safety Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="px-4 py-3 font-semibold text-white">Alum [Al₂(SO₄)₃]</td>
                  <td className="px-4 py-3 text-slate-400">Colloid Coagulation</td>
                  <td className="px-4 py-3 text-slate-300">{activeRates.alum} mg/L</td>
                  <td className="px-4 py-3 text-cyan-300 font-bold">
                    {aiResult.suggestedDosages.alum} mg/L
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-400">
                    {(aiResult.suggestedDosages.alum - activeRates.alum).toFixed(1)} mg/L
                  </td>
                  <td className="px-4 py-3 text-slate-500">&lt; 80 mg/L</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-white">Sodium Hypochlorite</td>
                  <td className="px-4 py-3 text-slate-400">Primary Disinfection</td>
                  <td className="px-4 py-3 text-slate-300">{activeRates.chlorine} mg/L</td>
                  <td className="px-4 py-3 text-cyan-300 font-bold">
                    {aiResult.suggestedDosages.chlorine} mg/L
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-400">
                    {(aiResult.suggestedDosages.chlorine - activeRates.chlorine).toFixed(2)} mg/L
                  </td>
                  <td className="px-4 py-3 text-slate-500">&lt; 5.0 mg/L</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-white">Soda Ash (Na₂CO₃)</td>
                  <td className="px-4 py-3 text-slate-400">pH Stabilization</td>
                  <td className="px-4 py-3 text-slate-300">{activeRates.sodaAsh} mg/L</td>
                  <td className="px-4 py-3 text-cyan-300 font-bold">
                    {aiResult.suggestedDosages.sodaAsh} mg/L
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-400">
                    {(aiResult.suggestedDosages.sodaAsh - activeRates.sodaAsh).toFixed(1)} mg/L
                  </td>
                  <td className="px-4 py-3 text-slate-500">&lt; 50 mg/L</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-white">Polymer Floc Aid</td>
                  <td className="px-4 py-3 text-slate-400">Bridging Settling</td>
                  <td className="px-4 py-3 text-slate-300">{activeRates.polymer} mg/L</td>
                  <td className="px-4 py-3 text-cyan-300 font-bold">
                    {aiResult.suggestedDosages.polymer} mg/L
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-400">
                    {(aiResult.suggestedDosages.polymer - activeRates.polymer).toFixed(2)} mg/L
                  </td>
                  <td className="px-4 py-3 text-slate-500">&lt; 2.0 mg/L</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="h-4 w-4 text-cyan-400 flex-shrink-0" />
              <span>
                Prototype Disclaimer: AI recommendations support operator supervision and require jar-test verification.
              </span>
            </div>

            <div className="flex items-center gap-3">
              {applySuccess && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="h-4 w-4" />
                  SCADA calibrated successfully!
                </span>
              )}
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isApplying ? 'Applying to SCADA...' : 'Apply AI Dosage to Plant'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-950/80 border border-indigo-800/40 text-indigo-400 mx-auto">
            <FlaskConical className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">AI Dosing Assistant Ready</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click &quot;Generate AI Recommendation&quot; to send current live telemetry (pH {ph.toFixed(2)}, Turbidity{' '}
            {turbidity.toFixed(2)} NTU) to Gemini via the Express backend.
          </p>
          <button
            onClick={handleRunAI}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Compute Recommended Rates Now
          </button>
        </div>
      )}

      {/* Historical Dosage Adjustments Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
          Chemical Dosing Calibration Log (MongoDB)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Chemical Reagent</th>
                <th className="px-4 py-3">Dosage</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">Operator / Source</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dosages.map((d, i) => (
                <tr key={d._id || d.id || i} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{d.chemicalName}</td>
                  <td className="px-4 py-3 text-cyan-300">
                    {d.currentDosage} {d.unit}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.riskLevel} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {d.appliedBy || (d.aiGenerated ? 'Gemini AI Model' : 'SCADA Controller')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
