export const FREE_PROJECT_LIMIT = 5;

export type Plan = "free" | "pro";

export function effectiveProfilePlan(value: { plan?: unknown; proExpiresAt?: unknown }, now = Date.now()): Plan {
  if (value.plan !== "pro") return "free";
  // Preserve existing administrator-assigned Pro accounts without a billing expiry.
  if (!("proExpiresAt" in value)) return "pro";
  const expiry = value.proExpiresAt as { toMillis?: () => number } | null;
  return expiry && typeof expiry.toMillis === "function" && expiry.toMillis() > now ? "pro" : "free";
}
