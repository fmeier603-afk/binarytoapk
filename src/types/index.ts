export type BinaryArchitecture = 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'x86' | 'universal' | 'unknown';

export interface ElfMetadata {
  isElf: boolean;
  bitness: 32 | 64 | null;
  endian: 'little' | 'big' | null;
  architecture: BinaryArchitecture;
  machineName: string;
  isPie: boolean; // Android 5.0+ requires Position Independent Executable
  entryPointHex: string;
  fileSizeBytes: number;
  sha256Hex?: string;
}

export interface BinaryConfig {
  name: string;
  fileName: string;
  fileData?: Uint8Array;
  fileSizeFormatted: string;
  elfInfo: ElfMetadata;
  defaultArgs: string;
  envVariables: { key: string; value: string }[];
  workingDir: string;
  listeningPort?: number;
  description: string;
  isPreset?: boolean;
}

export interface GuiThemeConfig {
  style: 'material' | 'terminal' | 'minimal' | 'industrial';
  primaryColor: string;
  startBtnLabel: string;
  stopBtnLabel: string;
  restartBtnLabel: string;
  showRestartBtn: boolean;
  showClearLogsBtn: boolean;
  showPortPreview: boolean;
  enableArgEditing: boolean;
  autoScrollLogs: boolean;
  fontSize: 'xs' | 'sm' | 'base';
}

export interface AndroidServiceConfig {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  appIconId: string;
  keepAwakeWakeLock: boolean;
  autoStartOnBoot: boolean;
  killSignal: 'SIGTERM' | 'SIGKILL' | 'SIGINT';
  notificationTitle: string;
  notificationBody: string;
  notificationChannel: string;
}

export interface LogLine {
  id: string;
  timestamp: string;
  type: 'stdout' | 'stderr' | 'system';
  message: string;
}

export type ProcessStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
