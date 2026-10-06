import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { BillingError } from "./config";

export async function requireBillingUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new BillingError("sign_in_required", 401);
  try {
    const identity = await getFirebaseAdminAuth().verifyIdToken(token, true);
    // Require the Firebase account's verified email, never an email supplied by the browser.
    if (!identity.email || !identity.email_verified) throw new Error("unverified email");
    return { uid: identity.uid, email: identity.email };
  } catch { throw new BillingError("sign_in_required", 401); }
}

export function billingResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function billingFailure(error: unknown) {
  if (error instanceof BillingError) return billingResponse({ error: error.code }, error.status);
  // Do not return SDK responses, credentials, or customer information to the client or logs.
  console.error("Billing request failed");
  return billingResponse({ error: "billing_request_failed" }, 503);
}
