import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  FileArchive,
  Smartphone,
  Terminal,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Info,
  Layers,
} from 'lucide-react';
import { AndroidServiceConfig, BinaryConfig, GuiThemeConfig } from '../types';
import { buildApkPackage, buildFullSourceProjectZip } from '../utils/apkGenerator';

interface ApkExportModalProps {
  binary: BinaryConfig;
  gui: GuiThemeConfig;
  service: AndroidServiceConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({
  binary,
  gui,
  service,
  isOpen,
  onClose,
}) => {
  const [isGeneratingApk, setIsGeneratingApk] = useState(false);
  const [isGeneratingSource, setIsGeneratingSource] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<'apk' | 'source' | null>(null);
  const [activeTab, setActiveTab] = useState<'install' | 'adb' | 'inspect'>('install');
  const [copiedAdb, setCopiedAdb] = useState(false);

  if (!isOpen) return null;

  const handleDownloadApk = async () => {
    setIsGeneratingApk(true);
    try {
      const apkBlob = await buildApkPackage(binary, gui, service);
      const url = URL.createObjectURL(apkBlob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = service.appName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `${safeName}-release.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess('apk');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to generate APK:', err);
    } finally {
      setIsGeneratingApk(false);
    }
  };

  const handleDownloadSource = async () => {
    setIsGeneratingSource(true);
    try {
      const sourceBlob = await buildFullSourceProjectZip(binary, gui, service);
      const url = URL.createObjectURL(sourceBlob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = service.appName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `${safeName}-AndroidStudio-Project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess('source');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to generate source zip:', err);
    } finally {
      setIsGeneratingSource(false);
    }
  };

  const adbCommands = `# 1. Install APK to connected Android device over USB/Wi-Fi
adb install -r ${service.appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}-release.apk

# 2. Launch the Start/Stop GUI Activity
adb shell am start -n ${service.packageName}/.MainActivity

# 3. Stream real-time daemon logs from device
adb logcat -s BinaryDaemonService`;

  const copyAdb = () => {
    navigator.clipboard.writeText(adbCommands);
    setCopiedAdb(true);
    setTimeout(() => setCopiedAdb(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Export & Install Ready APK
              </h3>
              <p className="text-xs text-slate-400">
                Package <span className="font-mono text-emerald-400">{binary.fileName}</span> into {service.appName} ({service.packageName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded"
          >
            ✕ Close
          </button>
        </div>

        {/* Primary Download CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={isGeneratingApk}
            onClick={handleDownloadApk}
            className="flex items-center justify-center gap-3 p-4 rounded-xl text-white font-bold bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg active:scale-98 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="text-sm">
                {isGeneratingApk ? 'Packaging APK...' : 'Download Ready-to-Install APK'}
              </div>
              <div className="text-[11px] text-emerald-100 font-normal">
                Direct .apk installation file
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isGeneratingSource}
            onClick={handleDownloadSource}
            className="flex items-center justify-center gap-3 p-4 rounded-xl text-slate-200 font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-lg active:scale-98 disabled:opacity-50"
          >
            <FileArchive className="w-5 h-5 text-slate-400" />
            <div className="text-left">
              <div className="text-sm">
                {isGeneratingSource ? 'Archiving Source...' : 'Download Full Source (ZIP)'}
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Android Studio Kotlin project
              </div>
            </div>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {downloadSuccess === 'apk'
                ? 'APK downloaded successfully! Follow the installation steps below.'
                : 'Source project ZIP downloaded successfully!'}
            </span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'install'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Beginner Install Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adb')}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'adb'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Developer ADB Commands
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inspect')}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeTab === 'inspect'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            APK Package Contents
          </button>
        </div>

        {/* TAB 1: Beginner Install Guide */}
        {activeTab === 'install' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                How to install on your Android device (No command line required):
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-white">Transfer or Download APK</div>
                    <div className="text-slate-400 mt-0.5">
                      Send the downloaded <code className="text-emerald-400">.apk</code> file to your Android phone via USB, Google Drive, WhatsApp, or open this tool directly in your mobile browser.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-white">Allow Unknown Apps & Install</div>
                    <div className="text-slate-400 mt-0.5">
                      Tap the file in Files or Downloads. If Android says <em>"For your security, your phone cannot install unknown apps"</em>, tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong>, then tap <strong>Install</strong>.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-white">Launch with 1-Tap!</div>
                    <div className="text-slate-400 mt-0.5">
                      Open <strong>{service.appName}</strong> from your home screen. Press <strong>{gui.startBtnLabel}</strong>. The binary starts in the background and keeps running even when you lock your screen!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADB Commands */}
        {activeTab === 'adb' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Run in terminal on your computer:</span>
              <button
                type="button"
                onClick={copyAdb}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                {copiedAdb ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAdb ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {adbCommands}
            </pre>
          </div>
        )}

        {/* TAB 3: APK Package Contents */}
        {activeTab === 'inspect' && (
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Architecture:</span>
                <span className="font-mono text-white">{binary.elfInfo.architecture}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Android SDK Target:</span>
                <span className="font-mono text-white">Android 14 (API 34) · Min API 26</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Library Location:</span>
                <span className="font-mono text-emerald-400">
                  lib/{binary.elfInfo.architecture === 'arm64-v8a' ? 'arm64-v8a' : 'universal'}/lib{binary.fileName}.so
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Foreground Service Type:</span>
                <span className="font-mono text-white">specialUse (Daemon Engine)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Declared Permissions:</span>
                <span className="font-mono text-white">INTERNET, WAKE_LOCK, FOREGROUND_SERVICE</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
