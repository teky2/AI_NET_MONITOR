import React from 'react';
import {
  X,
  History,
  Download,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import type { TestResult } from '../types';

interface TestHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: TestResult[];
  onClearHistory: () => void;
  onSelectResult: (result: TestResult) => void;
  speedUnit: 'Mbps' | 'MB/s';
}

export const TestHistoryDrawer: React.FC<TestHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectResult,
  speedUnit,
}) => {
  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = [
      'Test ID',
      'Timestamp',
      'ISP',
      'IP',
      'Download (Mbps)',
      'Peak Download (Mbps)',
      'Upload (Mbps)',
      'Peak Upload (Mbps)',
      'Ping (ms)',
      'Download Loaded Ping (ms)',
      'Jitter (ms)',
      'Packet Loss (%)',
      'Bufferbloat Grade',
      'VoIP MOS Score',
      'Stability Score',
    ];

    const rows = history.map((item) => [
      item.id,
      `"${item.timestamp}"`,
      `"${item.clientInfo?.isp || 'Unknown'}"`,
      item.clientInfo?.ip || '',
      item.metrics.downloadMbps,
      item.metrics.peakDownloadMbps,
      item.metrics.uploadMbps,
      item.metrics.peakUploadMbps,
      item.metrics.pingMs,
      item.metrics.downloadLoadedPingMs,
      item.metrics.jitterMs,
      item.metrics.packetLossPercent,
      item.metrics.bufferbloatGrade,
      item.metrics.mosScore,
      item.metrics.stabilityScore,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NetPulse_History_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-md border-l border-slate-800 bg-[#070b14] p-5 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Test History & Log</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{history.length} logged tests</span>
            {history.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-[#0d1424] px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={onClearHistory}
                  className="flex items-center space-x-1 rounded-lg border border-red-950/60 bg-red-950/20 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-900/30 transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {/* List of Previous Tests */}
          <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {history.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">
                No previous tests stored yet. Run your first speed audit to start logging history!
              </div>
            ) : (
              history.map((item) => {
                const dl = speedUnit === 'MB/s' ? item.metrics.downloadMbps / 8 : item.metrics.downloadMbps;
                const ul = speedUnit === 'MB/s' ? item.metrics.uploadMbps / 8 : item.metrics.uploadMbps;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectResult(item);
                      onClose();
                    }}
                    className="group rounded-xl border border-slate-800/90 bg-[#090e1a] p-3 text-xs hover:border-cyan-500/60 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800/60">
                      <span>{item.timestamp}</span>
                      <span className="font-mono text-cyan-400 font-bold">{item.clientInfo?.isp || 'Broadband'}</span>
                    </div>

                    <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Down</span>
                        <span className="font-mono font-bold text-white text-xs sm:text-sm">
                          {dl.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Up</span>
                        <span className="font-mono font-bold text-white text-xs sm:text-sm">
                          {ul.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Ping</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                          {item.metrics.pingMs.toFixed(0)}ms
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Bloat</span>
                        <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                          {item.metrics.bufferbloatGrade}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Client telemetry stored locally in browser storage
        </div>
      </div>
    </div>
  );
};
