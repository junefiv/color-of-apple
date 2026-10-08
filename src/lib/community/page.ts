import { COMMUNITY_PAGE_SIZE, COMMUNITY_SCHEMA_VERSION, type CommunityPage, type CommunityPost, type CommunitySort, type StoredPost } from "./types";
import { comparePosts, cursorFromPost, encodeCommunityCursor, isAfterCursor, type CommunityCursor } from "./cursor";

export function toCommunityPost(post: StoredPost, scope: "public" | "mine"): CommunityPost | null {
  if (post.schemaVersion !== COMMUNITY_SCHEMA_VERSION) return null;
  if (scope === "public" && post.status !== "published") return null;
  return {
    id: post.id,
    authorName: post.authorName,
    title: post.title,
    description: post.description,
    tags: post.tags,
    publishedAt: new Date(post.publishedAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
    schemaVersion: post.schemaVersion,
    engineVersion: post.engineVersion,
    likeCount: post.likeCount,
    viewCount: post.viewCount,
    palette: post.palette,
    ...(scope === "mine" ? { status: post.status } : {}),
  };
}

export function slicePosts(posts: StoredPost[], sort: CommunitySort, cursor: CommunityCursor | null, ownerUid?: string): CommunityPage & { scanned: number } {
  const filtered = posts.filter((post) => {
    if (sort === "mine") return post.ownerUid === ownerUid;
    return post.status === "published";
  });
  const ordered = [...filtered].sort((left, right) => comparePosts(sort, left, right));
  const after = cursor ? ordered.filter((post) => isAfterCursor(sort, post, cursor)) : ordered;
  const page = after.slice(0, COMMUNITY_PAGE_SIZE);
  const items = page.flatMap((post) => {
    const view = toCommunityPost(post, sort === "mine" ? "mine" : "public");
    return view ? [view] : [];
  });
  const nextCursor = page.length === COMMUNITY_PAGE_SIZE
    ? encodeCommunityCursor(cursorFromPost(sort, page[page.length - 1]))
    : null;
  return { items, nextCursor, scanned: page.length };
}
