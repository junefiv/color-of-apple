import { publicBillingConfig } from "@/lib/billing/server/config";
import { billingFailure, billingResponse } from "@/lib/billing/server/http";
export const runtime = "nodejs";
export async function GET() {
  try { return billingResponse(publicBillingConfig()); } catch (error) { return billingFailure(error); }
}
