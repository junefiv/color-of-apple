import { BillingError } from "@/lib/billing/server/config";
import { billingFailure, billingResponse, requireBillingUser } from "@/lib/billing/server/http";
import { confirmProTransaction } from "@/lib/billing/server/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await requireBillingUser(request);
    const body = await request.json().catch(() => { throw new BillingError("invalid_transaction"); });
    if (typeof body?.transactionId !== "string") throw new BillingError("invalid_transaction");
    return billingResponse(await confirmProTransaction(user.uid, body.transactionId));
  } catch (error) { return billingFailure(error); }
}
