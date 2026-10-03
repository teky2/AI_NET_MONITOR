import React from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Zap,
  ShieldAlert,
  PhoneCall,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import type { SpeedMetrics, ClientInfo } from '../types';

interface LiveMetricsGridProps {
  metrics: SpeedMetrics;
  speedUnit: 'Mbps' | 'MB/s';
  clientInfo?: ClientInfo;
  activePhase?: string;
}

export const LiveMetricsGrid: React.FC<LiveMetricsGridProps> = ({
  metrics,
  speedUnit,
  clientInfo,
  activePhase,
}) => {
  const displayDl = speedUnit === 'MB/s' ? metrics.downloadMbps / 8 : metrics.downloadMbps;
  const displayPeakDl = speedUnit === 'MB/s' ? metrics.peakDownloadMbps / 8 : metrics.peakDownloadMbps;
  const displayUl = speedUnit === 'MB/s' ? metrics.uploadMbps / 8 : metrics.uploadMbps;
  const displayPeakUl = speedUnit === 'MB/s' ? metrics.peakUploadMbps / 8 : metrics.peakUploadMbps;

  const bufferbloatDelta = Math.max(0, metrics.downloadLoadedPingMs - metrics.pingMs);

  return (
    <div className="space-y-4">
      {/* 8-Card Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Download Speed */}
        <div
          className={`relative overflow-hidden rounded-2xl border bg-[#090e1a]/90 p-4 transition-all duration-300 ${
            activePhase === 'download'
              ? 'border-cyan-500/70 shadow-lg shadow-cyan-500/20'
              : 'border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Download</span>
            <ArrowDownCircle
              className={`h-4 w-4 ${activePhase === 'download' ? 'text-cyan-400 animate-bounce' : 'text-cyan-500/70'}`}
            />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {displayDl > 0 ? displayDl.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-bold text-cyan-400">{speedUnit}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Peak: {displayPeakDl > 0 ? displayPeakDl.toFixed(1) : '--'}</span>
            <span className="text-emerald-400 font-medium">Multi-stream</span>
          </div>
        </div>

        {/* 2. Upload Speed */}
        <div
          className={`relative overflow-hidden rounded-2xl border bg-[#090e1a]/90 p-4 transition-all duration-300 ${
            activePhase === 'upload'
              ? 'border-purple-500/70 shadow-lg shadow-purple-500/20'
              : 'border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload</span>
            <ArrowUpCircle
              className={`h-4 w-4 ${activePhase === 'upload' ? 'text-purple-400 animate-bounce' : 'text-purple-500/70'}`}
            />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {displayUl > 0 ? displayUl.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-bold text-purple-400">{speedUnit}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Peak: {displayPeakUl > 0 ? displayPeakUl.toFixed(1) : '--'}</span>
            <span className="text-purple-300 font-medium">Uplink</span>
          </div>
        </div>

        {/* 3. Baseline Latency / Ping */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Idle Ping</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {metrics.pingMs > 0 ? metrics.pingMs.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-bold text-emerald-400">ms</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Min: {metrics.minPingMs < 9999 ? metrics.minPingMs.toFixed(1) : '--'}ms</span>
            <span>Max: {metrics.maxPingMs > 0 ? metrics.maxPingMs.toFixed(1) : '--'}ms</span>
          </div>
        </div>

        {/* 4. Loaded Latency (Bufferbloat) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loaded Ping</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {metrics.downloadLoadedPingMs > 0 ? metrics.downloadLoadedPingMs.toFixed(0) : '--'}
            </span>
            <span className="text-xs font-bold text-amber-400">ms</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Bloat Delta:</span>
            <span
              className={`font-semibold ${
                bufferbloatDelta > 50 ? 'text-red-400' : bufferbloatDelta > 20 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              +{metrics.downloadLoadedPingMs > 0 ? bufferbloatDelta.toFixed(0) : 0}ms
            </span>
          </div>
        </div>

        {/* 5. Jitter */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jitter</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {metrics.jitterMs > 0 ? metrics.jitterMs.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-bold text-cyan-400">ms</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {metrics.jitterMs < 5 ? (
              <span className="text-emerald-400">Smooth (&lt;5ms)</span>
            ) : metrics.jitterMs < 15 ? (
              <span className="text-slate-300">Acceptable</span>
            ) : (
              <span className="text-amber-400">Noticeable jitter</span>
            )}
          </div>
        </div>

        {/* 6. Packet Loss */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Packet Loss</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {metrics.packetLossPercent.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-rose-400">%</span>
          </div>
          <div className="mt-1 text-[11px]">
            {metrics.packetLossPercent === 0 ? (
              <span className="text-emerald-400 font-medium">0% Loss (Clean)</span>
            ) : (
              <span className="text-red-400 font-medium">Dropping Packets</span>
            )}
          </div>
        </div>

        {/* 7. Bufferbloat Grade */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bufferbloat</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`rounded-lg px-2.5 py-0.5 text-2xl font-black ${
                metrics.bufferbloatGrade === 'A+' || metrics.bufferbloatGrade === 'A'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : metrics.bufferbloatGrade === 'B' || metrics.bufferbloatGrade === 'C'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                  : 'bg-red-950/80 text-red-300 border border-red-700/60'
              }`}
            >
              {metrics.bufferbloatGrade || 'A+'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {metrics.bufferbloatGrade === 'A+' || metrics.bufferbloatGrade === 'A'
              ? 'Zero gaming lag spikes'
              : 'Router buffer queue delays'}
          </div>
        </div>

        {/* 8. VoIP MOS Score */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">VoIP Quality</span>
            <PhoneCall className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-black text-white">
              {metrics.mosScore > 0 ? metrics.mosScore.toFixed(2) : '4.40'}
            </span>
            <span className="text-xs font-bold text-teal-400">/ 4.5</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {metrics.mosScore >= 4.2 ? (
              <span className="text-emerald-400">HD Zoom / Teams audio</span>
            ) : metrics.mosScore >= 3.8 ? (
              <span className="text-amber-400">Good call quality</span>
            ) : (
              <span className="text-red-400">Audio robotic/drops</span>
            )}
          </div>
        </div>
      </div>

      {/* Client Identity & Server Node Ribbon */}
      {clientInfo && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/60 bg-[#0d1424]/60 px-4 py-2.5 text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-500">ISP / Gateway:</span>{' '}
              <strong className="text-slate-200">{clientInfo.isp}</strong>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-500">IP:</span>{' '}
              <span className="font-mono text-cyan-300">{clientInfo.ip}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div>
              <span className="text-slate-500">Location:</span>{' '}
              <span className="text-slate-300">{clientInfo.city}, {clientInfo.country}</span>
            </div>
            <div className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700">
              {clientInfo.serverLocation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
