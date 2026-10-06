import { billingFailure, billingResponse, requireBillingUser } from "@/lib/billing/server/http";
import { getProStatus } from "@/lib/billing/server/service";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { return billingResponse(await getProStatus((await requireBillingUser(request)).uid, true)); }
  catch (error) { return billingFailure(error); }
}
