export const REVEAL_FITS = ["cover", "contain", "fill", "none", "scale-down"] as const;
export const REVEAL_DIRECTIONS = ["nw", "n", "ne", "w", "center", "e", "sw", "s", "se"] as const;
export type RevealFit = typeof REVEAL_FITS[number];
export type RevealDirection = typeof REVEAL_DIRECTIONS[number];

const REVEAL_POSTER = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#31401c"/><stop offset="0.48" stop-color="#6f8f32"/><stop offset="1" stop-color="#d7ef63"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><ellipse cx="400" cy="392" rx="268" ry="86" fill="#f4f7ea"/><ellipse cx="400" cy="412" rx="214" ry="34" fill="#171b12"/><circle cx="262" cy="312" r="84" fill="#e8f78a"/><circle cx="548" cy="286" r="48" fill="#243018"/></svg>`;
export const DEFAULT_REVEAL_IMAGE = "data:image/svg+xml," + encodeURIComponent(REVEAL_POSTER);

export function revealCount(value: unknown, fallback: number) {
  const next = Math.round(Number(value));
  return Number.isFinite(next) ? Math.min(12, Math.max(1, next)) : fallback;
}

export function revealFit(value: unknown): RevealFit {
  return REVEAL_FITS.includes(value as RevealFit) ? value as RevealFit : "fill";
}

const REVEAL_DIRECTION_ALIASES: Record<string, RevealDirection> = { down: "s", up: "n", left: "w", right: "e" };

export function revealDirection(value: unknown): RevealDirection {
  const named = REVEAL_DIRECTION_ALIASES[String(value)] ?? value;
  return REVEAL_DIRECTIONS.includes(named as RevealDirection) ? named as RevealDirection : "n";
}

export function revealSpan(direction: RevealDirection, columns: number, rows: number) {
  if (direction === "n" || direction === "s") return rows;
  if (direction === "w" || direction === "e") return columns;
  if (direction === "center") return Math.round((Math.max(columns, rows) - 1) / 2) + 1;
  return columns + rows - 1;
}

export function revealIndex(direction: RevealDirection, x: number, y: number, columns: number, rows: number) {
  if (direction === "n") return rows - 1 - y;
  if (direction === "s") return y;
  if (direction === "w") return columns - 1 - x;
  if (direction === "e") return x;
  if (direction === "center") {
    const dx = Math.abs(x - (columns - 1) / 2);
    const dy = Math.abs(y - (rows - 1) / 2);
    return Math.round(Math.max(dx, dy));
  }
  const originX = direction.endsWith("w") ? columns - 1 : 0;
  const originY = direction.startsWith("n") ? rows - 1 : 0;
  return Math.abs(x - originX) + Math.abs(y - originY);
}

export function revealImage(value: unknown) {
  const image = typeof value === "string" ? value : "";
  if (image.length > 0 && image.length <= 1_500_000 && /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/]+={0,2}$/i.test(image)) return image;
  return DEFAULT_REVEAL_IMAGE;
}

export function revealStep(count: number) {
  return Math.max(70, Math.min(160, Math.round(900 / Math.max(1, count))));
}
