import { requireBillingUser } from "@/lib/billing/server/http";
import { BillingError } from "@/lib/billing/server/config";
import { generateExport } from "@/lib/codegen/generate";
import { parseExportPayload } from "@/lib/codegen/payload";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { effectiveProfilePlan } from "@/lib/firebase/plan";

export const runtime = "nodejs";

const fail = (error: string, status: number) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

// Pro-only code export. The plan is read from the server's copy of the profile, never from the
// request, and the generator only exists on the server, so a modified client can't produce files.
export async function POST(request: Request) {
  let uid: string;
  try { uid = (await requireBillingUser(request)).uid; }
  catch (error) { return fail(error instanceof BillingError ? error.code : "sign_in_required", 401); }
  try {
    const profile = await getFirebaseAdminDb().doc(`users/${uid}`).get();
    if (effectiveProfilePlan(profile.data() ?? {}) !== "pro") return fail("pro_required", 403);
  } catch { return fail("plan_check_failed", 503); }
  if (Number(request.headers.get("content-length") ?? 0) > 4_400_000) return fail("too_large", 413);
  let body: unknown;
  try { body = await request.json(); } catch { return fail("invalid_request", 400); }
  const payload = parseExportPayload(body);
  if (!payload) return fail("invalid_request", 400);
  try {
    const file = generateExport(payload);
    const body = typeof file.body === "string" ? file.body : new Blob([file.body as BlobPart]);
    return new Response(body, { headers: { "Content-Type": file.contentType, "Content-Disposition": `attachment; filename="${file.filename}"`, "Cache-Control": "no-store" } });
  } catch {
    console.error("Builder export failed");
    return fail("export_failed", 500);
  }
}
