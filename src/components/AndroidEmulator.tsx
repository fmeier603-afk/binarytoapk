import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Wifi,
  Battery,
  Bell,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AndroidServiceConfig, BinaryConfig, GuiThemeConfig, LogLine, ProcessStatus } from '../types';

interface AndroidEmulatorProps {
  binary: BinaryConfig;
  gui: GuiThemeConfig;
  service: AndroidServiceConfig;
  onOpenExport: () => void;
}

export const AndroidEmulator: React.FC<AndroidEmulatorProps> = ({
  binary,
  gui,
  service,
  onOpenExport,
}) => {
  const [status, setStatus] = useState<ProcessStatus>('stopped');
  const [logs, setLogs] = useState<LogLine[]>([
    {
      id: 'init-1',
      timestamp: '00:00:00',
      type: 'system',
      message: `${service.appName} initialized. Native library lib${binary.fileName}.so verified in application nativeLibraryDir.`,
    },
  ]);
  const [pid, setPid] = useState<number | null>(null);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [editableArgs, setEditableArgs] = useState(binary.defaultArgs);
  const [copied, setCopied] = useState(false);
  const [showWebModal, setShowWebModal] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Sync default args when binary updates
  useEffect(() => {
    setEditableArgs(binary.defaultArgs);
  }, [binary.defaultArgs]);

  // Auto-scroll logs
  useEffect(() => {
    if (gui.autoScrollLogs && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, gui.autoScrollLogs]);

  // Process uptime timer
  useEffect(() => {
    let timer: any;
    if (status === 'running') {
      timer = setInterval(() => {
        setUptimeSeconds((s) => s + 1);
      }, 1000);
    } else {
      setUptimeSeconds(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Simulated log streaming when running
  useEffect(() => {
    if (status !== 'running') return;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      const timeStr = new Date().toTimeString().split(' ')[0];

      if (binary.fileName.includes('http') || binary.listeningPort === 8080) {
        const paths = ['/index.html', '/api/v1/health', '/assets/style.css', '/favicon.ico', '/api/v1/data'];
        const chosen = paths[Math.floor(Math.random() * paths.length)];
        const latency = (Math.random() * 8 + 1.2).toFixed(2);
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${count}`,
            timestamp: timeStr,
            type: 'stdout',
            message: `[HTTP] GET ${chosen} 200 OK (${latency}ms) - 127.0.0.1`,
          },
        ]);
      } else if (binary.fileName.includes('iperf') || binary.listeningPort === 5201) {
        const mb = (Math.random() * 15 + 85).toFixed(1);
        const mbits = (Math.random() * 120 + 720).toFixed(0);
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${count}`,
            timestamp: timeStr,
            type: 'stdout',
            message: `[  5] ${count}.00-${count + 1}.00 sec  ${mb} MBytes  ${mbits} Mbits/sec`,
          },
        ]);
      } else if (binary.fileName.includes('dns') || binary.listeningPort === 5353) {
        const domains = ['android.clients.google.com', 'api.github.com', 'cloudflare-dns.com', 'wikipedia.org'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${count}`,
            timestamp: timeStr,
            type: 'stdout',
            message: `[DNS] Resolved ${domain} -> 104.16.132.229 (cached, 1.4ms)`,
          },
        ]);
      } else {
        const temp = (38 + Math.random() * 4).toFixed(1);
        const load = (Math.random() * 35 + 10).toFixed(1);
        setLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${count}`,
            timestamp: timeStr,
            type: 'stdout',
            message: `[SYSWATCH] Cores: 8 active · Temp: ${temp}°C · CPU load: ${load}% · Battery: 94%`,
          },
        ]);
      }
    }, 2400);

    return () => clearInterval(interval);
  }, [status, binary]);

  const handleStart = () => {
    setStatus('starting');
    const assignedPid = Math.floor(Math.random() * 20000) + 10000;
    setPid(assignedPid);

    const now = new Date().toTimeString().split(' ')[0];
    const initialLogs: LogLine[] = [
      {
        id: `start-1-${Date.now()}`,
        timestamp: now,
        type: 'system',
        message: `[SYSTEM] Unpacking /data/app/${service.packageName}/lib/arm64/lib${binary.fileName}.so`,
      },
      {
        id: `start-2-${Date.now()}`,
        timestamp: now,
        type: 'system',
        message: `[SYSTEM] Starting Android Foreground Service (${service.notificationChannel})`,
      },
      {
        id: `start-3-${Date.now()}`,
        timestamp: now,
        type: 'system',
        message: `[EXEC] ProcessBuilder spawned PID ${assignedPid} with args: "${editableArgs}"`,
      },
    ];

    if (binary.listeningPort) {
      initialLogs.push({
        id: `start-4-${Date.now()}`,
        timestamp: now,
        type: 'stdout',
        message: `[BIND] Successfully listening on 0.0.0.0:${binary.listeningPort} (TCP)`,
      });
    }

    setLogs((prev) => [...prev, ...initialLogs]);
    setTimeout(() => {
      setStatus('running');
    }, 450);
  };

  const handleStop = () => {
    setStatus('stopping');
    const now = new Date().toTimeString().split(' ')[0];
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          id: `stop-1-${Date.now()}`,
          timestamp: now,
          type: 'system',
          message: `[SYSTEM] Sent ${service.killSignal} to process PID ${pid}. Process gracefully terminated (exit 0).`,
        },
        {
          id: `stop-2-${Date.now()}`,
          timestamp: now,
          type: 'system',
          message: `[SYSTEM] Foreground Service halted. Notification dismissed.`,
        },
      ]);
      setStatus('stopped');
      setPid(null);
    }, 300);
  };

  const handleRestart = () => {
    handleStop();
    setTimeout(() => {
      handleStart();
    }, 500);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUptime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Theme-specific styling classes
  const isTerminalTheme = gui.style === 'terminal';
  const isMinimalTheme = gui.style === 'minimal';
  const isIndustrialTheme = gui.style === 'industrial';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            3. Interactive Android Simulator
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Preview and test the generated Android GUI in real time. Press Start to launch the native process.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg hover:bg-emerald-900/60 transition-colors"
          >
            <span>Download APK</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Android Phone Frame (Col 7 on large) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[380px] rounded-[42px] p-3.5 bg-slate-900 border-4 border-slate-700 shadow-2xl relative">
            {/* Phone Outer Chassis Highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-700"></div>
            </div>

            {/* Inner Screen */}
            <div
              className={`rounded-[32px] overflow-hidden flex flex-col h-[680px] transition-colors relative ${
                isTerminalTheme
                  ? 'bg-black text-green-400 font-mono'
                  : isIndustrialTheme
                  ? 'bg-slate-950 text-slate-100 font-sans'
                  : 'bg-slate-900 text-slate-100 font-sans'
              }`}
            >
              {/* Android Status Bar */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-400 select-none z-10 shrink-0">
                <span className="font-semibold">09:41</span>
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">5G</span>
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px]">98%</span>
                    <Battery className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Notification Banner when running */}
              {status === 'running' && (
                <div className="mx-3 my-1 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-md flex items-center gap-2.5 text-xs animate-in fade-in duration-200">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 font-bold"
                    style={{ backgroundColor: gui.primaryColor }}
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate text-[11px]">
                      {service.notificationTitle}
                    </div>
                    <div className="text-slate-400 truncate text-[10px]">
                      {service.notificationBody} · PID {pid}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 shrink-0">
                    {formatUptime(uptimeSeconds)}
                  </span>
                </div>
              )}

              {/* In-App Title Bar */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                    style={{ backgroundColor: gui.primaryColor }}
                  >
                    {service.appIconId === 'terminal'
                      ? '>_'
                      : service.appIconId === 'rocket'
                      ? '⚡'
                      : service.appIconId === 'network'
                      ? '☍'
                      : '⚙'}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm text-white truncate leading-tight">
                      {service.appName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {service.packageName}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      status === 'running'
                        ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                        : status === 'starting' || status === 'stopping'
                        ? 'bg-amber-400'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      status === 'running'
                        ? 'text-emerald-400'
                        : status === 'starting' || status === 'stopping'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-4 flex-1 flex flex-col gap-3 min-h-0">
                {/* Editable Arguments Field */}
                {gui.enableArgEditing && (
                  <div className="shrink-0">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Process Arguments:
                    </label>
                    <input
                      type="text"
                      disabled={status === 'running'}
                      value={editableArgs}
                      onChange={(e) => setEditableArgs(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-950/80 border border-slate-700 rounded-lg text-emerald-400 disabled:opacity-60 focus:outline-none"
                    />
                  </div>
                )}

                {/* Big Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 shrink-0">
                  <button
                    type="button"
                    disabled={status === 'running' || status === 'starting'}
                    onClick={handleStart}
                    style={{
                      backgroundColor:
                        status === 'running' || status === 'starting'
                          ? '#334155'
                          : gui.primaryColor,
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{gui.startBtnLabel}</span>
                  </button>

                  <button
                    type="button"
                    disabled={status === 'stopped' || status === 'stopping'}
                    onClick={handleStop}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 shadow-md transition-all active:scale-95 disabled:cursor-not-allowed"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{gui.stopBtnLabel}</span>
                  </button>
                </div>

                {/* Secondary Controls (Restart, Port preview) */}
                <div className="flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {gui.showRestartBtn && (
                      <button
                        type="button"
                        disabled={status !== 'running'}
                        onClick={handleRestart}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 disabled:opacity-40"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{gui.restartBtnLabel}</span>
                      </button>
                    )}

                    {binary.listeningPort && gui.showPortPreview && (
                      <button
                        type="button"
                        onClick={() => setShowWebModal(true)}
                        disabled={status !== 'running'}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 disabled:opacity-30"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>:{binary.listeningPort} Web UI</span>
                      </button>
                    )}
                  </div>

                  {gui.showClearLogsBtn && (
                    <button
                      type="button"
                      onClick={handleClearLogs}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Clear Logs
                    </button>
                  )}
                </div>

                {/* Live Output Log Terminal */}
                <div className="flex-1 flex flex-col min-h-0 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      <span className="font-mono">Log Console</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyLogs}
                        className="hover:text-white flex items-center gap-0.5"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div
                    ref={logsContainerRef}
                    className="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text"
                  >
                    {logs.length === 0 ? (
                      <div className="text-slate-600 italic">No output logged yet.</div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="break-all">
                          <span className="text-slate-600 select-none mr-1.5">
                            [{log.timestamp}]
                          </span>
                          <span
                            className={
                              log.type === 'system'
                                ? 'text-amber-400'
                                : log.type === 'stderr'
                                ? 'text-rose-400'
                                : isTerminalTheme
                                ? 'text-green-400'
                                : 'text-slate-200'
                            }
                          >
                            {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Android Home Navigation Bar */}
              <div className="py-2 flex justify-center shrink-0">
                <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Inspector & Live Telemetry Panel (Col 5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Runtime Diagnostic Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-400">Process State</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5 capitalize">
                  {status}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-400">Process PID</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {pid ? pid : 'None'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-400">Uptime</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {formatUptime(uptimeSeconds)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <span className="text-slate-400">Foreground Notification</span>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {status === 'running' ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Executable Path:</span>
                <span className="font-mono text-slate-300 truncate max-w-[200px]">
                  /data/app/.../libdaemon.so
                </span>
              </div>
              <div className="flex justify-between">
                <span>CPU WakeLock:</span>
                <span className="font-mono text-emerald-400">
                  {service.keepAwakeWakeLock ? 'PARTIAL_WAKE_LOCK Acquired' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Boot Receiver:</span>
                <span className="font-mono text-slate-300">
                  {service.autoStartOnBoot ? 'RECEIVE_BOOT_COMPLETED' : 'Manual Launch Only'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help For Non-Technical Users */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Why Wrap In A GUI?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native command-line binaries (C++, Go, Rust) normally require opening Termux, granting root or adb permissions, navigating directories via <code className="text-emerald-400">cd</code>, and running complex arguments.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              DroidWrap packages the binary into an Android app with a real Start/Stop button, meaning anyone can install it and launch the service with a single tap.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Local Web UI Modal (if port is active) */}
      {showWebModal && binary.listeningPort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Local Web UI Preview (http://localhost:{binary.listeningPort})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWebModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <div className="text-emerald-400 font-bold">HTTP/1.1 200 OK</div>
              <div>Server: {binary.name} (Android Daemon)</div>
              <div>Content-Type: application/json</div>
              <div className="pt-2 text-slate-400">
                {`{
  "status": "online",
  "app": "${service.appName}",
  "port": ${binary.listeningPort},
  "uptime_seconds": ${uptimeSeconds},
  "android_abi": "arm64-v8a"
}`}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowWebModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
