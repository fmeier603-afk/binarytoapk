import React, { useState } from 'react';
import { Header } from './components/Header';
import { BinaryUploader } from './components/BinaryUploader';
import { GuiConfigurator } from './components/GuiConfigurator';
import { AndroidEmulator } from './components/AndroidEmulator';
import { ApkExportModal } from './components/ApkExportModal';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { AndroidServiceConfig, BinaryConfig, GuiThemeConfig } from './types';
import { SAMPLE_BINARIES } from './utils/sampleBinaries';
import {
  Download,
  Smartphone,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  FileCode,
  Terminal,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'builder' | 'emulator' | 'export' | 'guide'>('builder');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Initial state loads the popular Micro HTTP Web Server sample preset
  const [binary, setBinary] = useState<BinaryConfig>(SAMPLE_BINARIES[0]);

  const [gui, setGui] = useState<GuiThemeConfig>({
    style: 'material',
    primaryColor: '#10b981',
    startBtnLabel: 'Start Service',
    stopBtnLabel: 'Stop Service',
    restartBtnLabel: 'Restart',
    showRestartBtn: true,
    showClearLogsBtn: true,
    showPortPreview: true,
    enableArgEditing: true,
    autoScrollLogs: true,
    fontSize: 'sm',
  });

  const [service, setService] = useState<AndroidServiceConfig>({
    appName: 'Micro HTTP Server',
    packageName: 'com.droidwrap.microhttpd',
    versionName: '1.0.0',
    versionCode: 1,
    appIconId: 'server',
    keepAwakeWakeLock: true,
    autoStartOnBoot: false,
    killSignal: 'SIGTERM',
    notificationTitle: 'Micro HTTP Server is Active',
    notificationBody: 'Listening on port 8080 in background',
    notificationChannel: 'Foreground Daemon Service',
  });

  const handleSelectPreset = (preset: BinaryConfig) => {
    setBinary(preset);
    // Auto-update app and service defaults to match the selected binary
    setService((prev) => ({
      ...prev,
      appName: preset.name,
      packageName: `com.droidwrap.${preset.fileName.replace(/[^a-zA-Z0-9]/g, '')}`,
      notificationTitle: `${preset.name} is Active`,
      notificationBody: preset.listeningPort
        ? `Listening on port ${preset.listeningPort} in background`
        : 'Process executing in background',
    }));
  };

  const handleBinaryUpdate = (updates: Partial<BinaryConfig>) => {
    setBinary((prev) => ({ ...prev, ...updates }));
  };

  const handleGuiUpdate = (updates: Partial<GuiThemeConfig>) => {
    setGui((prev) => ({ ...prev, ...updates }));
  };

  const handleServiceUpdate = (updates: Partial<AndroidServiceConfig>) => {
    setService((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        appName={service.appName}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Tab View */}
        {activeTab === 'builder' && (
          <div className="space-y-12">
            {/* Quick Hero Banner / Context */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Android Native Tooling</span>
                  <span aria-hidden="true">·</span>
                  <span>Zero-CLI Wrapper</span>
                  <span aria-hidden="true">·</span>
                  <span>Direct APK Compilation</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Package any command-line binary into a touch-friendly Android APK
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  No terminal commands, no root access, and no Java/Kotlin coding required. Upload your ELF binary, configure the Start/Stop controls, and download an installable APK.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('emulator')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Preview in Simulator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Build APK Now</span>
                </button>
              </div>
            </div>

            {/* Split Builder View: Left (Binary Upload & ELF) + Right (GUI Configurator) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Binary File & ELF Details (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <BinaryUploader
                  binary={binary}
                  onBinaryChange={setBinary}
                  onSelectPreset={handleSelectPreset}
                />
              </div>

              {/* Right Column: Start/Stop GUI Customization (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <GuiConfigurator
                  binary={binary}
                  gui={gui}
                  service={service}
                  onBinaryUpdate={handleBinaryUpdate}
                  onGuiUpdate={handleGuiUpdate}
                  onServiceUpdate={handleServiceUpdate}
                />

                <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Ready to test your configured GUI?
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('emulator')}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all"
                  >
                    <span>Launch Android Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emulator' && (
          <AndroidEmulator
            binary={binary}
            gui={gui}
            service={service}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Download & Install Android APK
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Package your native binary and Start/Stop GUI into an installation file for any Android device.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
                <Smartphone className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{service.appName}</h3>
                <div className="mt-1 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span>{service.packageName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{binary.elfInfo.architecture}</span>
                  <span aria-hidden="true">·</span>
                  <span>v{service.versionName}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Open Export Dialog</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('emulator')}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
                >
                  Back to Simulator
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && <ArchitectureGuide />}
      </main>

      {/* APK Export & Installation Modal */}
      <ApkExportModal
        binary={binary}
        gui={gui}
        service={service}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Quiet Clean Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          DroidWrap Studio · Native ELF Executable Packaging for Android 8.0–14+
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('guide')}
            className="hover:text-slate-400 transition-colors"
          >
            Native Architecture
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setActiveTab('emulator')}
            className="hover:text-slate-400 transition-colors"
          >
            Live Simulator
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => setIsExportOpen(true)}
            className="hover:text-slate-400 transition-colors text-emerald-400"
          >
            Download APK
          </button>
        </div>
      </footer>
    </div>
  );
}
