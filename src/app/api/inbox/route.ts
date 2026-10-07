import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { INBOX_COOLDOWN_MS, parseInbox } from "@/lib/inbox/schema";

export const runtime = "nodejs";

class InboxCooldownError extends Error {
  constructor(readonly retryAfterMs: number) {
    super("cooldown");
  }
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "";
}

function rateKey(kind: "ip" | "email", value: string) {
  return createHash("sha256").update(`${kind}:${value}`).digest("hex");
}

async function reserveCooldown(keys: string[]) {
  const db = getFirebaseAdminDb();
  const now = Date.now();
  const until = Timestamp.fromMillis(now + INBOX_COOLDOWN_MS);
  await db.runTransaction(async (transaction) => {
    const refs = keys.map((key) => db.collection("inboxCooldowns").doc(key));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    let retryAfterMs = 0;
    for (const snapshot of snapshots) {
      const millis = snapshot.get("until")?.toMillis?.();
      if (typeof millis === "number" && millis > now) retryAfterMs = Math.max(retryAfterMs, millis - now);
    }
    if (retryAfterMs > 0) throw new InboxCooldownError(retryAfterMs);
    for (const ref of refs) transaction.set(ref, { until });
  });
}

async function releaseCooldown(keys: string[]) {
  const db = getFirebaseAdminDb();
  await Promise.all(keys.map((key) => db.collection("inboxCooldowns").doc(key).delete().catch(() => undefined)));
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 20_000) return Response.json({ error: "invalid" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const record = parseInbox(body);
  if (!record) return Response.json({ error: "invalid" }, { status: 400 });

  const ip = clientIp(request);
  const keys = [rateKey("email", record.email), ...(ip ? [rateKey("ip", ip)] : [])];

  try {
    await reserveCooldown(keys);
  } catch (error) {
    if (error instanceof InboxCooldownError) {
      const retryAfter = Math.ceil(error.retryAfterMs / 1000);
      return Response.json(
        { error: "cooldown", retryAfterMs: error.retryAfterMs },
        { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
      );
    }
    console.error("Inbox cooldown failed");
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    await getFirebaseAdminDb().collection(record.collection).add({
      ...record.data,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    await releaseCooldown(keys);
    console.error("Inbox write failed");
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
