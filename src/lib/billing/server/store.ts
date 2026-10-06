import { randomUUID } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { entitlementExpiry, mergeSubscriptionState, subscriptionHasPro } from "../entitlements";
import type { BillingAccount, PaidTransaction, SubscriptionState } from "../types";
import { BillingError, billingEnvironment } from "./config";

export function billingCollection(name: string) {
  return getFirebaseAdminDb().collection("billing").doc(billingEnvironment()).collection(name);
}

export async function getBillingAccount(uid: string): Promise<BillingAccount> {
  return (await billingCollection("accounts").doc(uid).get()).data() as BillingAccount ?? {};
}

export async function getSubscriptionState(id?: string): Promise<SubscriptionState | null> {
  return id ? (await billingCollection("subscriptions").doc(id).get()).data() as SubscriptionState ?? null : null;
}

export async function claimCheckout(uid: string) {
  const reference = billingCollection("accounts").doc(uid);
  const leaseId = randomUUID();
  const account = await getFirebaseAdminDb().runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    const profile = await transaction.get(getFirebaseAdminDb().collection("users").doc(uid));
    if (!profile.exists) throw new BillingError("profile_required", 409);
    const value = snapshot.data() as BillingAccount ?? {};
    if ((value.checkoutLeaseUntil ?? 0) > Date.now()) throw new BillingError("checkout_in_progress", 409);
    transaction.set(reference, { checkoutLeaseId: leaseId, checkoutLeaseUntil: Date.now() + 120_000 }, { merge: true });
    return value;
  });
  return { account, leaseId };
}

export async function updateCheckout(uid: string, leaseId: string, updates: Partial<BillingAccount>) {
  const reference = billingCollection("accounts").doc(uid);
  await getFirebaseAdminDb().runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    if (snapshot.data()?.checkoutLeaseId !== leaseId) throw new BillingError("checkout_in_progress", 409);
    transaction.set(reference, updates, { merge: true });
    if (updates.customerId) {
      transaction.set(billingCollection("customers").doc(updates.customerId), { uid }, { merge: true });
    }
  });
}

export async function releaseCheckout(uid: string, leaseId: string) {
  const reference = billingCollection("accounts").doc(uid);
  await getFirebaseAdminDb().runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    if (snapshot.data()?.checkoutLeaseId === leaseId) {
      transaction.set(reference, { checkoutLeaseId: null, checkoutLeaseUntil: 0 }, { merge: true });
    }
  });
}

export async function resolveSubscriptionOwner(customerId: string, subscriptionId: string, attempt: unknown) {
  const binding = await billingCollection("customers").doc(customerId).get();
  const uid = binding.data()?.uid;
  if (typeof uid !== "string") return null;
  const account = await getBillingAccount(uid);
  if (account.customerId !== customerId) return null;
  const existing = await getSubscriptionState(subscriptionId);
  if (existing?.uid === uid) return uid;
  // custom_data is only accepted with the server-created customer AND checkout attempt.
  if (typeof attempt !== "string" || attempt !== account.checkoutAttemptId) return null;
  return uid;
}

export async function applySubscription(
  incoming: SubscriptionState,
  payment: PaidTransaction | null,
  event?: { id: string; type: string; occurredAt: string },
) {
  const db = getFirebaseAdminDb();
  const subReference = billingCollection("subscriptions").doc(incoming.id);
  const accountReference = billingCollection("accounts").doc(incoming.uid);
  const profileReference = db.collection("users").doc(incoming.uid);
  const eventReference = event ? billingCollection("events").doc(event.id) : null;
  return db.runTransaction(async transaction => {
    const [sub, account, profile, processed] = await Promise.all([
      transaction.get(subReference), transaction.get(accountReference), transaction.get(profileReference),
      eventReference ? transaction.get(eventReference) : Promise.resolve(null),
    ]);
    if (processed?.exists) return false;
    const previous = sub.data() as SubscriptionState | undefined;
    if (previous && (previous.uid !== incoming.uid || previous.customerId !== incoming.customerId)) {
      throw new BillingError("subscription_owner_mismatch", 422);
    }
    const state = mergeSubscriptionState(previous ?? null, incoming, payment);
    transaction.set(subReference, state);
    const currentId = account.data()?.subscriptionId as string | undefined;
    const isCurrent = currentId === incoming.id;
    // Only the current checkout attempt may replace a previous, canceled subscription.
    const canBind = !currentId || (payment !== null && incoming.checkoutAttemptId !== null
      && incoming.checkoutAttemptId === account.data()?.checkoutAttemptId);
    if (isCurrent || canBind) {
      transaction.set(accountReference, { subscriptionId: state.id }, { merge: true });
      // Sandbox payments are kept separate and NEVER grant live user permissions.
      if (billingEnvironment() === "production" && profile.exists) {
        const expiry = entitlementExpiry(state);
        transaction.set(profileReference, { plan: subscriptionHasPro(state) ? "pro" : "free",
          proExpiresAt: expiry ? Timestamp.fromDate(new Date(expiry)) : null,
          updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
    }
    if (eventReference && event) transaction.set(eventReference, {
      eventType: event.type, occurredAt: event.occurredAt, subscriptionId: state.id,
      processedAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
}
