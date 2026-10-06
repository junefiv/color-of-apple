import { billingFailure, billingResponse, requireBillingUser } from "@/lib/billing/server/http";
import { createProPortal } from "@/lib/billing/server/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try { return billingResponse(await createProPortal((await requireBillingUser(request)).uid)); }
  catch (error) { return billingFailure(error); }
}
