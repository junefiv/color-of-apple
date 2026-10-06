import { Environment, Paddle, type Price, type Subscription, type Transaction } from "@paddle/paddle-node-sdk";
import type { PaidTransaction, SubscriptionState } from "../types";
import { BillingError, requireBillingConfig } from "./config";

export function getPaddle() {
  const config = requireBillingConfig();
  return new Paddle(config.apiKey, { environment: config.environment === "sandbox" ? Environment.sandbox : Environment.production });
}

export function assertProPrice(price: Price) {
  if (price.status !== "active" || price.unitPrice.currencyCode !== "KRW" || price.unitPrice.amount !== "990"
    || price.billingCycle?.interval !== "month" || price.billingCycle.frequency !== 1
    || price.trialPeriod !== null || price.taxMode !== "internal" || price.unitPriceOverrides.length > 0) {
    throw new BillingError("price_configuration_invalid", 503);
  }
}

export function subscriptionSnapshot(value: Subscription, uid: string): SubscriptionState {
  const { priceId } = requireBillingConfig();
  if (value.items.length !== 1 || value.items[0].price.id !== priceId || value.items[0].quantity !== 1) {
    throw new BillingError("unsupported_subscription", 422);
  }
  return { id: value.id, uid, customerId: value.customerId, status: value.status,
    priceId, providerUpdatedAt: value.updatedAt,
    checkoutAttemptId: typeof value.customData?.checkoutAttemptId === "string" ? value.customData.checkoutAttemptId : null,
    cancelAt: value.scheduledChange?.action === "cancel" ? value.scheduledChange.effectiveAt : null,
    paidThrough: null, lastTransactionId: null, transactionUpdatedAt: null, paymentRevoked: false };
}

export function paidTransaction(value: Transaction, subscriptionId: string, customerId: string): PaidTransaction | null {
  const { priceId } = requireBillingConfig();
  if (value.status !== "completed" || value.subscriptionId !== subscriptionId || value.customerId !== customerId
    || value.items.length !== 1 || value.items[0].price?.id !== priceId || value.items[0].quantity !== 1
    || !value.billingPeriod?.endsAt) return null;
  const approved = value.adjustments?.filter(item => item.status === "approved") ?? [];
  const reversed = new Set(approved.filter(item => item.action === "chargeback_reverse").map(item => item.transactionId));
  const chargeback = approved.some(item => item.action === "chargeback" && !reversed.has(item.transactionId));
  const refunded = approved.filter(item => item.action === "refund")
    .reduce((sum, item) => sum + Number(item.totals?.total ?? 0), 0);
  const total = Number(value.details?.totals?.total ?? 0);
  const updatedAt = (value.adjustments ?? []).reduce((latest, item) => item.updatedAt > latest ? item.updatedAt : latest, value.updatedAt);
  return { id: value.id, updatedAt, paidThrough: value.billingPeriod.endsAt,
    revoked: chargeback || (total > 0 && refunded >= total) };
}
