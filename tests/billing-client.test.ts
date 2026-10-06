// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
import { openProCheckout, visitCustomerPortal } from "@/lib/billing/client";

const sdk = vi.hoisted(() => ({ initialize: vi.fn(), open: vi.fn(), callback: null as ((event: unknown) => void) | null }));
vi.mock("@paddle/paddle-js", () => ({ initializePaddle: sdk.initialize }));
const transactionId = `txn_${"a".repeat(26)}`;
const user = { getIdToken: vi.fn().mockResolvedValue("firebase-token") } as unknown as User;
const config = { enabled: true, environment: "sandbox" as const, clientToken: "test_public", amount: 990 as const, currency: "KRW" as const };
const paid = { environment: "sandbox", plan: "pro", hasSubscription: true, subscriptionStatus: "active", paidThrough: "2026-11-06T00:00:00Z", cancelAt: null, paymentStatus: "completed" };
const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks(); sdk.callback = null; vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ transactionId }) });
  sdk.initialize.mockImplementation(async (options) => { sdk.callback = options.eventCallback; return { Checkout: { open: sdk.open } }; });
});
afterEach(() => vi.unstubAllGlobals());

describe("checkout browser flow", () => {
  it("uses the authenticated server-created transaction instead of accepting a browser price", async () => {
    const complete = vi.fn();
    await openProCheckout({ user, config, locale: "ko", onPhase: vi.fn(), onComplete: complete, onError: vi.fn() });
    expect(fetchMock).toHaveBeenCalledWith("/api/billing/checkout", expect.objectContaining({
      method: "POST", body: "{}", headers: expect.objectContaining({ Authorization: "Bearer firebase-token" }),
    }));
    expect(sdk.open).toHaveBeenCalledWith(expect.objectContaining({ transactionId }));
    expect(complete).not.toHaveBeenCalled();
    sdk.callback!({ name: "checkout.completed", data: { transaction_id: "foreign-transaction" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(complete).not.toHaveBeenCalled();
  });
  it("waits for server confirmation after the provider's completed callback", async () => {
    const complete = vi.fn(); const phases = vi.fn();
    await openProCheckout({ user, config, locale: "en", onPhase: phases, onComplete: complete, onError: vi.fn() });
    fetchMock.mockResolvedValue({ ok: true, json: async () => paid });
    sdk.callback!({ name: "checkout.completed", data: { transaction_id: transactionId } });
    await vi.waitFor(() => expect(complete).toHaveBeenCalledWith(paid));
    expect(fetchMock).toHaveBeenLastCalledWith("/api/billing/confirm", expect.objectContaining({ body: JSON.stringify({ transactionId }) }));
    expect(phases).toHaveBeenCalledWith("confirming");
    const count = fetchMock.mock.calls.length;
    sdk.callback!({ name: "checkout.completed", data: { transaction_id: transactionId } });
    expect(fetchMock).toHaveBeenCalledTimes(count);
  });
  it("closing checkout does not grant access or start confirmation", async () => {
    const phases = vi.fn(); const complete = vi.fn();
    await openProCheckout({ user, config, locale: "ko", onPhase: phases, onComplete: complete, onError: vi.fn() });
    sdk.callback!({ name: "checkout.closed" });
    expect(phases).toHaveBeenLastCalledWith("idle");
    expect(complete).not.toHaveBeenCalled(); expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("fails before loading the SDK when payments are not configured", async () => {
    await expect(openProCheckout({ user, config: { ...config, enabled: false }, locale: "ko", onPhase: vi.fn(), onComplete: vi.fn(), onError: vi.fn() })).rejects.toThrow("billing_unavailable");
    expect(sdk.initialize).not.toHaveBeenCalled();
  });
  it("does not redirect to a portal on an unrelated or insecure domain", () => {
    expect(() => visitCustomerPortal("https://paddle.com.evil.example/session")).toThrow("invalid_portal_url");
    expect(() => visitCustomerPortal("http://customer-portal.paddle.com/session")).toThrow("invalid_portal_url");
  });
});
