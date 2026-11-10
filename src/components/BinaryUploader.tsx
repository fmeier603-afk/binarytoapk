import React, { useRef, useState } from 'react';
import {
  Upload,
  Cpu,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
  Hash,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { BinaryConfig, ElfMetadata } from '../types';
import { formatBytes, parseElfHeader } from '../utils/elfParser';
import { SAMPLE_BINARIES } from '../utils/sampleBinaries';

interface BinaryUploaderProps {
  binary: BinaryConfig;
  onBinaryChange: (binary: BinaryConfig) => void;
  onSelectPreset: (preset: BinaryConfig) => void;
}

export const BinaryUploader: React.FC<BinaryUploaderProps> = ({
  binary,
  onBinaryChange,
  onSelectPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const elfInfo: ElfMetadata = await parseElfHeader(buffer);

      // Guess sensible app name from filename
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      onBinaryChange({
        name: cleanName || 'Native Daemon',
        fileName: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
        fileData: new Uint8Array(buffer),
        fileSizeFormatted: formatBytes(file.size),
        elfInfo,
        defaultArgs: binary.defaultArgs || '',
        envVariables: binary.envVariables || [],
        workingDir: '/data/user/0/app/files',
        listeningPort: binary.listeningPort,
        description: `Uploaded ${elfInfo.machineName} native binary executable.`,
        isPreset: false,
      });
    } catch (err) {
      console.error('Failed to parse binary:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          1. Select or Upload Executable Binary
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Upload any Linux/Android ELF executable, compiled native tool, or pick a pre-configured sample binary.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
          <Upload className="h-6 w-6 text-emerald-400" />
        </div>

        <div className="mt-4">
          <span className="text-sm font-semibold text-white">
            Click to upload binary
          </span>{' '}
          <span className="text-sm text-slate-400">or drag and drop</span>
          <p className="mt-1 text-xs text-slate-500">
            Accepts compiled ELF binaries (arm64-v8a, armeabi-v7a, x86_64), Go/Rust/C executables, or shell scripts
          </p>
        </div>

        {isProcessing && (
          <div className="mt-3 text-xs font-medium text-emerald-400 animate-pulse">
            Analyzing binary headers and ELF structure...
          </div>
        )}
      </div>

      {/* Preset Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or test with ready-to-use sample binaries
          </span>
          <span className="text-xs text-slate-500">No binary file at hand? Pick one below</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_BINARIES.map((preset) => {
            const isSelected = binary.fileName === preset.fileName && binary.isPreset;
            return (
              <button
                key={preset.fileName}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {preset.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {preset.description}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono text-emerald-300">{preset.fileName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{preset.fileSizeFormatted}</span>
                  {preset.listeningPort && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400 font-mono">Port :{preset.listeningPort}</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Binary Technical Inspection Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Binary Technical Inspection
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {binary.fileName}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div>
            <div className="text-xs text-slate-400">Architecture</div>
            <div className="text-sm font-semibold font-mono text-white mt-0.5">
              {binary.elfInfo.architecture}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">ELF Format</div>
            <div className="text-sm font-semibold font-mono text-white mt-0.5">
              {binary.elfInfo.bitness ? `${binary.elfInfo.bitness}-bit (${binary.elfInfo.endian})` : 'Script / Raw'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">PIE Security</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {binary.elfInfo.isPie ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-400">Android 5.0+ Valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-amber-400">Non-PIE Executable</span>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">File Size</div>
            <div className="text-sm font-semibold font-mono text-white mt-0.5">
              {binary.fileSizeFormatted}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-500">SHA-256:</span>
            <span className="font-mono text-slate-300 truncate">
              {binary.elfInfo.sha256Hex || 'Pending'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
            <Cpu className="w-3.5 h-3.5" />
            <span>Target ABI: lib/{binary.elfInfo.architecture === 'arm64-v8a' ? 'arm64-v8a' : 'universal'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
