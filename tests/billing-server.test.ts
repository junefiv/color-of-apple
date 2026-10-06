import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import * as provider from "@/lib/billing/server/paddle";
import { applySubscription, claimCheckout, resolveSubscriptionOwner } from "@/lib/billing/server/store";
import { confirmProTransaction, createProCheckout } from "@/lib/billing/server/service";
import { POST as checkout } from "@/app/api/billing/checkout/route";
import { POST as webhook } from "@/app/api/billing/webhook/route";
import type { SubscriptionState } from "@/lib/billing/types";

const memory = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), writes: [] as string[], verify: vi.fn(), queue: Promise.resolve() as Promise<unknown> }));
vi.mock("@/lib/firebase/admin", () => {
  const ref = (path: string): unknown => ({ path, collection: (name: string) => ref(`${path}/${name}`), doc: (id: string) => ref(`${path}/${id}`),
    get: async () => ({ exists: memory.docs.has(path), data: () => memory.docs.get(path) ? { ...memory.docs.get(path) } : undefined }) });
  return {
    getFirebaseAdminAuth: () => ({ verifyIdToken: memory.verify }),
    getFirebaseAdminDb: () => ({ collection: (name: string) => ref(name), runTransaction: (callback: (transaction: unknown) => Promise<unknown>) => {
      const result = memory.queue.then(() => callback({
        get: (reference: { get: () => unknown }) => reference.get(),
        set: (reference: { path: string }, value: Record<string, unknown>, options?: { merge: boolean }) => {
          memory.writes.push(reference.path);
          memory.docs.set(reference.path, options?.merge ? { ...memory.docs.get(reference.path), ...value } : value);
        },
      }));
      memory.queue = result.catch(() => undefined);
      return result;
    } }),
  };
});

const priceId = `pri_${"a".repeat(26)}`;
const txnId = `txn_${"b".repeat(26)}`;
const state: SubscriptionState = { id: "sub-alice", uid: "alice", customerId: "customer-alice", status: "active",
  priceId, providerUpdatedAt: "2026-10-06T00:00:00Z", checkoutAttemptId: "attempt-alice", cancelAt: null,
  paidThrough: null, lastTransactionId: null, transactionUpdatedAt: null, paymentRevoked: false };
const payment = { id: txnId, updatedAt: state.providerUpdatedAt, paidThrough: "2026-11-06T00:00:00Z", revoked: false };
const accountPath = (env = "sandbox") => `billing/${env}/accounts/alice`;
const seed = (env = "sandbox") => {
  memory.docs.set("users/alice", { plan: "free", displayName: "Alice" });
  memory.docs.set(accountPath(env), { customerId: state.customerId, checkoutAttemptId: state.checkoutAttemptId });
  memory.docs.set(`billing/${env}/customers/${state.customerId}`, { uid: "alice" });
};

beforeEach(() => {
  memory.docs.clear(); memory.writes.length = 0; memory.verify.mockReset(); memory.queue = Promise.resolve();
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-06T01:00:00Z"));
  vi.stubEnv("PADDLE_ENVIRONMENT", "sandbox"); vi.stubEnv("PADDLE_API_KEY", "pdl_sdbx_apikey_fake");
  vi.stubEnv("PADDLE_CLIENT_TOKEN", "test_fake"); vi.stubEnv("PADDLE_WEBHOOK_SECRET", "test-secret");
  vi.stubEnv("PADDLE_PRO_MONTHLY_PRICE_ID", priceId); vi.stubEnv("BILLING_APP_URL", "http://localhost:43123");
  seed();
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("server-only ownership and access", () => {
  it("requires a verified Firebase token, not a browser-provided uid", async () => {
    expect((await checkout(new Request("http://localhost/api/billing/checkout", { method: "POST", body: JSON.stringify({ uid: "alice" }) }))).status).toBe(401);
    memory.verify.mockResolvedValue({ uid: "alice", email: "alice@example.com", email_verified: false });
    expect((await checkout(new Request("http://localhost/api/billing/checkout", { method: "POST", headers: { authorization: "Bearer fake" } }))).status).toBe(401);
    expect(memory.verify).toHaveBeenCalledWith("fake", true);
    expect(memory.writes).toHaveLength(0);
  });
  it("does not trust custom data without the server's customer and checkout bindings", async () => {
    expect(await resolveSubscriptionOwner(state.customerId, state.id, state.checkoutAttemptId)).toBe("alice");
    expect(await resolveSubscriptionOwner("foreign-customer", state.id, state.checkoutAttemptId)).toBeNull();
    expect(await resolveSubscriptionOwner(state.customerId, state.id, "forged-attempt")).toBeNull();
  });
  it("serializes concurrent checkout requests to avoid duplicate subscriptions", async () => {
    const results = await Promise.allSettled([claimCheckout("alice"), claimCheckout("alice")]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect(results.find(result => result.status === "rejected")).toMatchObject({ reason: { code: "checkout_in_progress" } });
  });
  it("never grants live Pro permissions for a sandbox payment", async () => {
    await applySubscription(state, payment);
    expect(memory.docs.get("users/alice")?.plan).toBe("free");
    expect(memory.writes.every(path => path.startsWith("billing/sandbox/"))).toBe(true);
    expect(memory.docs.get(accountPath())?.subscriptionId).toBe(state.id);
  });
  it("applies a verified production payment and deduplicates repeated events", async () => {
    vi.stubEnv("PADDLE_ENVIRONMENT", "production"); seed("production");
    const event = { id: "event-1", type: "transaction.completed", occurredAt: payment.updatedAt };
    expect(await applySubscription(state, payment, event)).toBe(true);
    expect(memory.docs.get("users/alice")?.plan).toBe("pro");
    const writes = memory.writes.length;
    expect(await applySubscription(state, payment, event)).toBe(false);
    expect(memory.writes).toHaveLength(writes);
  });
  it("does not let an old subscription overwrite a new subscription's access", async () => {
    vi.stubEnv("PADDLE_ENVIRONMENT", "production"); seed("production");
    memory.docs.set(accountPath("production"), { customerId: state.customerId, subscriptionId: "new-sub", checkoutAttemptId: "new-attempt" });
    memory.docs.set("users/alice", { plan: "pro" });
    await applySubscription({ ...state, status: "canceled" }, payment);
    expect(memory.docs.get("users/alice")?.plan).toBe("pro");
    expect(memory.docs.get(accountPath("production"))?.subscriptionId).toBe("new-sub");
  });
  it("rejects another customer's receipt, even if its transaction ID is known", async () => {
    const transactions = { get: vi.fn().mockResolvedValue({ customerId: "customer-bob", subscriptionId: "sub-bob" }) };
    vi.spyOn(provider, "getPaddle").mockReturnValue({ transactions } as unknown as Paddle);
    await expect(confirmProTransaction("alice", txnId)).rejects.toMatchObject({ code: "transaction_not_found" });
  });
  it("routes an existing subscription to the customer portal instead of creating another", async () => {
    memory.docs.set(accountPath(), { customerId: state.customerId, subscriptionId: state.id });
    const createTransaction = vi.fn();
    const portal = vi.fn().mockResolvedValue({ urls: { general: { overview: "https://sandbox-customer-portal.paddle.com/session" } } });
    vi.spyOn(provider, "getPaddle").mockReturnValue({
      prices: { get: vi.fn().mockResolvedValue({ status: "active", unitPrice: { amount: "990", currencyCode: "KRW" }, billingCycle: { interval: "month", frequency: 1 }, trialPeriod: null, taxMode: "internal", unitPriceOverrides: [] }) },
      subscriptions: { get: vi.fn().mockResolvedValue({ id: state.id, customerId: state.customerId, status: "active" }) },
      transactions: { create: createTransaction }, customerPortalSessions: { create: portal },
    } as unknown as Paddle);
    expect(await createProCheckout({ uid: "alice", email: "alice@example.com" })).toHaveProperty("portalUrl");
    expect(portal).toHaveBeenCalledWith(state.customerId, [state.id]);
    expect(createTransaction).not.toHaveBeenCalled();
  });
});

describe("real Paddle SDK signature verification at the webhook endpoint", () => {
  const body = JSON.stringify({ event_id: "evt-test", event_type: "test.event", occurred_at: "2026-10-06T00:00:00Z", data: {} });
  function request(payload: string, timestamp: number, signedBody = payload) {
    const h1 = createHmac("sha256", "test-secret").update(`${timestamp}:${signedBody}`).digest("hex");
    return new Request("http://localhost/api/billing/webhook", { method: "POST", body: payload, headers: { "paddle-signature": `ts=${timestamp};h1=${h1}` } });
  }
  beforeEach(() => { vi.spyOn(provider, "getPaddle").mockReturnValue(new Paddle("fake", { environment: Environment.sandbox })); });
  it("accepts a correctly signed notification", async () => {
    expect((await webhook(request(body, Math.floor(Date.now() / 1000)))).status).toBe(200);
  });
  it("rejects tampered raw bodies and expired signatures without writing access", async () => {
    expect((await webhook(request(body + " ", Math.floor(Date.now() / 1000), body))).status).toBe(400);
    expect((await webhook(request(body, Math.floor(Date.now() / 1000) - 60))).status).toBe(400);
    expect(memory.writes).toHaveLength(0);
  });
});
