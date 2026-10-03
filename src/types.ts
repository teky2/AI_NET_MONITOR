export type SpeedTestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'analyzing' | 'completed';

export interface ClientInfo {
  ip: string;
  clientHost: string;
  userAgent: string;
  asn: string;
  isp: string;
  city: string;
  country: string;
  protocol: string;
  serverLocation: string;
  connectionType?: 'Fiber' | '5G / LTE' | 'Cable' | 'DSL' | 'Wi-Fi 6' | 'Starlink / Satellite';
}

export interface LatencySample {
  timestamp: number;
  durationMs: number;
  type: 'unloaded' | 'download-loaded' | 'upload-loaded';
}

export interface ThroughputSample {
  timestamp: number;
  speedMbps: number;
  phase: 'download' | 'upload';
  loadedBytes: number;
}

export interface SpeedMetrics {
  downloadMbps: number;
  peakDownloadMbps: number;
  uploadMbps: number;
  peakUploadMbps: number;
  pingMs: number;
  minPingMs: number;
  maxPingMs: number;
  downloadLoadedPingMs: number;
  uploadLoadedPingMs: number;
  jitterMs: number;
  packetLossPercent: number;
  bufferbloatGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  mosScore: number; // 1.0 - 4.5+ Mean Opinion Score for VoIP
  stabilityScore: number; // 0 - 100
}

export interface AppFitnessItem {
  score: string;
  details: string;
}

export interface RemediationStep {
  priority: 'Immediate' | 'Medium' | 'ISP / Provider';
  action: string;
  expectedBenefit: string;
}

export interface AIDiagnosticReport {
  overallHealthScore: number;
  statusCategory: 'Optimal' | 'Good' | 'Fair' | 'Degraded' | 'Critical';
  executiveSummary: string;
  bufferbloatAnalysis: {
    grade: string;
    unloadedPingMs: number;
    loadedPingMs: number;
    deltaMs: number;
    interpretation: string;
  };
  appFitness: {
    voipAndCalls: AppFitnessItem;
    gamingAndEsports: AppFitnessItem;
    streaming4k: AppFitnessItem;
    enterpriseCloudVpn: AppFitnessItem;
  };
  rootCauseBottlenecks: string[];
  remediationPlan: RemediationStep[];
  commercialSlaCompliance: {
    rating: string;
    isSlaBreachSuspected: boolean;
    legalSummary: string;
  };
}

export interface TestResult {
  id: string;
  timestamp: string;
  clientInfo: ClientInfo;
  metrics: SpeedMetrics;
  aiReport?: AIDiagnosticReport;
  latencySamples: LatencySample[];
  throughputSamples: ThroughputSample[];
  slaStatus?: {
    compliant: boolean;
    targetDownload: number;
    targetUpload: number;
    maxPing: number;
  };
}

export interface ServerNode {
  id: string;
  name: string;
  region: string;
  country: string;
  flag: string;
  latencyEst: number;
  isOptimal?: boolean;
}
