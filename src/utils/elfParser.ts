import { BinaryArchitecture, ElfMetadata } from '../types';

export async function parseElfHeader(buffer: ArrayBuffer): Promise<ElfMetadata> {
  const bytes = new Uint8Array(buffer);
  const fileSizeBytes = buffer.byteLength;

  // Compute SHA-256 hash
  let sha256Hex = '';
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    sha256Hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    sha256Hex = 'unavailable';
  }

  // Check magic bytes: 0x7F 'E' 'L' 'F'
  const isElf =
    bytes.length >= 4 &&
    bytes[0] === 0x7f &&
    bytes[1] === 0x45 &&
    bytes[2] === 0x4c &&
    bytes[3] === 0x46;

  // Check if it's a shell script #!/
  const isScript =
    bytes.length >= 2 &&
    bytes[0] === 0x23 && // '#'
    bytes[1] === 0x21; // '!'

  if (!isElf) {
    return {
      isElf: false,
      bitness: null,
      endian: null,
      architecture: isScript ? 'universal' : 'unknown',
      machineName: isScript ? 'Shell Script Executable (POSIX)' : 'Custom Binary / Raw Executable',
      isPie: true,
      entryPointHex: '0x00000000',
      fileSizeBytes,
      sha256Hex,
    };
  }

  const bitness: 32 | 64 = bytes[4] === 1 ? 32 : 64;
  const isLittleEndian = bytes[5] === 1;
  const endian = isLittleEndian ? 'little' : 'big';

  const view = new DataView(buffer);
  const e_type = view.getUint16(16, isLittleEndian); // 2 = ET_EXEC, 3 = ET_DYN (PIE)
  const isPie = e_type === 3; // On modern Android (Lollipop 5.0+), binaries must be PIE (ET_DYN)

  const e_machine = view.getUint16(18, isLittleEndian);
  let architecture: BinaryArchitecture = 'unknown';
  let machineName = `Unknown (e_machine: 0x${e_machine.toString(16)})`;

  switch (e_machine) {
    case 0xb7: // 183
      architecture = 'arm64-v8a';
      machineName = 'ARM64 (AArch64) - Standard Modern Android';
      break;
    case 0x28: // 40
      architecture = 'armeabi-v7a';
      machineName = 'ARMv7-A (32-bit ARM legacy)';
      break;
    case 0x3e: // 62
      architecture = 'x86_64';
      machineName = 'x86_64 (64-bit Intel/AMD Emulators & ChromeOS)';
      break;
    case 0x03: // 3
      architecture = 'x86';
      machineName = 'x86 (32-bit Emulator)';
      break;
    default:
      architecture = 'unknown';
      machineName = `Custom Architecture (0x${e_machine.toString(16)})`;
  }

  let entryPointHex = '0x00000000';
  try {
    if (bitness === 32) {
      const entry = view.getUint32(24, isLittleEndian);
      entryPointHex = '0x' + entry.toString(16).padStart(8, '0');
    } else {
      const entryLow = view.getUint32(24, isLittleEndian);
      const entryHigh = view.getUint32(28, isLittleEndian);
      const entryVal = isLittleEndian
        ? (BigInt(entryHigh) << 32n) | BigInt(entryLow)
        : (BigInt(entryLow) << 32n) | BigInt(entryHigh);
      entryPointHex = '0x' + entryVal.toString(16).padStart(12, '0');
    }
  } catch {
    entryPointHex = '0x00000000';
  }

  return {
    isElf: true,
    bitness,
    endian,
    architecture,
    machineName,
    isPie,
    entryPointHex,
    fileSizeBytes,
    sha256Hex,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
