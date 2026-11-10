import React from 'react';
import { Package, Download, Smartphone, Layers, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'builder' | 'emulator' | 'export' | 'guide';
  onSelectTab: (tab: 'builder' | 'emulator' | 'export' | 'guide') => void;
  onOpenExport: () => void;
  appName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenExport,
  appName,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100">
      {/* Zone 1: Brand Wordmark (Single text element wordmark, zero-pill) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
          <Smartphone className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          DroidWrap Studio
        </span>
      </div>

      {/* Zone 2: 4 single-line nav links with clean hover states */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectTab('builder')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'builder'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : ''
          }`}
        >
          Binary & GUI Config
        </button>
        <button
          onClick={() => onSelectTab('emulator')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'emulator'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : ''
          }`}
        >
          Android Simulator
        </button>
        <button
          onClick={() => onSelectTab('export')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'export'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : ''
          }`}
        >
          APK & Packaging
        </button>
        <button
          onClick={() => onSelectTab('guide')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'guide'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : ''
          }`}
        >
          Android Native Guide
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Build APK</span>
        </button>
      </div>
    </header>
  );
};
