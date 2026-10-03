import React from 'react';
import {
  Activity,
  Gauge,
  Cpu,
  FileCheck2,
  DollarSign,
  Globe2,
  Sliders,
  History,
  ShieldCheck,
} from 'lucide-react';
import type { ServerNode } from '../types';

interface HeaderProps {
  activeTab: 'test' | 'telemetry' | 'diagnostics' | 'sla' | 'monetization';
  onTabChange: (tab: 'test' | 'telemetry' | 'diagnostics' | 'sla' | 'monetization') => void;
  speedUnit: 'Mbps' | 'MB/s';
  onUnitToggle: () => void;
  selectedServer: ServerNode;
  availableServers: ServerNode[];
  onServerChange: (server: ServerNode) => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  speedUnit,
  onUnitToggle,
  selectedServer,
  availableServers,
  onServerChange,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/40 bg-[#070b14]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#090e1a]">
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-wider text-white">
                NET<span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">PULSE</span>
              </span>
              <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-800/50">
                AI ENGINE
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
              Enterprise Network Telemetry & Diagnostics
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 rounded-xl bg-[#0d1424] p-1 border border-slate-800/80">
          <button
            onClick={() => onTabChange('test')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'test'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>Speed Test</span>
          </button>

          <button
            onClick={() => onTabChange('telemetry')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Live Graphs</span>
          </button>

          <button
            onClick={() => onTabChange('diagnostics')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>AI Troubleshooter</span>
          </button>

          <button
            onClick={() => onTabChange('sla')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'sla'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>SLA Audit</span>
          </button>

          <button
            onClick={() => onTabChange('monetization')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'monetization'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Launch Business</span>
          </button>
        </nav>

        {/* Right Actions: Server Selector, Unit Switcher, History, Monetization CTA */}
        <div className="flex items-center space-x-2.5">
          {/* Server Selector Dropdown */}
          <div className="relative hidden md:flex items-center">
            <Globe2 className="absolute left-2.5 h-3.5 w-3.5 text-cyan-400 pointer-events-none" />
            <select
              value={selectedServer.id}
              onChange={(e) => {
                const s = availableServers.find((srv) => srv.id === e.target.value);
                if (s) onServerChange(s);
              }}
              className="appearance-none rounded-lg border border-slate-800 bg-[#0d1424] py-1.5 pl-8 pr-7 text-xs font-medium text-slate-200 hover:border-slate-700 focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              {availableServers.map((srv) => (
                <option key={srv.id} value={srv.id} className="bg-[#0b101c] text-slate-200">
                  {srv.flag} {srv.name} ({srv.latencyEst}ms)
                </option>
              ))}
            </select>
          </div>

          {/* Unit Toggle */}
          <button
            onClick={onUnitToggle}
            title="Toggle between Mbps and Megabytes/sec"
            className="flex items-center rounded-lg border border-slate-800 bg-[#0d1424] px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <span className={speedUnit === 'Mbps' ? 'text-cyan-400 font-bold' : 'text-slate-500'}>Mbps</span>
            <span className="mx-1 text-slate-600">/</span>
            <span className={speedUnit === 'MB/s' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>MB/s</span>
          </button>

          {/* Test History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center space-x-1 rounded-lg border border-slate-800 bg-[#0d1424] p-1.5 text-slate-300 hover:border-slate-700 hover:text-white"
            title="View Test History"
          >
            <History className="h-4 w-4 text-slate-400" />
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-600 px-1 text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Business Pro Badge */}
          <button
            onClick={() => onTabChange('monetization')}
            className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-900/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
            <span>Monetize SaaS</span>
          </button>
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 space-x-2 no-scrollbar bg-[#090e1a]">
        <button
          onClick={() => onTabChange('test')}
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'test' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Speed Test
        </button>
        <button
          onClick={() => onTabChange('telemetry')}
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'telemetry' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          Live Graphs
        </button>
        <button
          onClick={() => onTabChange('diagnostics')}
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'diagnostics' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
          }`}
        >
          AI Troubleshooter
        </button>
        <button
          onClick={() => onTabChange('sla')}
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'sla' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400'
          }`}
        >
          SLA Audit
        </button>
        <button
          onClick={() => onTabChange('monetization')}
          className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
            activeTab === 'monetization' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400'
          }`}
        >
          Monetization Hub
        </button>
      </div>
    </header>
  );
};
