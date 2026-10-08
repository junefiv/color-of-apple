import { FieldPath, Timestamp, type DocumentData, type Query } from "firebase-admin/firestore";
import { unstable_cache, revalidateTag } from "next/cache";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { cursorFromPost, decodeCommunityCursor, encodeCommunityCursor } from "./cursor";
import { toCommunityPost } from "./page";
import { CommunityError, storedPostFromDoc } from "./service";
import { COMMUNITY_PAGE_SIZE, type CommunityDatabase, type CommunityPage, type CommunitySort, type CommunityTx, type PublicSort, type StoredDoc } from "./types";

const TIME_FIELDS = new Set(["publishedAt", "updatedAt", "createdAt", "windowStart"]);

function isTimestamp(value: unknown): value is { toMillis: () => number } {
  return Boolean(value) && typeof value === "object" && typeof (value as { toMillis?: unknown }).toMillis === "function";
}

export function fromFirestoreData(data: DocumentData): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isTimestamp(value)) next[key] = value.toMillis();
    else if (value && typeof value === "object" && !Array.isArray(value)) next[key] = fromFirestoreData(value as DocumentData);
    else next[key] = value;
  }
  return next;
}

export function toFirestoreData(data: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (TIME_FIELDS.has(key) && typeof value === "number") next[key] = Timestamp.fromMillis(value);
    else if (value && typeof value === "object" && !Array.isArray(value)) next[key] = toFirestoreData(value as Record<string, unknown>);
    else next[key] = value;
  }
  return next;
}

function docOf(path: string, id: string, data: DocumentData): StoredDoc {
  return { id, path, data: fromFirestoreData(data) };
}

export function communityDatabase(): CommunityDatabase {
  const db = getFirebaseAdminDb();
  return {
    runTransaction(run) {
      return db.runTransaction(async (transaction) => {
        const writes: Array<{ op: "set"; path: string; data: Record<string, unknown> } | { op: "delete"; path: string }> = [];
        const tx: CommunityTx = {
          async get(path) {
            const snapshot = await transaction.get(db.doc(path));
            if (!snapshot.exists) return null;
            return docOf(path, snapshot.id, snapshot.data() ?? {});
          },
          set(path, data) {
            writes.push({ op: "set", path, data });
          },
          delete(path) {
            writes.push({ op: "delete", path });
          },
          async list(collectionPath) {
            const snapshot = await transaction.get(db.collection(collectionPath));
            return snapshot.docs.map((item) => docOf(item.ref.path, item.id, item.data()));
          },
        };
        const result = await run(tx);
        for (const write of writes) {
          if (write.op === "delete") transaction.delete(db.doc(write.path));
          else transaction.set(db.doc(write.path), toFirestoreData(write.data));
        }
        return result;
      });
    },
  };
}

export async function queryCommunityPage(sort: CommunitySort, cursorToken: string | null, ownerUid?: string): Promise<CommunityPage> {
  const cursor = cursorToken ? decodeCommunityCursor(cursorToken, sort) : null;
  if (cursorToken && !cursor) throw new CommunityError("invalid_cursor", 400);
  const db = getFirebaseAdminDb();
  let query: Query = db.collection("communityPosts");
  if (sort === "mine") {
    if (!ownerUid) throw new CommunityError("sign_in_required", 401);
    query = query.where("ownerUid", "==", ownerUid).orderBy("publishedAt", "desc").orderBy(FieldPath.documentId(), "desc");
    if (cursor?.sort === "mine") query = query.startAfter(Timestamp.fromMillis(cursor.publishedAt), cursor.id);
  } else if (sort === "liked") {
    query = query.where("status", "==", "published").orderBy("likeCount", "desc").orderBy("publishedAt", "desc").orderBy(FieldPath.documentId(), "desc");
    if (cursor?.sort === "liked") query = query.startAfter(cursor.likeCount, Timestamp.fromMillis(cursor.publishedAt), cursor.id);
  } else {
    query = query.where("status", "==", "published").orderBy("publishedAt", "desc").orderBy(FieldPath.documentId(), "desc");
    if (cursor?.sort === "latest") query = query.startAfter(Timestamp.fromMillis(cursor.publishedAt), cursor.id);
  }

  const snapshot = await query.limit(COMMUNITY_PAGE_SIZE).get();
  const scope = sort === "mine" ? "mine" : "public";
  const items = snapshot.docs.flatMap((item) => {
    const stored = storedPostFromDoc(docOf(item.ref.path, item.id, item.data()));
    const view = stored ? toCommunityPost(stored, scope) : null;
    return view ? [view] : [];
  });
  const last = snapshot.docs.at(-1);
  const lastStored = last ? storedPostFromDoc(docOf(last.ref.path, last.id, last.data())) : null;
  const nextCursor = snapshot.size === COMMUNITY_PAGE_SIZE && lastStored
    ? encodeCommunityCursor(cursorFromPost(sort, lastStored))
    : null;
  return { items, nextCursor };
}

const cachedFirstPage = unstable_cache(
  async (sort: string) => queryCommunityPage(sort as PublicSort, null),
  ["community-public-posts"],
  { revalidate: 30, tags: ["community-posts"] },
);

export function revalidateCommunityList() {
  revalidateTag("community-posts", { expire: 0 });
}

export async function publicCommunityPage(sort: PublicSort, cursorToken: string | null) {
  if (!cursorToken) return cachedFirstPage(sort);
  return queryCommunityPage(sort, cursorToken);
}

export async function readCommunityPost(postId: string) {
  const snapshot = await getFirebaseAdminDb().doc(`communityPosts/${postId}`).get();
  if (!snapshot.exists) return null;
  return storedPostFromDoc(docOf(snapshot.ref.path, snapshot.id, snapshot.data() ?? {}));
}

export async function readLikeStatuses(uid: string, postIds: string[]) {
  const db = getFirebaseAdminDb();
  const snapshots = await db.getAll(...postIds.map((postId) => db.doc(`users/${uid}/communityLikes/${postId}`)));
  return Object.fromEntries(postIds.map((postId, index) => [postId, snapshots[index]?.exists === true]));
}

export async function readPublications(uid: string) {
  const snapshot = await getFirebaseAdminDb().collection(`users/${uid}/communityPublications`).get();
  return snapshot.docs.flatMap((item) => (
    typeof item.get("postId") === "string" ? [{ projectId: item.id, postId: item.get("postId") as string }] : []
  ));
}
