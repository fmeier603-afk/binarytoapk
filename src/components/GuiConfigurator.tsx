import React, { useState } from 'react';
import {
  Settings,
  Play,
  Square,
  RefreshCw,
  Terminal,
  Shield,
  Bell,
  Cpu,
  Plus,
  Trash2,
  Palette,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { AndroidServiceConfig, BinaryConfig, GuiThemeConfig } from '../types';

interface GuiConfiguratorProps {
  binary: BinaryConfig;
  gui: GuiThemeConfig;
  service: AndroidServiceConfig;
  onBinaryUpdate: (updates: Partial<BinaryConfig>) => void;
  onGuiUpdate: (updates: Partial<GuiThemeConfig>) => void;
  onServiceUpdate: (updates: Partial<AndroidServiceConfig>) => void;
}

export const GuiConfigurator: React.FC<GuiConfiguratorProps> = ({
  binary,
  gui,
  service,
  onBinaryUpdate,
  onGuiUpdate,
  onServiceUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'gui' | 'runtime' | 'service'>('gui');
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');

  const addEnvVariable = () => {
    if (!newEnvKey.trim()) return;
    const updated = [...binary.envVariables, { key: newEnvKey.trim(), value: newEnvVal.trim() }];
    onBinaryUpdate({ envVariables: updated });
    setNewEnvKey('');
    setNewEnvVal('');
  };

  const removeEnvVariable = (index: number) => {
    const updated = binary.envVariables.filter((_, i) => i !== index);
    onBinaryUpdate({ envVariables: updated });
  };

  const colorPresets = [
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Sky Blue', hex: '#0ea5e9' },
    { label: 'Violet', hex: '#8b5cf6' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Rose', hex: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          2. Customize Start/Stop GUI & Android Service
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Transform the raw command line binary into an intuitive, non-technical Android user interface.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
        <button
          onClick={() => setActiveTab('gui')}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'gui'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Buttons & Theme
        </button>
        <button
          onClick={() => setActiveTab('runtime')}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'runtime'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CLI Arguments & Ports
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'service'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Foreground Service & Boot
        </button>
      </div>

      {/* TAB 1: GUI Buttons & Theme */}
      {activeTab === 'gui' && (
        <div className="space-y-5">
          {/* App Metadata */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              App Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Android App Name
                </label>
                <input
                  type="text"
                  value={service.appName}
                  onChange={(e) => onServiceUpdate({ appName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. My Daemon Service"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Package ID
                </label>
                <input
                  type="text"
                  value={service.packageName}
                  onChange={(e) => onServiceUpdate({ packageName: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="com.droidwrap.mydaemon"
                />
              </div>
            </div>

            {/* App Icon Shape & Color */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  App Icon Symbol
                </label>
                <div className="flex items-center gap-2">
                  {(['server', 'terminal', 'rocket', 'bot', 'network'] as const).map((iconId) => (
                    <button
                      key={iconId}
                      type="button"
                      onClick={() => onServiceUpdate({ appIconId: iconId })}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        service.appIconId === iconId
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-800 bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {iconId === 'server' && '⚙ Server'}
                      {iconId === 'terminal' && '>_ CLI'}
                      {iconId === 'rocket' && '⚡ Speed'}
                      {iconId === 'bot' && '🤖 Bot'}
                      {iconId === 'network' && '☍ Net'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => onGuiUpdate({ primaryColor: c.hex })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        gui.primaryColor === c.hex ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start / Stop Button Labels */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              Button Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Start Button Label
                </label>
                <input
                  type="text"
                  value={gui.startBtnLabel}
                  onChange={(e) => onGuiUpdate({ startBtnLabel: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Stop Button Label
                </label>
                <input
                  type="text"
                  value={gui.stopBtnLabel}
                  onChange={(e) => onGuiUpdate({ stopBtnLabel: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gui.showRestartBtn}
                  onChange={(e) => onGuiUpdate({ showRestartBtn: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Include Restart Button</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gui.showClearLogsBtn}
                  onChange={(e) => onGuiUpdate({ showClearLogsBtn: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Include Clear Logs Button</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gui.enableArgEditing}
                  onChange={(e) => onGuiUpdate({ enableArgEditing: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Allow Arg Editing in App</span>
              </label>
            </div>
          </div>

          {/* Visual Theme */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              GUI Visual Style
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'material', name: 'Material Modern', desc: 'Sleek rounded cards with standard Android elevations' },
                { id: 'terminal', name: 'Hacker Terminal', desc: 'Monospace obsidian theme with green output phosphor' },
                { id: 'minimal', name: 'Minimal Switch', desc: 'Distraction-free massive toggle switch style' },
                { id: 'industrial', name: 'Industrial Slate', desc: 'High-density telemetry panel layout' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => onGuiUpdate({ style: th.id as any })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    gui.style === th.id
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{th.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{th.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLI Arguments & Ports */}
      {activeTab === 'runtime' && (
        <div className="space-y-5">
          {/* Default Arguments */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              CLI Arguments & Flags
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Default Execution Arguments
              </label>
              <input
                type="text"
                value={binary.defaultArgs}
                onChange={(e) => onBinaryUpdate({ defaultArgs: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
                placeholder="--port 8080 --bind 0.0.0.0 -v"
              />
              <p className="mt-1 text-xs text-slate-500">
                These flags will be passed to the binary executable upon clicking "{gui.startBtnLabel}".
              </p>
            </div>

            {/* Listening Port */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Listening Port (Optional)
                </label>
                <input
                  type="number"
                  value={binary.listeningPort || ''}
                  onChange={(e) =>
                    onBinaryUpdate({
                      listeningPort: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 8080 or 5201"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={gui.showPortPreview}
                    onChange={(e) => onGuiUpdate({ showPortPreview: e.target.checked })}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Show "Open Web UI" button when running</span>
                </label>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Environment Variables
            </h3>

            <div className="space-y-2">
              {binary.envVariables.map((env, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1/3 px-3 py-1.5 text-xs font-mono bg-slate-800 rounded border border-slate-700 text-slate-300">
                    {env.key}
                  </span>
                  <span className="text-xs text-slate-500">=</span>
                  <span className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-800 rounded border border-slate-700 text-emerald-400 truncate">
                    {env.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEnvVariable(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="KEY (e.g. LOG_LEVEL)"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value)}
                  className="w-1/3 px-3 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="VALUE"
                  value={newEnvVal}
                  onChange={(e) => setNewEnvVal(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded text-white"
                />
                <button
                  type="button"
                  onClick={addEnvVariable}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 hover:text-white rounded border border-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Foreground Service & Reliability */}
      {activeTab === 'service' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Android Foreground Service & Keep-Alive
            </h3>

            <p className="text-xs text-slate-400">
              Unlike desktop Linux, Android aggressively kills background CLI processes when the user switches apps or locks their screen. DroidWrap attaches an Android Foreground Service to keep the binary executing continuously.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={service.keepAwakeWakeLock}
                  onChange={(e) => onServiceUpdate({ keepAwakeWakeLock: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Acquire CPU WakeLock</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Prevents the mobile CPU from entering deep sleep mode when the phone screen is turned off.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-800 bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={service.autoStartOnBoot}
                  onChange={(e) => onServiceUpdate({ autoStartOnBoot: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Auto-Start on Device Boot</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Registers a <code>RECEIVE_BOOT_COMPLETED</code> receiver so the binary daemon automatically launches when the phone restarts.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Persistent Notification Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Notification Bar Appearance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={service.notificationTitle}
                  onChange={(e) => onServiceUpdate({ notificationTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notification Subtext
                </label>
                <input
                  type="text"
                  value={service.notificationBody}
                  onChange={(e) => onServiceUpdate({ notificationBody: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Termination Signal on Stop
              </label>
              <div className="flex items-center gap-3">
                {(['SIGTERM', 'SIGINT', 'SIGKILL'] as const).map((sig) => (
                  <label key={sig} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="killSignal"
                      checked={service.killSignal === sig}
                      onChange={() => onServiceUpdate({ killSignal: sig })}
                      className="text-emerald-500"
                    />
                    <span className="font-mono">{sig}</span>
                  </label>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                SIGTERM allows graceful socket cleanup. SIGKILL forcefully halts the process immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
