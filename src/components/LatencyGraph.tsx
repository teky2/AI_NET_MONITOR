import React, { useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import type { LatencySample, ThroughputSample } from '../types';

interface LatencyGraphProps {
  latencySamples: LatencySample[];
  throughputSamples: ThroughputSample[];
  unloadedPing: number;
  downloadLoadedPing: number;
  uploadLoadedPing: number;
  jitterMs: number;
  bufferbloatGrade: string;
}

export const LatencyGraph: React.FC<LatencyGraphProps> = ({
  latencySamples,
  throughputSamples,
  unloadedPing,
  downloadLoadedPing,
  uploadLoadedPing,
  jitterMs,
  bufferbloatGrade,
}) => {
  const [viewMode, setViewMode] = useState<'latency' | 'throughput' | 'split'>('latency');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; text: string } | null>(null);

  const bufferbloatDelta = Math.max(0, downloadLoadedPing - unloadedPing);

  // SVG dimensions
  const width = 640;
  const height = 200;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };

  // Calculate scales for latency
  const maxLatency = Math.max(
    80,
    ...latencySamples.map((s) => s.durationMs),
    downloadLoadedPing * 1.2
  );

  const getLatencyY = (val: number) => {
    const usableH = height - padding.top - padding.bottom;
    return height - padding.bottom - (val / maxLatency) * usableH;
  };

  const getLatencyX = (idx: number, total: number) => {
    const usableW = width - padding.left - padding.right;
    if (total <= 1) return padding.left;
    return padding.left + (idx / (total - 1)) * usableW;
  };

  // Build latency path string
  const unloadedPoints = latencySamples.filter((s) => s.type === 'unloaded');
  const loadedDlPoints = latencySamples.filter((s) => s.type === 'download-loaded');
  const loadedUlPoints = latencySamples.filter((s) => s.type === 'upload-loaded');

  const buildPath = (samples: LatencySample[]) => {
    if (samples.length < 2) return '';
    return samples
      .map((s, idx) => {
        const x = getLatencyX(idx, samples.length);
        const y = getLatencyY(s.durationMs);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Throughput scales
  const maxThroughput = Math.max(
    50,
    ...(throughputSamples.length > 0 ? throughputSamples.map((s) => s.speedMbps * 1.15) : [50])
  );

  const getThroughputY = (val: number) => {
    const usableH = height - padding.top - padding.bottom;
    return height - padding.bottom - (val / maxThroughput) * usableH;
  };

  const dlThroughput = throughputSamples.filter((s) => s.phase === 'download');
  const ulThroughput = throughputSamples.filter((s) => s.phase === 'upload');

  const buildThroughputPath = (samples: ThroughputSample[]) => {
    if (samples.length < 2) return '';
    return samples
      .map((s, idx) => {
        const x = getLatencyX(idx, samples.length);
        const y = getThroughputY(s.speedMbps);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const buildThroughputArea = (samples: ThroughputSample[]) => {
    if (samples.length < 2) return '';
    const firstX = getLatencyX(0, samples.length);
    const lastX = getLatencyX(samples.length - 1, samples.length);
    const baseY = height - padding.bottom;
    const linePath = samples
      .map((s, idx) => {
        const x = getLatencyX(idx, samples.length);
        const y = getThroughputY(s.speedMbps);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-4 sm:p-5 backdrop-blur-md shadow-xl">
      {/* Header with View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Real-Time Latency & Bufferbloat Telemetry
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                RFC 3550
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Measuring latency jitter and queue saturation under full network load
            </p>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center rounded-lg bg-[#0d1424] p-1 border border-slate-800">
          <button
            onClick={() => setViewMode('latency')}
            className={`flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              viewMode === 'latency'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Latency / Ping</span>
          </button>
          <button
            onClick={() => setViewMode('throughput')}
            className={`flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              viewMode === 'throughput'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            <span>Throughput Mbps</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Dual Overlay</span>
          </button>
        </div>
      </div>

      {/* Main SVG Graph */}
      <div className="relative mt-3 w-full overflow-hidden">
        {/* Graph Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono mb-2 text-slate-400">
          {(viewMode === 'latency' || viewMode === 'split') && (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Unloaded Baseline ({unloadedPing > 0 ? unloadedPing.toFixed(1) : '--'}ms)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>Download Loaded ({downloadLoadedPing > 0 ? downloadLoadedPing.toFixed(1) : '--'}ms)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                <span>Upload Loaded ({uploadLoadedPing > 0 ? uploadLoadedPing.toFixed(1) : '--'}ms)</span>
              </div>
            </>
          )}
          {(viewMode === 'throughput' || viewMode === 'split') && (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                <span>Download Bandwidth</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-pink-400"></span>
                <span>Upload Bandwidth</span>
              </div>
            </>
          )}
        </div>

        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padding.top + pct * (height - padding.top - padding.bottom);
            const valLabel =
              viewMode === 'throughput'
                ? ((1 - pct) * maxThroughput).toFixed(0) + 'M'
                : ((1 - pct) * maxLatency).toFixed(0) + 'ms';
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1c2638"
                  strokeDasharray="2 3"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="dlAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="ulAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Render Throughput View */}
          {(viewMode === 'throughput' || viewMode === 'split') && (
            <>
              {dlThroughput.length > 1 && (
                <>
                  <path d={buildThroughputArea(dlThroughput)} fill="url(#dlAreaGrad)" />
                  <path
                    d={buildThroughputPath(dlThroughput)}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {ulThroughput.length > 1 && (
                <>
                  <path d={buildThroughputArea(ulThroughput)} fill="url(#ulAreaGrad)" />
                  <path
                    d={buildThroughputPath(ulThroughput)}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </>
          )}

          {/* Render Latency View */}
          {(viewMode === 'latency' || viewMode === 'split') && (
            <>
              {/* Baseline Reference Line */}
              {unloadedPing > 0 && (
                <line
                  x1={padding.left}
                  y1={getLatencyY(unloadedPing)}
                  x2={width - padding.right}
                  y2={getLatencyY(unloadedPing)}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
              )}

              {/* Unloaded baseline line */}
              {unloadedPoints.length > 1 && (
                <path
                  d={buildPath(unloadedPoints)}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}

              {/* Download Loaded line (Bufferbloat) */}
              {loadedDlPoints.length > 1 && (
                <path
                  d={buildPath(loadedDlPoints)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Upload Loaded line */}
              {loadedUlPoints.length > 1 && (
                <path
                  d={buildPath(loadedUlPoints)}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}

              {/* Individual sample dots */}
              {latencySamples.map((s, idx) => {
                const cx = getLatencyX(idx, latencySamples.length);
                const cy = getLatencyY(s.durationMs);
                const color =
                  s.type === 'unloaded' ? '#10b981' : s.type === 'download-loaded' ? '#f59e0b' : '#a855f7';
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill={color}
                    stroke="#090e1a"
                    strokeWidth="1"
                    className="cursor-pointer hover:r-5 transition-all"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: cx,
                        y: cy,
                        text: `${s.durationMs}ms (${s.type.replace('-', ' ')})`,
                      })
                    }
                  />
                );
              })}
            </>
          )}

          {/* Interactive Tooltip on hover */}
          {hoveredPoint && (
            <g transform={`translate(${hoveredPoint.x}, ${Math.max(25, hoveredPoint.y - 12)})`}>
              <rect
                x="-50"
                y="-18"
                width="100"
                height="20"
                rx="4"
                fill="#0d1424"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <text x="0" y="-4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                {hoveredPoint.text}
              </text>
            </g>
          )}

          {/* Fallback empty guide */}
          {latencySamples.length === 0 && throughputSamples.length === 0 && (
            <text
              x={width / 2}
              y={height / 2}
              fill="#475569"
              fontSize="12"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              Start speed test to stream real-time latency & throughput telemetry
            </text>
          )}
        </svg>
      </div>

      {/* Bufferbloat Callout Bar */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/60">
        <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Baseline Ping</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-base font-bold text-emerald-400">
              {unloadedPing > 0 ? unloadedPing.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Bufferbloat Delta</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span
              className={`text-base font-bold ${
                bufferbloatDelta > 50 ? 'text-red-400' : bufferbloatDelta > 20 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              +{downloadLoadedPing > 0 ? bufferbloatDelta.toFixed(0) : '--'}
            </span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Jitter Variance</span>
          <div className="flex items-baseline space-x-1 mt-0.5">
            <span className="text-base font-bold text-cyan-400">
              {jitterMs > 0 ? jitterMs.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#0d1424] p-2.5 border border-slate-800">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Bufferbloat Rating</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-black ${
                bufferbloatGrade === 'A+' || bufferbloatGrade === 'A'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  : bufferbloatGrade === 'B' || bufferbloatGrade === 'C'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  : 'bg-red-950 text-red-300 border border-red-800/60'
              }`}
            >
              {bufferbloatGrade || 'A+'}
            </span>
            {bufferbloatDelta > 40 && (
              <span title="Latency spikes during downloads">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
