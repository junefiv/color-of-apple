import { billingFailure, billingResponse, requireBillingUser } from "@/lib/billing/server/http";
import { createProCheckout } from "@/lib/billing/server/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try { return billingResponse(await createProCheckout(await requireBillingUser(request))); }
  catch (error) { return billingFailure(error); }
}
