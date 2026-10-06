import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Price, Transaction, Subscription } from "@paddle/paddle-node-sdk";
import { effectiveProfilePlan } from "@/lib/firebase/data";
import { entitlementExpiry, mergeSubscriptionState, subscriptionHasPro } from "@/lib/billing/entitlements";
import { assertProPrice, paidTransaction, subscriptionSnapshot } from "@/lib/billing/server/paddle";
import { publicBillingConfig } from "@/lib/billing/server/config";
import type { SubscriptionState } from "@/lib/billing/types";

const priceId = `pri_${"a".repeat(26)}`;
const base: SubscriptionState = { id: "sub-test", uid: "alice", customerId: "customer-alice", status: "active",
  priceId, providerUpdatedAt: "2026-10-06T00:00:00Z", checkoutAttemptId: "server-attempt", cancelAt: null,
  paidThrough: null, lastTransactionId: null, transactionUpdatedAt: null, paymentRevoked: false };
const payment = { id: "txn-test", paidThrough: "2026-11-06T00:00:00Z", updatedAt: "2026-10-06T00:00:00Z", revoked: false };
const price = { status: "active", unitPrice: { currencyCode: "KRW", amount: "990" },
  billingCycle: { interval: "month", frequency: 1 }, trialPeriod: null, taxMode: "internal", unitPriceOverrides: [] } as unknown as Price;
const receipt = { id: "txn-test", status: "completed", customerId: base.customerId, subscriptionId: base.id,
  items: [{ price: { id: priceId }, quantity: 1 }], billingPeriod: { endsAt: payment.paidThrough },
  updatedAt: payment.updatedAt, details: { totals: { total: "990" } }, adjustments: [] } as unknown as Transaction;

beforeEach(() => {
  vi.stubEnv("PADDLE_ENVIRONMENT", "sandbox"); vi.stubEnv("PADDLE_API_KEY", "pdl_sdbx_apikey_fake");
  vi.stubEnv("PADDLE_CLIENT_TOKEN", "test_fake"); vi.stubEnv("PADDLE_WEBHOOK_SECRET", "test-secret");
  vi.stubEnv("PADDLE_PRO_MONTHLY_PRICE_ID", priceId); vi.stubEnv("BILLING_APP_URL", "http://localhost:43123");
});
afterEach(() => vi.unstubAllEnvs());

describe("paid subscription access", () => {
  it("does not grant access for an active subscription without a completed receipt", () => {
    expect(subscriptionHasPro(base, Date.parse(payment.updatedAt))).toBe(false);
  });
  it("keeps access after scheduled cancellation until the paid period ends", () => {
    const state = mergeSubscriptionState(null, { ...base, cancelAt: payment.paidThrough }, payment);
    expect(subscriptionHasPro(state, Date.parse("2026-11-05T00:00:00Z"))).toBe(true);
    expect(subscriptionHasPro(state, Date.parse(payment.paidThrough))).toBe(false);
  });
  it.each(["canceled", "paused", "trialing"])("revokes access for %s", status => {
    expect(entitlementExpiry(mergeSubscriptionState(null, { ...base, status }, payment))).toBeNull();
  });
  it("does not extend a failed renewal past its paid period", () => {
    const state = mergeSubscriptionState(null, { ...base, status: "past_due" }, payment);
    expect(subscriptionHasPro(state, Date.parse("2026-11-07T00:00:00Z"))).toBe(false);
  });
  it("does not undo a cancellation with an older arriving event", () => {
    const canceled = mergeSubscriptionState(null, { ...base, status: "canceled", providerUpdatedAt: "2026-10-07T00:00:00Z" }, payment);
    expect(mergeSubscriptionState(canceled, base, payment).status).toBe("canceled");
  });
  it("does not undo a refund with an older payment snapshot", () => {
    const refunded = mergeSubscriptionState(null, base, { ...payment, revoked: true, updatedAt: "2026-10-07T00:00:00Z" });
    expect(mergeSubscriptionState(refunded, base, payment).paymentRevoked).toBe(true);
  });
  it("does not revoke a paid renewal when a previous month's refund arrives late", () => {
    const renewed = mergeSubscriptionState(null, base, { ...payment, id: "renewal", paidThrough: "2026-12-06T00:00:00Z" });
    expect(mergeSubscriptionState(renewed, base, { ...payment, revoked: true, updatedAt: "2026-11-07T00:00:00Z" }).paymentRevoked).toBe(false);
  });
  it("honors server expiry in profile data while preserving administrator-assigned Pro", () => {
    expect(effectiveProfilePlan({ plan: "pro", proExpiresAt: { toMillis: () => 1000 } }, 1000)).toBe("free");
    expect(effectiveProfilePlan({ plan: "pro", proExpiresAt: { toMillis: () => 1001 } }, 1000)).toBe("pro");
    expect(effectiveProfilePlan({ plan: "pro", proExpiresAt: null })).toBe("free");
    expect(effectiveProfilePlan({ plan: "pro" })).toBe("pro");
  });
});

describe("catalog and receipt validation", () => {
  it("accepts only the agreed monthly, tax-inclusive KRW 990 price", () => {
    expect(() => assertProPrice(price)).not.toThrow();
    for (const overrides of [{ unitPrice: { amount: "9900", currencyCode: "KRW" } }, { taxMode: "external" },
      { billingCycle: { interval: "year", frequency: 1 } }, { trialPeriod: { interval: "day", frequency: 7 } }]) {
      expect(() => assertProPrice({ ...price, ...overrides } as Price)).toThrow("price_configuration_invalid");
    }
  });
  it("rejects mismatched owners, prices, quantities and unsettled payments", () => {
    expect(paidTransaction(receipt, base.id, base.customerId)?.revoked).toBe(false);
    expect(paidTransaction(receipt, base.id, "someone-else")).toBeNull();
    expect(paidTransaction({ ...receipt, status: "paid" }, base.id, base.customerId)).toBeNull();
    expect(paidTransaction({ ...receipt, items: [{ price: { id: "other-price" }, quantity: 1 }] } as Transaction, base.id, base.customerId)).toBeNull();
    expect(() => subscriptionSnapshot({ ...base, items: [{ price: { id: priceId }, quantity: 2 }] } as unknown as Subscription, "alice")).toThrow("unsupported_subscription");
  });
  it("revokes full refunds and chargebacks but preserves partial refunds", () => {
    const adjustment = { action: "refund", status: "approved", transactionId: receipt.id, updatedAt: "2026-10-07T00:00:00Z", totals: { total: "990" } };
    const adjusted = (items: unknown[]) => paidTransaction({ ...receipt, adjustments: items } as Transaction, base.id, base.customerId)!;
    expect(adjusted([adjustment]).revoked).toBe(true);
    expect(adjusted([{ ...adjustment, totals: { total: "500" } }]).revoked).toBe(false);
    expect(adjusted([{ ...adjustment, action: "chargeback" }]).revoked).toBe(true);
    expect(adjusted([{ ...adjustment, status: "pending_approval" }]).revoked).toBe(false);
    expect(adjusted([adjustment]).updatedAt).toBe(adjustment.updatedAt);
  });
  it("keeps server secrets private and prevents mixed environments or accidental live activation", () => {
    expect(publicBillingConfig()).toEqual({ enabled: true, environment: "sandbox", clientToken: "test_fake", amount: 990, currency: "KRW" });
    vi.stubEnv("PADDLE_CLIENT_TOKEN", "live_fake"); expect(publicBillingConfig().enabled).toBe(false);
    vi.stubEnv("PADDLE_ENVIRONMENT", "production"); vi.stubEnv("PADDLE_API_KEY", "pdl_live_apikey_fake");
    vi.stubEnv("BILLING_APP_URL", "https://color-of-apple.vercel.app"); vi.stubEnv("PADDLE_LIVE_ENABLED", "false");
    expect(publicBillingConfig().enabled).toBe(false);
  });
});
