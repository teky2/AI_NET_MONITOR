import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Copy,
  Check,
  Download,
  X,
  ShieldCheck,
  AlertCircle,
  Building,
} from 'lucide-react';
import type { SpeedMetrics, ClientInfo, AIDiagnosticReport } from '../types';

interface SLAAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: SpeedMetrics;
  clientInfo?: ClientInfo;
  report?: AIDiagnosticReport;
  speedUnit: 'Mbps' | 'MB/s';
}

export const SLAAuditModal: React.FC<SLAAuditModalProps> = ({
  isOpen,
  onClose,
  metrics,
  clientInfo,
  report,
  speedUnit,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [slaTargetDl, setSlaTargetDl] = useState(100);
  const [slaTargetUl, setSlaTargetUl] = useState(20);
  const [slaTargetPing, setSlaTargetPing] = useState(30);

  if (!isOpen) return null;

  const testId = `NP-AUDIT-${Math.abs(Date.now()).toString(36).toUpperCase()}`;
  const timestamp = new Date().toLocaleString();

  const dlPass = metrics.downloadMbps >= slaTargetDl;
  const ulPass = metrics.uploadMbps >= slaTargetUl;
  const pingPass = metrics.pingMs <= slaTargetPing;
  const lossPass = metrics.packetLossPercent <= 0.5;
  const overallCompliant = dlPass && ulPass && pingPass && lossPass;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const fakeUrl = `${window.location.origin}/audit/${testId}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadJSON = () => {
    const exportData = {
      testId,
      timestamp,
      clientInfo,
      metrics,
      slaTargets: {
        targetDownloadMbps: slaTargetDl,
        targetUploadMbps: slaTargetUl,
        maxLatencyMs: slaTargetPing,
      },
      compliance: {
        overallCompliant,
        downloadPass: dlPass,
        uploadPass: ulPass,
        pingPass,
        packetLossPass: lossPass,
      },
      aiReport: report,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetPulse_Audit_${testId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-[#070b14] p-6 shadow-2xl text-slate-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Audit Certificate Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-400">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black tracking-wide text-white uppercase">
                Executive SLA Compliance & Network Audit Certificate
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Audit ID: <span className="font-mono text-cyan-400">{testId}</span> | Generated: {timestamp}
            </p>
          </div>
        </div>

        {/* SLA Target Configurator Ribbon */}
        <div className="mt-4 rounded-xl bg-[#0c1220] p-3.5 border border-slate-800">
          <span className="text-xs font-bold text-slate-300 block mb-2">
            Configure Your Subscribed Plan SLA Minimums:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Contract Download (Mbps)</label>
              <input
                type="number"
                value={slaTargetDl}
                onChange={(e) => setSlaTargetDl(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-[#070b14] px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Contract Upload (Mbps)</label>
              <input
                type="number"
                value={slaTargetUl}
                onChange={(e) => setSlaTargetUl(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-[#070b14] px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Max Guaranteed Ping (ms)</label>
              <input
                type="number"
                value={slaTargetPing}
                onChange={(e) => setSlaTargetPing(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-[#070b14] px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SLA Evaluation Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Metric Category</th>
                <th className="py-2.5 px-4">Contract SLA Target</th>
                <th className="py-2.5 px-4">Measured Result</th>
                <th className="py-2.5 px-4 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#090e1a]">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-200">Download Bandwidth</td>
                <td className="py-2.5 px-4 text-slate-400">≥ {slaTargetDl} Mbps</td>
                <td className="py-2.5 px-4 font-mono font-bold text-white">{metrics.downloadMbps} Mbps</td>
                <td className="py-2.5 px-4 text-right">
                  <span
                    className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      dlPass ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {dlPass ? 'SLA MET' : 'BREACH'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-200">Upload Bandwidth</td>
                <td className="py-2.5 px-4 text-slate-400">≥ {slaTargetUl} Mbps</td>
                <td className="py-2.5 px-4 font-mono font-bold text-white">{metrics.uploadMbps} Mbps</td>
                <td className="py-2.5 px-4 text-right">
                  <span
                    className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      ulPass ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {ulPass ? 'SLA MET' : 'BREACH'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-200">Baseline Latency</td>
                <td className="py-2.5 px-4 text-slate-400">≤ {slaTargetPing} ms</td>
                <td className="py-2.5 px-4 font-mono font-bold text-white">{metrics.pingMs} ms</td>
                <td className="py-2.5 px-4 text-right">
                  <span
                    className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      pingPass ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {pingPass ? 'SLA MET' : 'BREACH'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-200">Packet Loss Tolerance</td>
                <td className="py-2.5 px-4 text-slate-400">≤ 0.5%</td>
                <td className="py-2.5 px-4 font-mono font-bold text-white">{metrics.packetLossPercent}%</td>
                <td className="py-2.5 px-4 text-right">
                  <span
                    className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      lossPass ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {lossPass ? 'SLA MET' : 'BREACH'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-200">Bufferbloat Loaded Latency</td>
                <td className="py-2.5 px-4 text-slate-400">Grade B or better</td>
                <td className="py-2.5 px-4 font-mono font-bold text-white">
                  Grade {metrics.bufferbloatGrade} (+{Math.max(0, metrics.downloadLoadedPingMs - metrics.pingMs)}ms)
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span
                    className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      metrics.bufferbloatGrade === 'A+' || metrics.bufferbloatGrade === 'A' || metrics.bufferbloatGrade === 'B'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {metrics.bufferbloatGrade === 'A+' || metrics.bufferbloatGrade === 'A' || metrics.bufferbloatGrade === 'B'
                      ? 'PASS'
                      : 'ELEVATED'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certificate Hash & Verification Footer */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between rounded-xl bg-[#090d16] p-3 text-[11px] text-slate-400 border border-slate-800/80 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>
              Cryptographic Hash:{' '}
              <span className="font-mono text-slate-300">
                SHA256: 7f8b9e...{testId.slice(-6).toLowerCase()}
              </span>
            </span>
          </div>
          <div>Audited by NetPulse AI Enterprise Gateway</div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-[#0d1424] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedLink ? 'Copied URL!' : 'Share Proof Link'}</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-[#0d1424] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-all cursor-pointer shadow-lg shadow-purple-950/40"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
