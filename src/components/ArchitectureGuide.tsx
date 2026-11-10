import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Zap,
  HelpCircle,
  FileCode,
  Smartphone,
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Under the Hood: How DroidWrap Eliminates Manual CLI Wrapping
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Why running native command-line executables on Android is notoriously difficult—and how this tool solves each obstacle automatically.
        </p>
      </div>

      {/* Comparison: The Manual CLI Nightmare vs DroidWrap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pain points of manual wrapping */}
        <div className="p-5 rounded-xl border border-rose-900/40 bg-rose-950/10 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>The Manual CLI Dilemma</span>
          </div>

          <ul className="text-xs text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✕</span>
              <span>
                <strong>W^X Noexec Restrictions:</strong> Android 10+ forbids executing files from <code className="text-slate-200">/data/data/app/files</code> (<code className="text-rose-300">Permission Denied</code> even after chmod 755).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✕</span>
              <span>
                <strong>Killed by Android Doze:</strong> As soon as the user turns off the screen or opens another app, Android kills the CLI binary immediately.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✕</span>
              <span>
                <strong>Zero GUI for End-Users:</strong> Requires terminal apps like Termux, typing obscure paths, environment variables, and flags.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 shrink-0 font-bold">✕</span>
              <span>
                <strong>Process Deadlocks:</strong> Unhandled STDOUT/STDERR pipe buffers in Java lock the operating system process indefinitely.
              </span>
            </li>
          </ul>
        </div>

        {/* DroidWrap Automated Solution */}
        <div className="p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>The DroidWrap Solution</span>
          </div>

          <ul className="text-xs text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span>
                <strong>Automatic Native Lib Extraction:</strong> Packages binary as a shared library in <code className="text-emerald-300">lib/arm64-v8a/</code>, which Android natively grants executable permissions to.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span>
                <strong>Persistent Foreground Service:</strong> Couples an Android notification and WakeLock to guarantee 24/7 background execution.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span>
                <strong>1-Tap Start & Stop GUI:</strong> Beautiful touch controls with live status updates, uptime counter, and real-time scrolling console.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span>
                <strong>Ready-to-Install APK:</strong> Generates a signed, installable Android APK that anyone can sideload in seconds.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4 Architectural Pillars */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Core Technical Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>1. ELF Header Inspection</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifies the binary is compiled with Position-Independent Executable (<code className="text-emerald-300">-fPIE</code>) flags and matches Android's target CPU architecture (ARM64-v8a, ARMv7, or x86_64).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>2. Foreground Service Lifecycle</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wraps process management in an Android Service with <code className="text-emerald-300">startForeground()</code> and <code className="text-emerald-300">PARTIAL_WAKE_LOCK</code> so Android never puts the binary to sleep.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>3. Async Pipe Streaming</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spawns independent daemon threads gobbling <code className="text-emerald-300">process.inputStream</code> and <code className="text-emerald-300">errorStream</code>, broadcasting output directly to the UI scroll view.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>4. Android Package Manager (APK)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Packages standard AndroidManifest, classes.dex, and signed certificate headers directly in the browser using client-side ZIP compilation.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          <details className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer group">
            <summary className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
              Does the Android phone need to be rooted?
            </summary>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              No! Rooting is completely unnecessary. DroidWrap places the native binary into the app's native library directory (<code className="text-slate-300">lib/arm64-v8a/</code>). The stock Android operating system automatically gives execute permissions to files extracted from this folder upon regular installation.
            </p>
          </details>

          <details className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer group">
            <summary className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
              Can my binary listen on network ports (like HTTP 8080 or iPerf 5201)?
            </summary>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Yes! Non-root apps on Linux and Android can bind to any unprivileged port above 1024 (e.g. 8080, 5201, 8443, 9000). The generated app requests the <code className="text-emerald-300">android.permission.INTERNET</code> permission in its AndroidManifest.xml.
            </p>
          </details>

          <details className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer group">
            <summary className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
              What compiler flags should I use when building native C/C++/Go/Rust binaries?
            </summary>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              For Go: <code className="text-emerald-400 font-mono">GOOS=android GOARCH=arm64 go build -buildmode=pie</code>.<br />
              For Rust: <code className="text-emerald-400 font-mono">cargo build --target aarch64-linux-android --release</code>.<br />
              For C/C++: Compile with the Android NDK clang using <code className="text-emerald-400 font-mono">-fPIE -pie</code>.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};
