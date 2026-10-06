import { randomUUID } from "node:crypto";
import { BillingError, requireBillingConfig } from "./config";
import { assertProPrice, getPaddle, paidTransaction, subscriptionSnapshot } from "./paddle";
import { applySubscription, billingCollection, claimCheckout, getBillingAccount, getSubscriptionState,
  releaseCheckout, resolveSubscriptionOwner, updateCheckout } from "./store";
import { subscriptionHasPro } from "../entitlements";
import type { BillingStatus } from "../types";

export async function reconcileSubscription(id: string, transactionId?: string, event?: { id: string; type: string; occurredAt: string }) {
  const paddle = getPaddle();
  const subscription = await paddle.subscriptions.get(id);
  const uid = await resolveSubscriptionOwner(subscription.customerId, id, subscription.customData?.checkoutAttemptId);
  if (!uid) return false;
  const previous = await getSubscriptionState(id);
  let receipt;
  if (transactionId) receipt = await paddle.transactions.get(transactionId, { include: ["adjustment"] });
  else {
    // Repair a missed renewal notification from the provider's completed receipts.
    const receipts = await paddle.transactions.list({ subscriptionId: [id], customerId: [subscription.customerId],
      status: ["completed"], orderBy: "created_at[DESC]", perPage: 10, include: ["adjustment"] }).next();
    receipt = receipts.find(value => paidTransaction(value, id, subscription.customerId));
    if (!receipt && previous?.lastTransactionId) receipt = await paddle.transactions.get(previous.lastTransactionId, { include: ["adjustment"] });
  }
  const payment = receipt ? paidTransaction(receipt, id, subscription.customerId) : null;
  await applySubscription(subscriptionSnapshot(subscription, uid), payment, event);
  return true;
}

export async function createProCheckout(identity: { uid: string; email: string }) {
  const config = requireBillingConfig();
  const paddle = getPaddle();
  assertProPrice(await paddle.prices.get(config.priceId));
  const { account, leaseId } = await claimCheckout(identity.uid);
  try {
    if (account.subscriptionId) {
      const subscription = await paddle.subscriptions.get(account.subscriptionId);
      if (subscription.customerId !== account.customerId) throw new BillingError("subscription_owner_mismatch", 422);
      if (subscription.status !== "canceled") {
        const session = await paddle.customerPortalSessions.create(subscription.customerId, [subscription.id]);
        return { portalUrl: session.urls.general.overview };
      }
    }
    if (account.checkoutTransactionId) {
      const existing = await paddle.transactions.get(account.checkoutTransactionId);
      if (existing.customerId !== account.customerId) throw new BillingError("subscription_owner_mismatch", 422);
      if (["draft", "ready"].includes(existing.status)) {
        if (existing.items.length !== 1 || existing.items[0].price?.id !== config.priceId
          || existing.items[0].quantity !== 1 || existing.currencyCode !== "KRW" || existing.discountId) {
          throw new BillingError("price_configuration_invalid", 503);
        }
        return { transactionId: existing.id };
      }
      if (["billed", "paid", "past_due"].includes(existing.status)) throw new BillingError("checkout_processing", 409);
      if (existing.status === "completed" && existing.subscriptionId) {
        await reconcileSubscription(existing.subscriptionId, existing.id);
        const sub = await paddle.subscriptions.get(existing.subscriptionId);
        if (sub.status !== "canceled") {
          const session = await paddle.customerPortalSessions.create(sub.customerId, [sub.id]);
          return { portalUrl: session.urls.general.overview };
        }
      }
    }
    let customerId = account.customerId;
    if (!customerId) {
      const customer = await paddle.customers.create({ email: identity.email, customData: { firebaseUid: identity.uid } });
      customerId = customer.id;
      await updateCheckout(identity.uid, leaseId, { customerId });
    }
    const attemptId = randomUUID();
    await updateCheckout(identity.uid, leaseId, { checkoutAttemptId: attemptId });
    const transaction = await paddle.transactions.create({
      items: [{ priceId: config.priceId, quantity: 1 }], customerId,
      currencyCode: "KRW", collectionMode: "automatic",
      customData: { checkoutAttemptId: attemptId }, checkout: { url: `${config.origin}/billing/checkout` },
    });
    await updateCheckout(identity.uid, leaseId, { checkoutTransactionId: transaction.id });
    return { transactionId: transaction.id };
  } finally { await releaseCheckout(identity.uid, leaseId); }
}

export async function createProPortal(uid: string) {
  const account = await getBillingAccount(uid);
  if (!account.customerId || !account.subscriptionId) throw new BillingError("subscription_not_found", 404);
  const subscription = await getPaddle().subscriptions.get(account.subscriptionId);
  if (subscription.customerId !== account.customerId) throw new BillingError("subscription_owner_mismatch", 422);
  const session = await getPaddle().customerPortalSessions.create(account.customerId, [subscription.id]);
  return { url: session.urls.general.overview };
}

export async function getProStatus(uid: string, reconcile = false): Promise<BillingStatus> {
  const { environment } = requireBillingConfig();
  const account = await getBillingAccount(uid);
  if (reconcile && account.subscriptionId) await reconcileSubscription(account.subscriptionId);
  const state = await getSubscriptionState(account.subscriptionId);
  if (state && state.uid !== uid) throw new BillingError("subscription_owner_mismatch", 422);
  return { environment, subscriptionStatus: state?.status ?? null,
    plan: subscriptionHasPro(state) ? "pro" : "free", paidThrough: state?.paidThrough ?? null,
    cancelAt: state?.cancelAt ?? null, hasSubscription: !!state };
}

export async function confirmProTransaction(uid: string, id: string) {
  if (!/^txn_[a-z0-9]{26}$/.test(id)) throw new BillingError("invalid_transaction", 400);
  const account = await getBillingAccount(uid);
  // The browser's transaction ID alone is never sufficient to claim a payment.
  const value = await getPaddle().transactions.get(id);
  if (value.customerId !== account.customerId) throw new BillingError("transaction_not_found", 404);
  if (account.checkoutTransactionId !== id && (!account.subscriptionId || value.subscriptionId !== account.subscriptionId)) {
    throw new BillingError("transaction_not_found", 404);
  }
  if (value.status === "completed" && value.subscriptionId) await reconcileSubscription(value.subscriptionId, value.id);
  return { ...await getProStatus(uid), paymentStatus: value.status };
}

export async function handlePaddleEvent(rawBody: string, signature: string) {
  const config = requireBillingConfig();
  const paddle = getPaddle();
  let event;
  try { event = await paddle.webhooks.unmarshal(rawBody, config.webhookSecret, signature); }
  catch { throw new BillingError("invalid_signature", 400); }
  if ((await billingCollection("events").doc(event.eventId).get()).exists) return;
  const metadata = { id: event.eventId, type: event.eventType, occurredAt: event.occurredAt };
  const data = event.data as unknown as { id: string; transactionId?: string };
  if (event.eventType.startsWith("subscription.")) {
    await reconcileSubscription(data.id, undefined, metadata);
  } else if (event.eventType === "transaction.completed") {
    const transaction = await paddle.transactions.get(data.id);
    if (transaction.subscriptionId) await reconcileSubscription(transaction.subscriptionId, transaction.id, metadata);
  } else if (event.eventType.startsWith("adjustment.")) {
    if (!data.transactionId) return;
    const transaction = await paddle.transactions.get(data.transactionId);
    if (transaction.subscriptionId) {
      await reconcileSubscription(transaction.subscriptionId, transaction.id, metadata);
    }
  }
}
