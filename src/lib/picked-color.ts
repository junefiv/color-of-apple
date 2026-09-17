export const FALLBACK_HEX = "#161619";

export function isHexColor(value: string) {
  return /^#([0-9A-F]{6}|[0-9A-F]{8})$/i.test(value.trim());
}

export function normalizeHex(value: string) {
  const trimmed = value.trim().toUpperCase();
  if (/^#([0-9A-F]{3})$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return trimmed;
}
