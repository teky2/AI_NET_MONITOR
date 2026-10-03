import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SpeedometerGauge } from './components/SpeedometerGauge';
import { LiveMetricsGrid } from './components/LiveMetricsGrid';
import { LatencyGraph } from './components/LatencyGraph';
import { AIDiagnosticPanel } from './components/AIDiagnosticPanel';
import { SLAAuditModal } from './components/SLAAuditModal';
import { BusinessMonetizationView } from './components/BusinessMonetizationView';
import { TestHistoryDrawer } from './components/TestHistoryDrawer';
import { SponsorBanner } from './components/SponsorBanner';
import { SpeedTestEngine } from './services/speedtestEngine';
import type {
  SpeedTestPhase,
  SpeedMetrics,
  ClientInfo,
  LatencySample,
  ThroughputSample,
  AIDiagnosticReport,
  TestResult,
  ServerNode,
} from './types';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2,
  Cpu,
  Layers,
  FileCheck2,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const AVAILABLE_SERVERS: ServerNode[] = [
  { id: 'auto-edge', name: 'Auto (Nearest Edge)', region: 'Global Edge Anycast', country: 'Global', flag: '⚡', latencyEst: 12, isOptimal: true },
  { id: 'us-east', name: 'US East (N. Virginia)', region: 'us-east-1', country: 'United States', flag: '🇺🇸', latencyEst: 28 },
  { id: 'eu-central', name: 'EU Central (Frankfurt)', region: 'eu-central-1', country: 'Germany', flag: '🇩🇪', latencyEst: 35 },
  { id: 'ap-tokyo', name: 'Asia East (Tokyo)', region: 'ap-northeast-1', country: 'Japan', flag: '🇯🇵', latencyEst: 42 },
  { id: 'ap-singapore', name: 'Asia SE (Singapore)', region: 'ap-southeast-1', country: 'Singapore', flag: '🇸🇬', latencyEst: 18 },
  { id: 'uk-london', name: 'UK (London Equinix)', region: 'eu-west-2', country: 'United Kingdom', flag: '🇬🇧', latencyEst: 31 },
];

const INITIAL_METRICS: SpeedMetrics = {
  downloadMbps: 0,
  peakDownloadMbps: 0,
  uploadMbps: 0,
  peakUploadMbps: 0,
  pingMs: 0,
  minPingMs: 9999,
  maxPingMs: 0,
  downloadLoadedPingMs: 0,
  uploadLoadedPingMs: 0,
  jitterMs: 0,
  packetLossPercent: 0,
  bufferbloatGrade: 'A+',
  mosScore: 4.4,
  stabilityScore: 98,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'test' | 'telemetry' | 'diagnostics' | 'sla' | 'monetization'>('test');
  const [speedUnit, setSpeedUnit] = useState<'Mbps' | 'MB/s'>('Mbps');
  const [phase, setPhase] = useState<SpeedTestPhase>('idle');
  const [statusLog, setStatusLog] = useState<string>('Ready to initiate network speed & bufferbloat audit.');
  const [metrics, setMetrics] = useState<SpeedMetrics>(INITIAL_METRICS);
  const [clientInfo, setClientInfo] = useState<ClientInfo | undefined>(undefined);
  const [latencySamples, setLatencySamples] = useState<LatencySample[]>([]);
  const [throughputSamples, setThroughputSamples] = useState<ThroughputSample[]>([]);
  const [aiReport, setAiReport] = useState<AIDiagnosticReport | undefined>(undefined);

  // Business & Settings
  const [selectedServer, setSelectedServer] = useState<ServerNode>(AVAILABLE_SERVERS[0]);
  const [currentTier, setCurrentTier] = useState<'Free' | 'Pro' | 'Enterprise'>('Free');
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<TestResult[]>([]);

  const engineRef = useRef<SpeedTestEngine | null>(null);

  // Check if embed mode in URL (e.g. ?embed=true)
  const isEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';

  // Initialize engine and load stored history & client info
  useEffect(() => {
    engineRef.current = new SpeedTestEngine();

    // Fetch initial client identity
    engineRef.current.getClientInfo().then((info) => {
      setClientInfo(info);
    });

    // Load history from localStorage
    try {
      const saved = localStorage.getItem('netpulse_test_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    // Keyboard shortcut: Spacebar to start/stop
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        if (phase === 'idle' || phase === 'completed') {
          handleStartTest();
        } else {
          handleStopTest();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  const handleStartTest = async () => {
    if (!engineRef.current) return;

    setPhase('ping');
    setMetrics(INITIAL_METRICS);
    setLatencySamples([]);
    setThroughputSamples([]);
    setAiReport(undefined);
    setStatusLog('Connecting to Edge Anycast Node...');

    try {
      const activeClientInfo = clientInfo || (await engineRef.current.getClientInfo());
      setClientInfo(activeClientInfo);

      const result = await engineRef.current.runFullTest(
        {
          onPhaseChange: (newPhase) => setPhase(newPhase),
          onMetricsUpdate: (partial) => {
            setMetrics((prev) => ({ ...prev, ...partial }));
          },
          onLatencyPoint: (point) => {
            setLatencySamples((prev) => [...prev.slice(-100), point]);
          },
          onThroughputPoint: (point) => {
            setThroughputSamples((prev) => [...prev.slice(-100), point]);
          },
          onLog: (msg) => setStatusLog(msg),
        },
        activeClientInfo
      );

      setMetrics(result.metrics);
      setAiReport(result.aiReport);
      setPhase('completed');

      // Save to test history
      const newResult: TestResult = {
        id: `NP-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toLocaleString(),
        clientInfo: activeClientInfo,
        metrics: result.metrics,
        aiReport: result.aiReport,
        latencySamples: result.latencySamples,
        throughputSamples: result.throughputSamples,
      };

      const updatedHistory = [newResult, ...history.slice(0, 49)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('netpulse_test_history', JSON.stringify(updatedHistory));
      } catch {
        // ignore
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatusLog(`Speed test encountered an issue: ${err.message}`);
      }
      setPhase('idle');
    }
  };

  const handleStopTest = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      setPhase('idle');
      setStatusLog('Test cancelled by operator.');
    }
  };

  const handleSelectHistoryItem = (item: TestResult) => {
    setMetrics(item.metrics);
    setLatencySamples(item.latencySamples || []);
    setThroughputSamples(item.throughputSamples || []);
    setAiReport(item.aiReport);
    setPhase('completed');
    setActiveTab('test');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('netpulse_test_history');
    } catch {
      // ignore
    }
  };

  const currentDisplaySpeed =
    phase === 'download'
      ? metrics.downloadMbps
      : phase === 'upload'
      ? metrics.uploadMbps
      : phase === 'completed'
      ? metrics.downloadMbps
      : 0;

  const currentPeak =
    phase === 'download'
      ? metrics.peakDownloadMbps
      : phase === 'upload'
      ? metrics.peakUploadMbps
      : metrics.peakDownloadMbps;

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-cyan-600/15 via-teal-600/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-40 w-[450px] h-[450px] bg-purple-600/10 blur-3xl rounded-full" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-emerald-600/10 blur-3xl rounded-full" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Header (Hidden in embed mode) */}
      {!isEmbed && (
        <Header
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'sla') {
              setIsSlaModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          speedUnit={speedUnit}
          onUnitToggle={() => setSpeedUnit((u) => (u === 'Mbps' ? 'MB/s' : 'Mbps'))}
          selectedServer={selectedServer}
          availableServers={AVAILABLE_SERVERS}
          onServerChange={setSelectedServer}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={history.length}
        />
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* TAB 1: Speed Test (Main View) */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            {/* Top Node Indicator & Quick Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-[#090e1a]/80 px-4 py-2.5 text-xs text-slate-400 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">
                  Connected to: <strong className="text-white">{selectedServer.name}</strong>
                </span>
                <span className="hidden sm:inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                  {selectedServer.region}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {clientInfo && (
                  <div className="hidden md:flex items-center space-x-1.5">
                    <span className="text-slate-500">Route:</span>
                    <span className="font-mono text-slate-300">{clientInfo.isp}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 font-mono text-[11px] text-cyan-400">
                  <Zap className="h-3 w-3" />
                  <span>Sub-millisecond Precision</span>
                </div>
              </div>
            </div>

            {/* Central Speedometer Gauge */}
            <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-b from-[#090e1b]/95 via-[#070b16]/95 to-[#060a12]/95 p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
              <SpeedometerGauge
                phase={phase}
                currentSpeed={currentDisplaySpeed}
                peakSpeed={currentPeak}
                speedUnit={speedUnit}
                onStart={handleStartTest}
                onStop={handleStopTest}
                pingMs={metrics.pingMs}
                jitterMs={metrics.jitterMs}
                statusText={statusLog}
              />
            </div>

            {/* Live Telemetry Grid */}
            <LiveMetricsGrid
              metrics={metrics}
              speedUnit={speedUnit}
              clientInfo={clientInfo}
              activePhase={phase}
            />

            {/* Compact Latency & Bufferbloat Sparkline */}
            <LatencyGraph
              latencySamples={latencySamples}
              throughputSamples={throughputSamples}
              unloadedPing={metrics.pingMs}
              downloadLoadedPing={metrics.downloadLoadedPingMs}
              uploadLoadedPing={metrics.uploadLoadedPingMs}
              jitterMs={metrics.jitterMs}
              bufferbloatGrade={metrics.bufferbloatGrade}
            />

            {/* AI Diagnostics Banner Teaser / Summary */}
            {aiReport ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#0a1820] to-[#090e1a] p-5 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          AI Diagnostic Report Ready
                        </span>
                        <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                          Score: {aiReport.overallHealthScore}/100 ({aiReport.statusCategory})
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300 max-w-2xl line-clamp-2">
                        {aiReport.executiveSummary}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('diagnostics')}
                    className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex-shrink-0"
                  >
                    <span>View AI Troubleshooting Plan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              phase === 'completed' && (
                <div className="text-center py-4">
                  <button
                    onClick={() => setActiveTab('diagnostics')}
                    className="inline-flex items-center space-x-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Generate AI Diagnostic Analysis</span>
                  </button>
                </div>
              )
            )}

            {/* Sponsor Banner for monetization proof */}
            <SponsorBanner
              tier={currentTier}
              onUpgradeToPro={() => setActiveTab('monetization')}
            />
          </div>
        )}

        {/* TAB 2: Live Graphs & Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <span>Deep Network Telemetry & Bufferbloat Analysis</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time multi-dimensional latency, throughput curves, and queueing delay metrics
              </p>
            </div>

            <LatencyGraph
              latencySamples={latencySamples}
              throughputSamples={throughputSamples}
              unloadedPing={metrics.pingMs}
              downloadLoadedPing={metrics.downloadLoadedPingMs}
              uploadLoadedPing={metrics.uploadLoadedPingMs}
              jitterMs={metrics.jitterMs}
              bufferbloatGrade={metrics.bufferbloatGrade}
            />

            <LiveMetricsGrid
              metrics={metrics}
              speedUnit={speedUnit}
              clientInfo={clientInfo}
            />

            {/* Bufferbloat Technical Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                  <span className="text-amber-400">⚡</span>
                  <span>What is Bufferbloat & Why Does it Cause Lag?</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bufferbloat occurs when routers queue excessive data during saturated downloads or video streaming.
                  While files download at maximum throughput, time-sensitive packets (gaming, Zoom voice, DNS lookups)
                  get stuck behind massive queues, causing ping spikes of +50ms to +300ms.
                </p>
                <div className="mt-3 rounded-lg bg-[#0d1424] p-3 text-xs text-slate-400 border border-slate-800">
                  <span className="font-semibold text-slate-200">The Fix:</span> Enable Smart Queue Management (SQM)
                  like CAKE or FQ-CoDel on your router to prioritize packets automatically.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#090e1a] p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                  <span className="text-cyan-400">🌐</span>
                  <span>RFC 3550 Real-time Jitter Modeling</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jitter measures the statistical variance in round-trip arrival times between successive ping packets.
                  Even with high download speeds, jitter over 15ms causes VoIP audio stutter and in-game rubberbanding.
                </p>
                <div className="mt-3 rounded-lg bg-[#0d1424] p-3 text-xs text-slate-400 border border-slate-800">
                  <span className="font-semibold text-slate-200">Your Current Jitter:</span>{' '}
                  <span className="font-mono text-cyan-300">{metrics.jitterMs}ms</span> (
                  {metrics.jitterMs < 5 ? 'Flawless' : metrics.jitterMs < 15 ? 'Good' : 'Elevated'})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI Diagnostics & Troubleshooter */}
        {activeTab === 'diagnostics' && (
          <AIDiagnosticPanel
            report={aiReport}
            metrics={metrics}
            clientInfo={clientInfo}
            onRetest={handleStartTest}
            onOpenSLA={() => setIsSlaModalOpen(true)}
          />
        )}

        {/* TAB 4: Business Monetization Hub */}
        {activeTab === 'monetization' && (
          <BusinessMonetizationView
            currentTier={currentTier}
            onSelectTier={setCurrentTier}
          />
        )}
      </main>

      {/* SLA Audit Certificate Modal */}
      <SLAAuditModal
        isOpen={isSlaModalOpen}
        onClose={() => setIsSlaModalOpen(false)}
        metrics={metrics}
        clientInfo={clientInfo}
        report={aiReport}
        speedUnit={speedUnit}
      />

      {/* Test History Drawer */}
      <TestHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectResult={handleSelectHistoryItem}
        speedUnit={speedUnit}
      />

      {/* Footer */}
      {!isEmbed && (
        <footer className="mt-auto border-t border-slate-900 bg-[#050810] py-6 px-4 text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-400">NetPulse AI</span>
              <span>— Enterprise Multi-Stream Speed & SLA Diagnostic Engine</span>
            </div>

            <div className="flex items-center space-x-4 text-slate-400">
              <button
                onClick={() => setIsSlaModalOpen(true)}
                className="hover:text-cyan-400 transition-colors cursor-pointer"
              >
                SLA Certificate
              </button>
              <button
                onClick={() => setActiveTab('monetization')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                White-Label SaaS
              </button>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                History Logs ({history.length})
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
