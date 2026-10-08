import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { CommunityError } from "./service";

export async function requireCommunityUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new CommunityError("sign_in_required", 401);
  try {
    const identity = await getFirebaseAdminAuth().verifyIdToken(token, true);
    if (!identity.uid) throw new Error("missing uid");
    return { uid: identity.uid };
  } catch (error) {
    if (error instanceof CommunityError) throw error;
    throw new CommunityError("sign_in_required", 401);
  }
}

export async function optionalCommunityUser(request: Request) {
  if (!request.headers.get("authorization")) return null;
  return requireCommunityUser(request);
}

export async function readJson(request: Request, max = 20_000) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > max) throw new CommunityError("invalid", 400);
  try {
    return await request.json() as unknown;
  } catch {
    throw new CommunityError("invalid", 400);
  }
}

export function communityJson(data: unknown, status = 200, cache = "private, no-store") {
  return Response.json(data, { status, headers: { "Cache-Control": cache } });
}

export function communityFailure(error: unknown) {
  if (error instanceof CommunityError) {
    const headers: Record<string, string> = { "Cache-Control": "private, no-store" };
    if (error.status === 429) headers["Retry-After"] = "60";
    return Response.json({ error: error.code }, { status: error.status, headers });
  }
  const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  console.error("Community request failed", error instanceof Error ? error.name : "unknown", code, error instanceof Error ? error.message : "");
  return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
}
