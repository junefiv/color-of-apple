import type { BillingConfiguration, BillingEnvironment } from "../types";

export class BillingError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}

export function billingEnvironment(): BillingEnvironment {
  const value = process.env.PADDLE_ENVIRONMENT ?? "sandbox";
  if (value !== "sandbox" && value !== "production") throw new BillingError("billing_unavailable", 503);
  return value;
}

export function billingConfig() {
  const environment = billingEnvironment();
  const apiKey = process.env.PADDLE_API_KEY ?? "";
  const clientToken = process.env.PADDLE_CLIENT_TOKEN ?? "";
  const priceId = process.env.PADDLE_PRO_MONTHLY_PRICE_ID ?? "";
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? "";
  const origin = process.env.BILLING_APP_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:43123");
  const keyPrefix = environment === "sandbox" ? "pdl_sdbx_apikey_" : "pdl_live_apikey_";
  const tokenPrefix = environment === "sandbox" ? "test_" : "live_";
  let validOrigin = false;
  try {
    const url = new URL(origin);
    validOrigin = url.origin === origin && (url.protocol === "https:"
      || (environment === "sandbox" && ["localhost", "127.0.0.1"].includes(url.hostname)));
  } catch { /* An incomplete configuration must not enable checkout. */ }
  const liveApproved = environment === "sandbox" || (process.env.PADDLE_LIVE_ENABLED === "true"
    && !!process.env.BILLING_OPERATOR_NAME && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.BILLING_SUPPORT_EMAIL ?? ""));
  const enabled = liveApproved && validOrigin && apiKey.startsWith(keyPrefix)
    && clientToken.startsWith(tokenPrefix) && /^pri_[a-z0-9]{26}$/.test(priceId) && !!webhookSecret;
  return { environment, apiKey, clientToken, priceId, webhookSecret, origin, enabled };
}

export function requireBillingConfig() {
  const config = billingConfig();
  if (!config.enabled) throw new BillingError("billing_unavailable", 503);
  return config;
}

export function publicBillingConfig(): BillingConfiguration {
  const config = billingConfig();
  return { enabled: config.enabled, environment: config.environment,
    clientToken: config.enabled ? config.clientToken : null, amount: 990, currency: "KRW" };
}
