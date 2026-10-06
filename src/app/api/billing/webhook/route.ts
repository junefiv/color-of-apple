import { BillingError } from "@/lib/billing/server/config";
import { billingFailure, billingResponse } from "@/lib/billing/server/http";
import { handlePaddleEvent } from "@/lib/billing/server/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const signature = request.headers.get("paddle-signature");
    if (!signature) throw new BillingError("invalid_signature");
    const body = await request.text();
    if (body.length > 1_000_000) throw new BillingError("webhook_too_large", 413);
    await handlePaddleEvent(body, signature);
    return billingResponse({ received: true });
  } catch (error) { return billingFailure(error); }
}
