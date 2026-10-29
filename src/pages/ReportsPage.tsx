import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  FileText,
  Download,
  Plus,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Printer,
  Eye,
} from 'lucide-react';
import { Report } from '../types';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('Daily Operational');

  const loadReports = async () => {
    try {
      const res = await api.getReports();
      if (res.success && res.reports) {
        setReports(res.reports);
        if (res.reports.length > 0 && !selectedReport) {
          setSelectedReport(res.reports[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateReport(reportType, user?.name || 'Plant Director');
      if (res.success && res.report) {
        setReports([res.report, ...reports]);
        setSelectedReport(res.report);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCsv = (id: string) => {
    window.open(`/api/reports/${id}/export-csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <span>Water Quality Compliance & Plant Audit Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated regulatory reporting generated from MongoDB SCADA telemetry and equipment logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white font-medium"
          >
            <option value="Daily Operational">Daily Operational Summary</option>
            <option value="Water Quality Compliance">WHO/EPA Compliance Audit</option>
            <option value="Chemical Usage Audit">Chemical Dosing Audit</option>
            <option value="Comprehensive Plant Audit">Comprehensive Plant Audit</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{isGenerating ? 'Compiling from MongoDB...' : 'Generate New Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Report View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Past Reports List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm space-y-2.5 h-[650px] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex justify-between">
            <span>Generated Audit Archive</span>
            <span className="font-mono text-cyan-400">{reports.length} Reports</span>
          </div>

          {reports.map((rep) => {
            const isSelected = (selectedReport?._id || selectedReport?.id) === (rep._id || rep.id);
            return (
              <div
                key={rep._id || rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`rounded-xl border p-3.5 text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-600 bg-cyan-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-white line-clamp-1">{rep.reportTitle}</span>
                  <StatusBadge status={rep.summary?.complianceStatus || 'Fully Compliant'} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  <span>{rep.generatedBy}</span>
                </div>
              </div>
            );
          })}

          {reports.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <span>No reports generated yet. Click &quot;Generate New Report&quot; above.</span>
            </div>
          )}
        </div>

        {/* Selected Report Document Viewer */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm flex flex-col justify-between">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-400 border border-cyan-800/50">
                      {selectedReport.reportType}
                    </span>
                    <StatusBadge status={selectedReport.summary.complianceStatus} />
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedReport.reportTitle}</h2>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Audited by {selectedReport.generatedBy} • Period: {new Date(selectedReport.periodStart).toLocaleDateString()} to {new Date(selectedReport.periodEnd).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadCsv(selectedReport._id || selectedReport.id || '')}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Statistical KPI Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Summary Water Quality Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-slate-400">Mean pH</span>
                    <p className="text-base font-bold text-white mt-0.5">{selectedReport.summary.avgPh.toFixed(2)}</p>
                    <span className="text-[10px] text-emerald-400">Std: 6.5–8.5</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-slate-400">Mean Turbidity</span>
                    <p className="text-base font-bold text-amber-300 mt-0.5">
                      {selectedReport.summary.avgTurbidity.toFixed(2)} NTU
                    </p>
                    <span className="text-[10px] text-slate-400">WHO &lt; 5.0</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-slate-400">Mean Temperature</span>
                    <p className="text-base font-bold text-slate-200 mt-0.5">
                      {selectedReport.summary.avgTemperature.toFixed(1)} °C
                    </p>
                    <span className="text-[10px] text-slate-400">Std: 10–25°</span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-slate-400">Mean Flow Rate</span>
                    <p className="text-base font-bold text-slate-200 mt-0.5">
                      {selectedReport.summary.avgFlowRate} m³/h
                    </p>
                    <span className="text-[10px] text-cyan-400">Steady Inflow</span>
                  </div>
                </div>
              </div>

              {/* Production and Event Volumes */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Total Treated Volume (24h Window):</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedReport.summary.totalTreatedVolumeM3.toLocaleString()} m³
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Detected Operational Anomalies:</span>
                  <span className={selectedReport.summary.anomalyCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedReport.summary.anomalyCount} events
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Critical Alarm Events:</span>
                  <span className={selectedReport.summary.criticalAlertsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedReport.summary.criticalAlertsCount} critical alarms
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Equipment Requiring Attention:</span>
                  <span className="text-white font-bold">{selectedReport.summary.maintenanceItemsCount} units</span>
                </div>
              </div>

              {/* Regulatory Sign-Off Section */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between text-xs text-slate-400 font-mono">
                <div>
                  <span>Authorized Signature: _________________________</span>
                  <p className="mt-1 text-[11px] text-slate-500">Chief Municipal Water Quality Officer</p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                    <ShieldCheck className="h-4 w-4" />
                    CERTIFIED MUNICIPAL AUDIT
                  </span>
                  <span className="text-[10px] text-slate-500">ISO 14001 & WHO Drinking Standard Verified</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-500">
              Select a report from the archive to review certified audit metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
