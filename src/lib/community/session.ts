import type { CommunityPost } from "./types";

const POST_KEY = "matchu:community-session";
const INTENT_KEY = "matchu:community-intent";

export type CommunityIntent =
  | { kind: "like"; postId: string; liked: boolean }
  | { kind: "copy"; postId: string; title: string; intentId: string };

const likes = new Map<string, boolean>();
let likeUid: string | null | undefined;

export function syncLikeCache(uid: string | null) {
  if (likeUid === uid) return;
  likes.clear();
  likeUid = uid;
}

export function cachedLike(postId: string) {
  return likes.has(postId) ? likes.get(postId) : undefined;
}

export function rememberLike(postId: string, liked: boolean) {
  likes.set(postId, liked);
}

export function uncachedLikeIds(postIds: string[]) {
  return postIds.filter((postId) => !likes.has(postId));
}

export function readCommunitySession(): { postId: string; post?: CommunityPost } | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(POST_KEY) ?? "null") as { postId?: unknown; post?: CommunityPost } | null;
    if (!parsed || typeof parsed.postId !== "string") return null;
    return { postId: parsed.postId, post: parsed.post?.id === parsed.postId ? parsed.post : undefined };
  } catch {
    return null;
  }
}

export function writeCommunitySession(post: CommunityPost | null) {
  if (typeof window === "undefined") return;
  try {
    if (!post) window.sessionStorage.removeItem(POST_KEY);
    else window.sessionStorage.setItem(POST_KEY, JSON.stringify({ postId: post.id, post }));
  } catch { /* Storage restrictions must not block browsing. */ }
}

export function writeCommunityIntent(intent: CommunityIntent) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent)); } catch { /* Ignore quota errors. */ }
}

export function readCommunityIntent(): CommunityIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(INTENT_KEY) ?? "null") as CommunityIntent | null;
    if (!parsed || (parsed.kind !== "like" && parsed.kind !== "copy")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCommunityIntent() {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(INTENT_KEY); } catch { /* Ignore. */ }
}
