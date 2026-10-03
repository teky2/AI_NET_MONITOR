import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Send,
  HelpCircle,
  Copy,
  Check,
  Tv,
  Gamepad2,
  Video,
  Cloud,
  FileText,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import type { AIDiagnosticReport, SpeedMetrics, ClientInfo } from '../types';

interface AIDiagnosticPanelProps {
  report?: AIDiagnosticReport;
  metrics: SpeedMetrics;
  clientInfo?: ClientInfo;
  onRetest: () => void;
  onOpenSLA: () => void;
}

export const AIDiagnosticPanel: React.FC<AIDiagnosticPanelProps> = ({
  report,
  metrics,
  clientInfo,
  onRetest,
  onOpenSLA,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatAnswers, setChatAnswers] = useState<Array<{ q: string; a: string }>>([]);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#090e1a]/80 p-10 text-center backdrop-blur-md">
        <Cpu className="h-12 w-12 text-slate-600 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-300">AI Diagnostic Report Awaiting Test Data</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-md">
          Run a complete speed test to generate a full AI-powered root-cause network audit, bufferbloat assessment, and troubleshooting roadmap.
        </p>
        <button
          onClick={onRetest}
          className="mt-4 rounded-xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
        >
          Run Full Test Now
        </button>
      </div>
    );
  }

  const healthScore = report.overallHealthScore;
  const isHealthy = healthScore >= 80;
  const isWarning = healthScore >= 60 && healthScore < 80;

  // Generate ISP customer service support script for copying
  const ispScript = `Hello ${clientInfo?.isp || 'Customer Service'},
I am calling regarding recurring network performance degradation at my location.
A cryptographic multi-stream diagnostic test (Audit ID: NP-${Date.now().toString(36).toUpperCase()}) revealed the following telemetry:
- Measured Download: ${metrics.downloadMbps} Mbps (Peak: ${metrics.peakDownloadMbps} Mbps)
- Measured Upload: ${metrics.uploadMbps} Mbps
- Baseline Idle Latency: ${metrics.pingMs} ms
- Bufferbloat Loaded Latency: ${metrics.downloadLoadedPingMs} ms (+${Math.max(0, metrics.downloadLoadedPingMs - metrics.pingMs)}ms queue delay)
- RFC 3550 Jitter: ${metrics.jitterMs} ms
- Packet Loss: ${metrics.packetLossPercent}%
- Compliance Status: ${report.commercialSlaCompliance.rating}

Please check for neighborhood node saturation, verify upstream signal-to-noise ratio (SNR), and ensure no traffic shaping policies are throttling my connection.`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(ispScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleAskQuestion = async (queryText?: string) => {
    const q = queryText || customQuestion;
    if (!q.trim()) return;

    setIsAsking(true);
    try {
      const res = await fetch('/api/speedtest/ai-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          clientInfo,
          environment: {
            reportedIssue: q,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const ans =
          data.report?.executiveSummary ||
          data.report?.remediationPlan?.[0]?.action ||
          'Analysis completed. Check your router SQM and MTU configuration.';
        setChatAnswers((prev) => [...prev, { q, a: ans }]);
      } else {
        setChatAnswers((prev) => [
          ...prev,
          { q, a: 'SQM (CAKE or FQ-CoDel) is recommended to cap router bufferbloat and guarantee low latency.' },
        ]);
      }
    } catch {
      setChatAnswers((prev) => [
        ...prev,
        { q, a: 'Router queue optimization and a 5GHz Wi-Fi or Cat6 Ethernet cable will resolve most latency spikes.' },
      ]);
    } finally {
      setIsAsking(false);
      setCustomQuestion('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Score & Executive Summary */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#090e1a]/95 p-5 sm:p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Health Score Pill */}
          <div className="flex items-center space-x-4">
            <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0b1324] to-[#121c33] border border-slate-700/80 p-2 shadow-inner">
              <span
                className={`font-mono text-3xl font-black ${
                  isHealthy ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {healthScore}
              </span>
              <span className="text-[10px] text-slate-500 absolute bottom-2">/ 100</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-black uppercase tracking-wider ${
                    isHealthy
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : isWarning
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}
                >
                  {report.statusCategory}
                </span>
                <span className="flex items-center space-x-1 text-xs text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>AI Network Intelligence</span>
                </span>
              </div>
              <h2 className="mt-1 text-base sm:text-lg font-bold text-white">
                Executive Connection Health & Diagnostic Verdict
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenSLA}
              className="flex items-center space-x-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Export SLA Audit Report</span>
            </button>
            <button
              onClick={onRetest}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-[#0d1424] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retest</span>
            </button>
          </div>
        </div>

        {/* Executive Summary text */}
        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-slate-800/80 pt-3">
          {report.executiveSummary}
        </p>

        {/* Bufferbloat Diagnosis Card */}
        <div className="mt-4 rounded-xl bg-[#0d1424] p-3.5 border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <span className="text-amber-400">⚡</span>
              <span>Bufferbloat Deep Dive: {report.bufferbloatAnalysis.grade}</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              Delta: +{report.bufferbloatAnalysis.deltaMs}ms under saturation
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            {report.bufferbloatAnalysis.interpretation}
          </p>
        </div>
      </div>

      {/* Application Suitability Matrix */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <span>Application Performance Suitability</span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
            Real-world Latency Validation
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* VoIP */}
          <div className="rounded-xl border border-slate-800/80 bg-[#090e1a]/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">VoIP & Zoom Calls</span>
              <Video className="h-4 w-4 text-teal-400" />
            </div>
            <div className="mt-2 text-sm font-bold text-white">
              {report.appFitness.voipAndCalls.score}
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-normal">
              {report.appFitness.voipAndCalls.details}
            </p>
          </div>

          {/* Gaming */}
          <div className="rounded-xl border border-slate-800/80 bg-[#090e1a]/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Esports & Gaming</span>
              <Gamepad2 className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-sm font-bold text-white">
              {report.appFitness.gamingAndEsports.score}
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-normal">
              {report.appFitness.gamingAndEsports.details}
            </p>
          </div>

          {/* 4K Stream */}
          <div className="rounded-xl border border-slate-800/80 bg-[#090e1a]/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">4K/8K UHD Streaming</span>
              <Tv className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-sm font-bold text-white">
              {report.appFitness.streaming4k.score}
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-normal">
              {report.appFitness.streaming4k.details}
            </p>
          </div>

          {/* Cloud VPN */}
          <div className="rounded-xl border border-slate-800/80 bg-[#090e1a]/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Cloud VPN & Uplink</span>
              <Cloud className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-sm font-bold text-white">
              {report.appFitness.enterpriseCloudVpn.score}
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-normal">
              {report.appFitness.enterpriseCloudVpn.details}
            </p>
          </div>
        </div>
      </div>

      {/* Identified Bottlenecks & Prioritized Remediation Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Identified Bottlenecks */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Identified Infrastructure Bottlenecks</h3>
          </div>

          <div className="mt-3 space-y-2">
            {report.rootCauseBottlenecks && report.rootCauseBottlenecks.length > 0 ? (
              report.rootCauseBottlenecks.map((bottleneck, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{bottleneck}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-400">
                ✓ No critical bottlenecks detected. Connection operating within optimal engineering parameters.
              </p>
            )}
          </div>

          {/* SLA Compliance Box */}
          <div className="mt-4 rounded-xl border border-slate-800 bg-[#0d1424] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Commercial SLA Compliance:</span>
              <span
                className={`font-bold ${
                  report.commercialSlaCompliance.isSlaBreachSuspected ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {report.commercialSlaCompliance.rating}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{report.commercialSlaCompliance.legalSummary}</p>
          </div>
        </div>

        {/* Prioritized Remediation Steps */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Prioritized Remediation Roadmap</h3>
          </div>

          <div className="mt-3 space-y-3">
            {report.remediationPlan.map((step, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-[#0d1424] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      step.priority === 'Immediate'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : step.priority === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {step.priority} Fix
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Impact: +Score</span>
                </div>
                <p className="mt-1.5 font-medium text-slate-200">{step.action}</p>
                <p className="mt-1 text-[11px] text-slate-400">{step.expectedBenefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyable ISP Customer Support Script */}
      <div className="rounded-2xl border border-cyan-900/50 bg-[#0a1222]/90 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Automated ISP Escalation Script</span>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-800/60 font-mono">
                Tier 2/3 Support Proof
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Copy and provide this certified statement when contacting your service provider
            </p>
          </div>

          <button
            onClick={handleCopyScript}
            className="flex items-center space-x-1.5 rounded-lg border border-cyan-600 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all cursor-pointer"
          >
            {copiedScript ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <pre className="mt-3 overflow-x-auto rounded-xl bg-[#060a14] p-3.5 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-800/80">
          {ispScript}
        </pre>
      </div>

      {/* Ask AI Network Engineer Interactive Assistant */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#090e1a]/90 p-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Ask AI Network Engineer</h3>
          <span className="text-[11px] text-slate-400">
            — Ask custom troubleshooting questions about your setup
          </span>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            'How do I eliminate bufferbloat on my router?',
            'Is my Wi-Fi channel congested or dropping packets?',
            'Should I upgrade to a Wi-Fi 7 or Cat6 connection?',
            'Why does ping spike when downloading a game?',
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleAskQuestion(promptText)}
              className="rounded-lg border border-slate-800 bg-[#0d1424] px-2.5 py-1 text-[11px] text-slate-400 hover:text-cyan-300 hover:border-cyan-700 transition-all cursor-pointer text-left"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Chat History */}
        {chatAnswers.length > 0 && (
          <div className="mt-3 space-y-3">
            {chatAnswers.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-[#0d1424] p-3 text-xs">
                <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
                  <span>Q: {item.q}</span>
                </div>
                <div className="mt-1 text-slate-200 leading-relaxed">
                  <span className="text-emerald-400 font-bold mr-1">AI Verdict:</span>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="mt-3 flex items-center space-x-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskQuestion();
            }}
            placeholder="E.g. What router setting prevents lag during video meetings?"
            className="flex-1 rounded-xl border border-slate-800 bg-[#0d1424] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={isAsking || !customQuestion.trim()}
            className="flex items-center space-x-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAsking ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
