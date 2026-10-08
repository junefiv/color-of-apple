import type { CommunitySort, StoredPost } from "./types";

export type CommunityCursor =
  | { sort: "latest" | "mine"; publishedAt: number; id: string }
  | { sort: "liked"; likeCount: number; publishedAt: number; id: string };

const POST_ID = /^[A-Za-z0-9]{8,128}$/;

export function encodeCommunityCursor(cursor: CommunityCursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeCommunityCursor(token: string, sort: CommunitySort): CommunityCursor | null {
  if (token.length < 8 || token.length > 512) return null;
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as {
      sort?: unknown;
      id?: unknown;
      publishedAt?: unknown;
      likeCount?: unknown;
    };
    if (parsed.sort !== sort) return null;
    if (typeof parsed.id !== "string" || !POST_ID.test(parsed.id)) return null;
    if (typeof parsed.publishedAt !== "number" || !Number.isFinite(parsed.publishedAt)) return null;
    if (sort === "liked") {
      if (typeof parsed.likeCount !== "number" || !Number.isInteger(parsed.likeCount) || parsed.likeCount < 0) return null;
      return { sort: "liked", likeCount: parsed.likeCount, publishedAt: parsed.publishedAt, id: parsed.id };
    }
    return { sort, publishedAt: parsed.publishedAt, id: parsed.id };
  } catch {
    return null;
  }
}

export function cursorFromPost(sort: CommunitySort, post: StoredPost): CommunityCursor {
  if (sort === "liked") {
    return { sort: "liked", likeCount: post.likeCount, publishedAt: post.publishedAt, id: post.id };
  }
  return { sort, publishedAt: post.publishedAt, id: post.id };
}

function compareId(left: string, right: string) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function comparePosts(sort: CommunitySort, left: StoredPost, right: StoredPost) {
  if (sort === "liked" && left.likeCount !== right.likeCount) return right.likeCount - left.likeCount;
  if (left.publishedAt !== right.publishedAt) return right.publishedAt - left.publishedAt;
  return compareId(right.id, left.id);
}

export function isAfterCursor(sort: CommunitySort, post: StoredPost, cursor: CommunityCursor) {
  if (sort === "liked" && cursor.sort === "liked") {
    if (post.likeCount !== cursor.likeCount) return post.likeCount < cursor.likeCount;
    if (post.publishedAt !== cursor.publishedAt) return post.publishedAt < cursor.publishedAt;
    return post.id < cursor.id;
  }
  if (cursor.sort === "liked") return false;
  if (post.publishedAt !== cursor.publishedAt) return post.publishedAt < cursor.publishedAt;
  return post.id < cursor.id;
}
