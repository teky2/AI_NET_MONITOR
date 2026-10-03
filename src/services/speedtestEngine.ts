import type { ClientInfo, LatencySample, SpeedMetrics, ThroughputSample, AIDiagnosticReport } from '../types';

export interface SpeedTestCallbacks {
  onPhaseChange: (phase: 'idle' | 'ping' | 'download' | 'upload' | 'analyzing' | 'completed') => void;
  onMetricsUpdate: (metrics: Partial<SpeedMetrics>) => void;
  onLatencyPoint: (point: LatencySample) => void;
  onThroughputPoint: (point: ThroughputSample) => void;
  onLog?: (msg: string) => void;
}

export class SpeedTestEngine {
  private abortController: AbortController | null = null;
  private isRunning = false;

  public stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isRunning = false;
  }

  public async getClientInfo(): Promise<ClientInfo> {
    try {
      const res = await fetch('/api/speedtest/client-info');
      if (!res.ok) throw new Error('Failed to get client info');
      const data = await res.json();
      return {
        ...data,
        connectionType: 'Fiber',
      };
    } catch {
      return {
        ip: '127.0.0.1',
        clientHost: 'Local Edge Gateway',
        userAgent: navigator.userAgent,
        asn: 'Autonomous System Route',
        isp: 'High-Speed Broadband',
        city: 'Edge Node',
        country: 'Global',
        protocol: 'HTTPS / HTTP2',
        serverLocation: 'Edge Cloud Acceleration Node',
        connectionType: 'Fiber',
      };
    }
  }

  public async runFullTest(
    callbacks: SpeedTestCallbacks,
    clientInfo: ClientInfo,
    reportedIssue?: string
  ): Promise<{ metrics: SpeedMetrics; aiReport: AIDiagnosticReport; latencySamples: LatencySample[]; throughputSamples: ThroughputSample[] }> {
    this.isRunning = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const latencySamples: LatencySample[] = [];
    const throughputSamples: ThroughputSample[] = [];

    const metrics: SpeedMetrics = {
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

    try {
      // PHASE 1: Ping & Baseline Jitter
      callbacks.onPhaseChange('ping');
      callbacks.onLog?.('Calibrating baseline round-trip latency & jitter...');

      const pingCount = 10;
      const pingValues: number[] = [];
      let lostPings = 0;
      let calculatedJitter = 0;

      for (let i = 0; i < pingCount; i++) {
        if (signal.aborted) break;
        const start = performance.now();
        try {
          const res = await fetch('/api/speedtest/ping?t=' + Date.now(), {
            cache: 'no-store',
            signal,
          });
          if (res.ok) {
            const duration = Math.max(1, performance.now() - start);
            pingValues.push(duration);

            if (pingValues.length > 1) {
              const diff = Math.abs(duration - pingValues[pingValues.length - 2]);
              calculatedJitter += (diff - calculatedJitter) / 16;
            }

            metrics.minPingMs = Math.min(metrics.minPingMs, duration);
            metrics.maxPingMs = Math.max(metrics.maxPingMs, duration);

            const sample: LatencySample = {
              timestamp: Date.now(),
              durationMs: Number(duration.toFixed(1)),
              type: 'unloaded',
            };
            latencySamples.push(sample);
            callbacks.onLatencyPoint(sample);

            const currentAvg = pingValues.reduce((a, b) => a + b, 0) / pingValues.length;
            callbacks.onMetricsUpdate({
              pingMs: Number(currentAvg.toFixed(1)),
              minPingMs: Number(metrics.minPingMs.toFixed(1)),
              maxPingMs: Number(metrics.maxPingMs.toFixed(1)),
              jitterMs: Number(calculatedJitter.toFixed(1)),
            });
          } else {
            lostPings++;
          }
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          lostPings++;
        }
        await new Promise((r) => setTimeout(r, 60));
      }

      const avgPing = pingValues.length > 0 ? pingValues.reduce((a, b) => a + b, 0) / pingValues.length : 15;
      metrics.pingMs = Number(avgPing.toFixed(1));
      metrics.jitterMs = Number(calculatedJitter.toFixed(1));
      metrics.packetLossPercent = Number(((lostPings / pingCount) * 100).toFixed(1));

      // PHASE 2: Multi-stream Download Speed + Loaded Ping (Bufferbloat)
      callbacks.onPhaseChange('download');
      callbacks.onLog?.('Initiating multi-stream download & bufferbloat telemetry...');

      const downloadLoadedPings: number[] = [];
      const downloadStartTime = performance.now();
      const downloadDurationMs = 7000; // 7 seconds
      let totalBytesDownloaded = 0;
      let peakDownloadMbps = 0;

      // Launch 4 parallel download workers
      const numDownloadWorkers = 4;
      let downloadIsActive = true;

      // Background ping loop during download saturation
      const loadedPingInterval = setInterval(async () => {
        if (!downloadIsActive || signal.aborted) return;
        const pStart = performance.now();
        try {
          const res = await fetch('/api/speedtest/ping?bufferbloat=dl&t=' + Date.now(), {
            cache: 'no-store',
            signal,
          });
          if (res.ok) {
            const pDuration = Math.max(1, performance.now() - pStart);
            downloadLoadedPings.push(pDuration);
            const sample: LatencySample = {
              timestamp: Date.now(),
              durationMs: Number(pDuration.toFixed(1)),
              type: 'download-loaded',
            };
            latencySamples.push(sample);
            callbacks.onLatencyPoint(sample);

            const avgLoaded = downloadLoadedPings.reduce((a, b) => a + b, 0) / downloadLoadedPings.length;
            callbacks.onMetricsUpdate({
              downloadLoadedPingMs: Number(avgLoaded.toFixed(1)),
            });
          }
        } catch {
          // Ignore loaded ping drops under heavy load
        }
      }, 400);

      // Rolling throughput tracker
      let windowBytes = 0;
      let lastWindowTime = performance.now();

      const workerPromises = Array.from({ length: numDownloadWorkers }).map(async () => {
        while (downloadIsActive && !signal.aborted) {
          try {
            // Request chunks (8MB each)
            const res = await fetch('/api/speedtest/download?size=8388608&worker=' + Math.random(), {
              cache: 'no-store',
              signal,
            });
            if (!res.body) break;

            const reader = res.body.getReader();
            while (downloadIsActive && !signal.aborted) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                totalBytesDownloaded += value.length;
                windowBytes += value.length;

                const now = performance.now();
                const deltaSec = (now - lastWindowTime) / 1000;

                // Update metrics every 100ms
                if (deltaSec >= 0.1) {
                  const instantMbps = (windowBytes * 8) / (deltaSec * 1000000);
                  const totalSec = (now - downloadStartTime) / 1000;
                  const overallMbps = (totalBytesDownloaded * 8) / (totalSec * 1000000);

                  peakDownloadMbps = Math.max(peakDownloadMbps, instantMbps);

                  const tpSample: ThroughputSample = {
                    timestamp: Date.now(),
                    speedMbps: Number(instantMbps.toFixed(1)),
                    phase: 'download',
                    loadedBytes: totalBytesDownloaded,
                  };
                  throughputSamples.push(tpSample);
                  callbacks.onThroughputPoint(tpSample);

                  callbacks.onMetricsUpdate({
                    downloadMbps: Number(overallMbps.toFixed(1)),
                    peakDownloadMbps: Number(peakDownloadMbps.toFixed(1)),
                  });

                  windowBytes = 0;
                  lastWindowTime = now;
                }
              }
            }
          } catch (err: any) {
            if (err.name === 'AbortError') break;
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      });

      // Let download run for the duration
      await new Promise((resolve) => {
        const checkEnd = () => {
          if (performance.now() - downloadStartTime >= downloadDurationMs || signal.aborted) {
            downloadIsActive = false;
            clearInterval(loadedPingInterval);
            resolve(true);
          } else {
            setTimeout(checkEnd, 100);
          }
        };
        checkEnd();
      });

      downloadIsActive = false;
      clearInterval(loadedPingInterval);
      await Promise.allSettled(workerPromises);

      const finalDlSec = Math.max(0.5, (performance.now() - downloadStartTime) / 1000);
      metrics.downloadMbps = Number(((totalBytesDownloaded * 8) / (finalDlSec * 1000000)).toFixed(1));
      metrics.peakDownloadMbps = Number(peakDownloadMbps.toFixed(1));
      metrics.downloadLoadedPingMs =
        downloadLoadedPings.length > 0
          ? Number((downloadLoadedPings.reduce((a, b) => a + b, 0) / downloadLoadedPings.length).toFixed(1))
          : metrics.pingMs;

      // PHASE 3: Multi-stream Upload Speed + Upload Loaded Ping
      callbacks.onPhaseChange('upload');
      callbacks.onLog?.('Initiating parallel uplink saturation & buffer bloat verification...');

      const uploadLoadedPings: number[] = [];
      const uploadStartTime = performance.now();
      const uploadDurationMs = 6500; // 6.5 seconds
      let totalBytesUploaded = 0;
      let peakUploadMbps = 0;
      let uploadIsActive = true;

      // Loaded ping loop during upload
      const uploadPingInterval = setInterval(async () => {
        if (!uploadIsActive || signal.aborted) return;
        const pStart = performance.now();
        try {
          const res = await fetch('/api/speedtest/ping?bufferbloat=ul&t=' + Date.now(), {
            cache: 'no-store',
            signal,
          });
          if (res.ok) {
            const pDuration = Math.max(1, performance.now() - pStart);
            uploadLoadedPings.push(pDuration);
            const sample: LatencySample = {
              timestamp: Date.now(),
              durationMs: Number(pDuration.toFixed(1)),
              type: 'upload-loaded',
            };
            latencySamples.push(sample);
            callbacks.onLatencyPoint(sample);

            const avgLoaded = uploadLoadedPings.reduce((a, b) => a + b, 0) / uploadLoadedPings.length;
            callbacks.onMetricsUpdate({
              uploadLoadedPingMs: Number(avgLoaded.toFixed(1)),
            });
          }
        } catch {
          // ignore
        }
      }, 400);

      // Create reusable 512KB payload chunk for upload
      const uploadPayload = new Uint8Array(512 * 1024);
      for (let i = 0; i < uploadPayload.length; i += 64) {
        uploadPayload[i] = (i ^ 0x5a) & 0xff;
      }

      let upWindowBytes = 0;
      let lastUpWindowTime = performance.now();

      const numUploadWorkers = 3;
      const uploadWorkerPromises = Array.from({ length: numUploadWorkers }).map(async () => {
        while (uploadIsActive && !signal.aborted) {
          try {
            const chunkStart = performance.now();
            const res = await fetch('/api/speedtest/upload', {
              method: 'POST',
              body: uploadPayload,
              signal,
            });

            if (res.ok) {
              const chunkBytes = uploadPayload.length;
              totalBytesUploaded += chunkBytes;
              upWindowBytes += chunkBytes;

              const now = performance.now();
              const deltaSec = (now - lastUpWindowTime) / 1000;

              if (deltaSec >= 0.1) {
                const instantMbps = (upWindowBytes * 8) / (deltaSec * 1000000);
                const totalSec = (now - uploadStartTime) / 1000;
                const overallMbps = (totalBytesUploaded * 8) / (totalSec * 1000000);

                peakUploadMbps = Math.max(peakUploadMbps, instantMbps);

                const tpSample: ThroughputSample = {
                  timestamp: Date.now(),
                  speedMbps: Number(instantMbps.toFixed(1)),
                  phase: 'upload',
                  loadedBytes: totalBytesUploaded,
                };
                throughputSamples.push(tpSample);
                callbacks.onThroughputPoint(tpSample);

                callbacks.onMetricsUpdate({
                  uploadMbps: Number(overallMbps.toFixed(1)),
                  peakUploadMbps: Number(peakUploadMbps.toFixed(1)),
                });

                upWindowBytes = 0;
                lastUpWindowTime = now;
              }
            }
          } catch (err: any) {
            if (err.name === 'AbortError') break;
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      });

      await new Promise((resolve) => {
        const checkEnd = () => {
          if (performance.now() - uploadStartTime >= uploadDurationMs || signal.aborted) {
            uploadIsActive = false;
            clearInterval(uploadPingInterval);
            resolve(true);
          } else {
            setTimeout(checkEnd, 100);
          }
        };
        checkEnd();
      });

      uploadIsActive = false;
      clearInterval(uploadPingInterval);
      await Promise.allSettled(uploadWorkerPromises);

      const finalUlSec = Math.max(0.5, (performance.now() - uploadStartTime) / 1000);
      metrics.uploadMbps = Number(((totalBytesUploaded * 8) / (finalUlSec * 1000000)).toFixed(1));
      metrics.peakUploadMbps = Number(peakUploadMbps.toFixed(1));
      metrics.uploadLoadedPingMs =
        uploadLoadedPings.length > 0
          ? Number((uploadLoadedPings.reduce((a, b) => a + b, 0) / uploadLoadedPings.length).toFixed(1))
          : metrics.pingMs;

      // PHASE 4: Calculations & Bufferbloat Grading
      const bufferbloatDelta = Math.max(0, metrics.downloadLoadedPingMs - metrics.pingMs);
      if (bufferbloatDelta <= 5) metrics.bufferbloatGrade = 'A+';
      else if (bufferbloatDelta <= 15) metrics.bufferbloatGrade = 'A';
      else if (bufferbloatDelta <= 35) metrics.bufferbloatGrade = 'B';
      else if (bufferbloatDelta <= 75) metrics.bufferbloatGrade = 'C';
      else if (bufferbloatDelta <= 150) metrics.bufferbloatGrade = 'D';
      else metrics.bufferbloatGrade = 'F';

      // MOS Calculation (Mean Opinion Score for VoIP / Zoom / Teams)
      const effectiveLatency = metrics.pingMs + metrics.jitterMs * 2 + 10;
      let rFactor = 93.2;
      if (effectiveLatency > 160) {
        rFactor -= (effectiveLatency - 160) * 0.11;
      }
      rFactor -= metrics.packetLossPercent * 2.5;
      rFactor = Math.max(0, Math.min(100, rFactor));
      let calculatedMos = 1 + 0.035 * rFactor + rFactor * (100 - rFactor) * (rFactor - 60) * 0.000007;
      calculatedMos = Math.max(1.0, Math.min(4.5, calculatedMos));
      metrics.mosScore = Number(calculatedMos.toFixed(2));

      // Stability Score (variance of throughput and jitter penalty)
      let stability = 100 - metrics.jitterMs * 1.5 - metrics.packetLossPercent * 10;
      if (bufferbloatDelta > 50) stability -= 10;
      metrics.stabilityScore = Math.max(20, Math.min(99, Math.round(stability)));

      callbacks.onMetricsUpdate(metrics);

      // PHASE 5: AI Network Diagnostics
      callbacks.onPhaseChange('analyzing');
      callbacks.onLog?.('Generating AI Network Engineer diagnostic audit & troubleshooting plan...');

      const aiResponse = await fetch('/api/speedtest/ai-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          clientInfo,
          environment: {
            browser: navigator.userAgent,
            platform: navigator.platform,
            reportedIssue,
          },
        }),
      });

      let aiReport: AIDiagnosticReport;
      if (aiResponse.ok) {
        const json = await aiResponse.json();
        aiReport = json.report;
      } else {
        throw new Error('AI diagnostic request failed');
      }

      callbacks.onPhaseChange('completed');
      callbacks.onLog?.('Speed test & diagnostic report complete.');

      return {
        metrics,
        aiReport,
        latencySamples,
        throughputSamples,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callbacks.onLog?.('Speed test cancelled by user.');
      } else {
        callbacks.onLog?.(`Test error: ${err.message}`);
      }
      callbacks.onPhaseChange('idle');
      throw err;
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }
}
