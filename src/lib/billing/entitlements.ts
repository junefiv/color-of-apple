import type { PaidTransaction, SubscriptionState } from "./types";

// Provider snapshots, rather than event arrival order, are the source of truth.
export function mergeSubscriptionState(
  previous: SubscriptionState | null,
  incoming: SubscriptionState,
  payment: PaidTransaction | null,
): SubscriptionState {
  const state = previous && previous.providerUpdatedAt > incoming.providerUpdatedAt
    ? { ...previous }
    : { ...incoming, paidThrough: previous?.paidThrough ?? null,
      lastTransactionId: previous?.lastTransactionId ?? null,
      transactionUpdatedAt: previous?.transactionUpdatedAt ?? null,
      paymentRevoked: previous?.paymentRevoked ?? false };
  if (payment) {
    const newerPeriod = !state.paidThrough || payment.paidThrough > state.paidThrough;
    const samePayment = state.lastTransactionId === payment.id;
    const newerSnapshot = !state.transactionUpdatedAt || payment.updatedAt >= state.transactionUpdatedAt;
    if (newerPeriod || (samePayment && newerSnapshot)) {
      state.paidThrough = payment.paidThrough;
      state.lastTransactionId = payment.id;
      state.transactionUpdatedAt = payment.updatedAt;
      state.paymentRevoked = payment.revoked;
    }
  }
  return state;
}

export function entitlementExpiry(state: SubscriptionState | null): string | null {
  if (!state || !["active", "past_due"].includes(state.status)
    || state.paymentRevoked || !state.paidThrough) return null;
  return state.cancelAt && state.cancelAt < state.paidThrough ? state.cancelAt : state.paidThrough;
}

export function subscriptionHasPro(state: SubscriptionState | null, now = Date.now()): boolean {
  const expiry = entitlementExpiry(state);
  return expiry !== null && Date.parse(expiry) > now;
}
