import { deflateRawSync } from "node:zlib";
import { centralHeader, crc32, dosStamp, endRecord, localHeader } from "@/lib/zip-append";

// Minimal ZIP writer (deflate, no zip64) for export bundles; keeps the server free of an archive dependency.
export { crc32 };

export type ZipEntry = { path: string; data: Uint8Array | string };

export function createZip(entries: ZipEntry[], now = new Date()): Uint8Array {
  const encoder = new TextEncoder();
  const { time, date } = dosStamp(now);
  const locals: Uint8Array[] = [], centrals: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const raw = typeof entry.data === "string" ? encoder.encode(entry.data) : entry.data;
    const packed = new Uint8Array(deflateRawSync(raw));
    const h = { name: encoder.encode(entry.path), crc: crc32(raw), packedSize: packed.length, size: raw.length, method: 8 as const, offset, time, date };
    const local = localHeader(h);
    locals.push(local, packed); centrals.push(centralHeader(h));
    offset += local.length + packed.length;
  }
  const centralSize = centrals.reduce((sum, c) => sum + c.length, 0);
  const end = endRecord(entries.length, centralSize, offset);
  const out = new Uint8Array(offset + centralSize + end.length);
  let at = 0;
  for (const part of [...locals, ...centrals, end]) { out.set(part, at); at += part.length; }
  return out;
}
