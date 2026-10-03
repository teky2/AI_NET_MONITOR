import React from 'react';
import { Play, Square, Sparkles, CheckCircle2, ArrowDownCircle, ArrowUpCircle, Zap } from 'lucide-react';
import type { SpeedTestPhase } from '../types';

interface SpeedometerGaugeProps {
  phase: SpeedTestPhase;
  currentSpeed: number; // in Mbps
  peakSpeed: number;
  speedUnit: 'Mbps' | 'MB/s';
  onStart: () => void;
  onStop: () => void;
  pingMs: number;
  jitterMs: number;
  statusText?: string;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  phase,
  currentSpeed,
  peakSpeed,
  speedUnit,
  onStart,
  onStop,
  pingMs,
  jitterMs,
  statusText,
}) => {
  // Unit conversion
  const displaySpeed = speedUnit === 'MB/s' ? currentSpeed / 8 : currentSpeed;
  const displayPeak = speedUnit === 'MB/s' ? peakSpeed / 8 : peakSpeed;
  const maxScale = speedUnit === 'MB/s' ? 125 : 1000;

  // Calculate arc angle for speedometer (from -210 deg to +30 deg, a 240 deg sweep)
  // Non-linear / log-scaled mapping so lower values (1-50 Mbps) and higher values (100-1000 Mbps) both have great resolution
  const normalizedValue = Math.min(Math.max(displaySpeed, 0), maxScale);
  const percentage = Math.min(Math.pow(normalizedValue / maxScale, 0.65), 1);

  const radius = 140;
  const circumference = 2 * Math.PI * radius * (240 / 360);
  const strokeDashoffset = circumference - percentage * circumference;

  const isTesting = phase === 'ping' || phase === 'download' || phase === 'upload' || phase === 'analyzing';

  // Tick marks
  const tickValues = speedUnit === 'Mbps' ? [0, 25, 50, 100, 250, 500, 750, 1000] : [0, 5, 15, 30, 60, 90, 125];

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Outer Glow Halo */}
      <div
        className={`absolute -inset-4 rounded-full blur-3xl opacity-20 transition-all duration-700 pointer-events-none ${
          phase === 'download'
            ? 'bg-cyan-500/40'
            : phase === 'upload'
            ? 'bg-purple-500/40'
            : phase === 'analyzing'
            ? 'bg-emerald-500/40'
            : 'bg-cyan-500/10'
        }`}
      />

      {/* SVG Radial Gauge */}
      <div className="relative h-72 w-72 sm:h-84 sm:w-84 flex items-center justify-center">
        <svg className="h-full w-full -rotate-[210deg] transform" viewBox="0 0 320 320">
          {/* Background Track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="#131b2e"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* Active Gradient Track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={
              phase === 'upload'
                ? 'url(#uploadGradient)'
                : phase === 'analyzing'
                ? 'url(#aiGradient)'
                : 'url(#downloadGradient)'
            }
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />

          {/* Secondary Peak Marker Track (subtle dashed glow) */}
          {peakSpeed > 0 && isTesting && (
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="4 6"
              strokeDashoffset={circumference - Math.min(Math.pow(displayPeak / maxScale, 0.65), 1) * circumference}
              className="opacity-60"
            />
          )}

          {/* SVG Linear Gradients */}
          <defs>
            <linearGradient id="downloadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="60%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Readout Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-4">
          {/* Phase Badge */}
          <div className="mb-1 flex items-center space-x-1.5 rounded-full border border-slate-700/60 bg-[#0a101f]/80 px-3 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-slate-300 backdrop-blur-sm">
            {phase === 'idle' && <span className="text-slate-400">READY TO TEST</span>}
            {phase === 'ping' && (
              <>
                <Zap className="h-3 w-3 text-amber-400 animate-pulse" />
                <span className="text-amber-300">PING / JITTER</span>
              </>
            )}
            {phase === 'download' && (
              <>
                <ArrowDownCircle className="h-3 w-3 text-cyan-400 animate-bounce" />
                <span className="text-cyan-300">DOWNLOAD TEST</span>
              </>
            )}
            {phase === 'upload' && (
              <>
                <ArrowUpCircle className="h-3 w-3 text-purple-400 animate-bounce" />
                <span className="text-purple-300">UPLOAD TEST</span>
              </>
            )}
            {phase === 'analyzing' && (
              <>
                <Sparkles className="h-3 w-3 text-emerald-400 animate-spin" />
                <span className="text-emerald-300">AI DIAGNOSTICS</span>
              </>
            )}
            {phase === 'completed' && (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-300">TEST COMPLETED</span>
              </>
            )}
          </div>

          {/* Primary Speed Counter */}
          <div className="flex items-baseline justify-center">
            {phase === 'ping' ? (
              <div className="flex items-baseline space-x-1">
                <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {pingMs > 0 ? pingMs.toFixed(0) : '--'}
                </span>
                <span className="text-lg font-bold text-amber-400">ms</span>
              </div>
            ) : phase === 'analyzing' ? (
              <div className="flex flex-col items-center py-2">
                <Sparkles className="h-10 w-10 text-emerald-400 animate-pulse mb-1" />
                <span className="text-xs font-mono text-emerald-300 uppercase tracking-widest">
                  Synthesizing
                </span>
              </div>
            ) : (
              <div className="flex items-baseline space-x-1">
                <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                  {isTesting || phase === 'completed' ? displaySpeed.toFixed(1) : '0.0'}
                </span>
                <span
                  className={`text-base sm:text-lg font-bold ${
                    phase === 'upload' ? 'text-purple-400' : 'text-cyan-400'
                  }`}
                >
                  {speedUnit}
                </span>
              </div>
            )}
          </div>

          {/* Peak Speed or Baseline Ping pill */}
          <div className="mt-1 flex items-center space-x-3 text-xs text-slate-400">
            {isTesting && peakSpeed > 0 && (
              <span className="font-mono text-[11px] text-slate-400">
                Peak: <strong className="text-slate-200">{displayPeak.toFixed(1)}</strong> {speedUnit}
              </span>
            )}
            {pingMs > 0 && (
              <span className="font-mono text-[11px] text-slate-400">
                Ping: <strong className="text-cyan-300">{pingMs.toFixed(0)}</strong>ms
                {jitterMs > 0 && ` | J: ${jitterMs.toFixed(1)}ms`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Button (GO / CANCEL) */}
      <div className="mt-4 flex flex-col items-center">
        {!isTesting ? (
          <button
            onClick={onStart}
            className="group relative flex items-center space-x-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-cyan-500/25 transition-all duration-200 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <Play className="h-3.5 w-3.5 fill-white text-white translate-x-[1px]" />
            </div>
            <span className="tracking-wide">
              {phase === 'completed' ? 'RUN RETEST' : 'START AUDIT'}
            </span>
            <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 blur group-hover:opacity-40 transition-opacity"></span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center space-x-2 rounded-xl border border-red-500/50 bg-red-950/40 px-6 py-2.5 text-sm font-semibold text-red-300 shadow-lg shadow-red-950/50 hover:bg-red-900/50 active:scale-95 transition-all cursor-pointer"
          >
            <Square className="h-4 w-4 fill-red-400 text-red-400" />
            <span>CANCEL TEST</span>
          </button>
        )}

        {/* Live Status Text */}
        <p className="mt-2.5 text-center text-xs font-medium text-slate-400 max-w-sm">
          {statusText || (isTesting ? 'Measuring real byte stream throughput...' : 'Click to measure bandwidth, bufferbloat & AI diagnosis')}
        </p>
      </div>
    </div>
  );
};
