"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { initializePaddle } from "@paddle/paddle-js";
import type { BillingConfiguration, BillingStatus } from "./types";
import type { Locale } from "@/lib/copy";

export const UNAVAILABLE_BILLING: BillingConfiguration = {
  enabled: false, environment: "sandbox", clientToken: null, amount: 990, currency: "KRW",
};

export function useBillingConfiguration(active = true) {
  const [config, setConfig] = useState(UNAVAILABLE_BILLING);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    void fetch("/api/billing/config", { signal: controller.signal, cache: "no-store" })
      .then(response => response.ok ? response.json() : UNAVAILABLE_BILLING)
      .then(value => { if (!controller.signal.aborted) setConfig(value); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [active]);
  return config;
}

export async function billingRequest<T>(path: string, user: User, body?: unknown): Promise<T> {
  const response = await fetch(`/api/billing/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${await user.getIdToken()}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const value = await response.json();
  if (!response.ok) throw new Error(typeof value.error === "string" ? value.error : "billing_request_failed");
  return value as T;
}

export function billingErrorMessage(error: unknown, locale: Locale) {
  const code = error instanceof Error ? error.message : "";
  const isKo = locale === "ko";
  if (["checkout_processing", "checkout_in_progress"].includes(code)) {
    return isKo ? "이전 결제를 확인하고 있어요. 잠시 후 다시 확인해 주세요." : "Your previous payment is being checked. Please try again shortly.";
  }
  if (code === "sign_in_required") return isKo ? "다시 로그인한 후 결제해 주세요." : "Please sign in again before checking out.";
  if (code === "billing_unavailable" || code === "price_configuration_invalid") {
    return isKo ? "결제 설정을 준비하고 있어요. 잠시 후 다시 시도해 주세요." : "Payments are being set up. Please try again later.";
  }
  return isKo ? "결제를 완료하지 못했어요. 구독 상태를 확인한 후 다시 시도해 주세요." : "Could not finish checkout. Check your subscription before trying again.";
}

export function visitCustomerPortal(url: string) {
  const target = new URL(url);
  if (target.protocol !== "https:" || !target.hostname.endsWith(".paddle.com")) throw new Error("invalid_portal_url");
  window.location.assign(target.href);
}

export type CheckoutPhase = "idle" | "opening" | "checkout" | "confirming";

export async function confirmCheckoutPayment(user: User, transactionId: string): Promise<BillingStatus & { paymentStatus: string }> {
  let result: BillingStatus & { paymentStatus: string };
  for (let attempt = 0; ; attempt++) {
    result = await billingRequest("confirm", user, { transactionId });
    if (result.plan === "pro" || ["canceled", "past_due"].includes(result.paymentStatus) || attempt >= 9) return result;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

export async function openProCheckout({ user, config, locale, onPhase, onComplete, onError, transactionId: providedTransactionId }: {
  user: User;
  config: BillingConfiguration;
  locale: Locale;
  onPhase: (phase: CheckoutPhase) => void;
  onComplete: (status: BillingStatus) => void;
  onError: (error: unknown) => void;
  transactionId?: string;
}) {
  if (!config.enabled || !config.clientToken) throw new Error("billing_unavailable");
  onPhase("opening");
  const result = providedTransactionId ? { transactionId: providedTransactionId }
    : await billingRequest<{ transactionId?: string; portalUrl?: string }>("checkout", user, {});
  if (result.portalUrl) { visitCustomerPortal(result.portalUrl); onPhase("idle"); return; }
  const transactionId = result.transactionId;
  if (!transactionId) throw new Error("billing_request_failed");
  let confirmed = false;
  const paddle = await initializePaddle({
    token: config.clientToken, environment: config.environment,
    eventCallback(event) {
      if (event.name === "checkout.closed" && !confirmed) onPhase("idle");
      if (event.name !== "checkout.completed" || confirmed || event.data?.transaction_id !== transactionId) return;
      confirmed = true;
      onPhase("confirming");
      void confirmCheckoutPayment(user, transactionId).then(onComplete).catch(onError).finally(() => onPhase("idle"));
    },
  });
  if (!paddle) throw new Error("billing_request_failed");
  onPhase("checkout");
  paddle.Checkout.open({ transactionId, settings: { displayMode: "overlay", locale, allowLogout: false,
    showAddDiscounts: false, showAddTaxId: false,
    successUrl: `${window.location.origin}/billing/checkout?transaction_id=${transactionId}` } });
}
