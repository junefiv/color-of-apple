export type BillingEnvironment = "sandbox" | "production";

export type BillingConfiguration = {
  enabled: boolean;
  environment: BillingEnvironment;
  clientToken: string | null;
  amount: 990;
  currency: "KRW";
};

export type BillingStatus = {
  environment: BillingEnvironment;
  subscriptionStatus: string | null;
  plan: "free" | "pro";
  paidThrough: string | null;
  cancelAt: string | null;
  hasSubscription: boolean;
};

export type BillingAccount = {
  customerId?: string;
  subscriptionId?: string;
  checkoutAttemptId?: string;
  checkoutTransactionId?: string;
  checkoutLeaseId?: string | null;
  checkoutLeaseUntil?: number;
};

export type SubscriptionState = {
  id: string;
  customerId: string;
  uid: string;
  status: string;
  priceId: string;
  providerUpdatedAt: string;
  checkoutAttemptId: string | null;
  cancelAt: string | null;
  paidThrough: string | null;
  lastTransactionId: string | null;
  transactionUpdatedAt: string | null;
  paymentRevoked: boolean;
};

export type PaidTransaction = {
  id: string;
  updatedAt: string;
  paidThrough: string;
  revoked: boolean;
};
