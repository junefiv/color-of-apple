// Small guards shared by the builder component validators (stored layouts are untrusted JSON).
export const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max;
export const oneOf = (value: unknown, allowed: readonly string[]) => typeof value === "string" && allowed.includes(value);
export const int = (value: unknown, min: number, max: number) => Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
export const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
export const listOf = (value: unknown, max: number, check: (item: unknown) => boolean, min = 0) => Array.isArray(value) && value.length >= min && value.length <= max && value.every(check);
