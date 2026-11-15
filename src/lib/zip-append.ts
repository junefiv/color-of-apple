// ZIP pieces that run in the browser too: the CRC every entry needs, and adding stored (uncompressed)
// files to a finished archive. Code exports come back from the server without the user's images,
// which the browser already holds, so they are added here instead of being uploaded.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// DOS date/time fields used by every entry.
export function dosStamp(now: Date) {
  return {
    time: (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2),
    date: ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate(),
  };
}

export type ZipHeader = { name: Uint8Array; crc: number; packedSize: number; size: number; method: 0 | 8; offset: number; time: number; date: number };

export function localHeader(h: ZipHeader): Uint8Array {
  const local = new Uint8Array(30 + h.name.length);
  const v = new DataView(local.buffer);
  v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, h.method, true);
  v.setUint16(10, h.time, true); v.setUint16(12, h.date, true); v.setUint32(14, h.crc, true);
  v.setUint32(18, h.packedSize, true); v.setUint32(22, h.size, true); v.setUint16(26, h.name.length, true);
  local.set(h.name, 30);
  return local;
}

export function centralHeader(h: ZipHeader): Uint8Array {
  const central = new Uint8Array(46 + h.name.length);
  const v = new DataView(central.buffer);
  v.setUint32(0, 0x02014b50, true); v.setUint16(4, 20, true); v.setUint16(6, 20, true); v.setUint16(8, 0x0800, true); v.setUint16(10, h.method, true);
  v.setUint16(12, h.time, true); v.setUint16(14, h.date, true); v.setUint32(16, h.crc, true);
  v.setUint32(20, h.packedSize, true); v.setUint32(24, h.size, true); v.setUint16(28, h.name.length, true);
  v.setUint32(42, h.offset, true);
  central.set(h.name, 46);
  return central;
}

export function endRecord(count: number, centralSize: number, centralOffset: number): Uint8Array {
  const end = new Uint8Array(22);
  const v = new DataView(end.buffer);
  v.setUint32(0, 0x06054b50, true); v.setUint16(8, count, true); v.setUint16(10, count, true);
  v.setUint32(12, centralSize, true); v.setUint32(16, centralOffset, true);
  return end;
}

const concat = (parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
};

// New files go after the existing ones and the central directory is rewritten after them. Images
// are already compressed, so they are stored as they are.
export function appendToZip(zip: Uint8Array, files: { path: string; data: Uint8Array }[], now = new Date()): Uint8Array {
  if (!files.length) return zip;
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  let endAt = zip.length - 22;
  while (endAt >= 0 && view.getUint32(endAt, true) !== 0x06054b50) endAt--;
  if (endAt < 0) throw new Error("not a zip archive");
  const count = view.getUint16(endAt + 10, true), centralSize = view.getUint32(endAt + 12, true), centralOffset = view.getUint32(endAt + 16, true);
  const { time, date } = dosStamp(now);
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [], centrals: Uint8Array[] = [];
  let offset = centralOffset;
  for (const file of files) {
    const h: ZipHeader = { name: encoder.encode(file.path), crc: crc32(file.data), packedSize: file.data.length, size: file.data.length, method: 0, offset, time, date };
    const local = localHeader(h);
    locals.push(local, file.data); centrals.push(centralHeader(h));
    offset += local.length + file.data.length;
  }
  const oldCentral = zip.subarray(centralOffset, centralOffset + centralSize);
  const newCentralSize = centralSize + centrals.reduce((sum, c) => sum + c.length, 0);
  return concat([zip.subarray(0, centralOffset), ...locals, oldCentral, ...centrals, endRecord(count + files.length, newCentralSize, offset)]);
}

export function dataUrlBytes(src: string): Uint8Array {
  const base64 = src.slice(src.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
