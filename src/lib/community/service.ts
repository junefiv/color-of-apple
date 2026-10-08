import { randomBytes, randomUUID } from "node:crypto";
import { ENGINE_VERSION } from "@/lib/color-engine";
import { FREE_PROJECT_LIMIT, effectiveProfilePlan } from "@/lib/firebase/plan";
import { readProjectSource, type ProjectSource } from "./source";
import { paletteFromProject } from "./palette";
import {
  COMMUNITY_SCHEMA_VERSION,
  type CommunityDatabase,
  type CommunityTx,
  type CopyResult,
  type PostPatch,
  type PublishInput,
  type StoredDoc,
  type StoredPost,
} from "./types";

export class CommunityError extends Error {
  constructor(readonly code: string, readonly status: number) {
    super(code);
    this.name = "CommunityError";
  }
}

export const COMMUNITY_RATE_LIMITS = {
  publish: { max: 20, windowMs: 60 * 60 * 1000 },
  like: { max: 120, windowMs: 60 * 60 * 1000 },
  report: { max: 10, windowMs: 60 * 60 * 1000 },
  copy: { max: 30, windowMs: 60 * 60 * 1000 },
} as const;

export type RateAction = keyof typeof COMMUNITY_RATE_LIMITS;

export function createPostId() {
  return randomBytes(12).toString("hex");
}

export function communityOperatorUids() {
  return (process.env.COMMUNITY_OPERATOR_UIDS ?? "")
    .split(",")
    .map((uid) => uid.trim())
    .filter((uid) => /^[A-Za-z0-9]{8,128}$/.test(uid));
}

export function storedPostFromDoc(doc: StoredDoc): StoredPost | null {
  const data = doc.data;
  if (typeof data.ownerUid !== "string" || typeof data.authorName !== "string") return null;
  if (typeof data.title !== "string" || typeof data.likeCount !== "number") return null;
  if (data.status !== "published" && data.status !== "hidden") return null;
  if (typeof data.publishedAt !== "number" || typeof data.updatedAt !== "number") return null;
  const palette = paletteFromProject({
    input: (data.palette as { input?: unknown } | undefined)?.input,
    selectedPaletteId: (data.palette as { selectedPaletteId?: unknown } | undefined)?.selectedPaletteId,
    tokenSnapshot: (data.palette as { tokenSnapshot?: unknown } | undefined)?.tokenSnapshot,
    overrides: (data.palette as { overrides?: unknown } | undefined)?.overrides,
  });
  if (!palette) return null;
  return {
    id: doc.id,
    ownerUid: data.ownerUid,
    authorName: data.authorName,
    title: data.title,
    description: typeof data.description === "string" ? data.description : "",
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
    status: data.status,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    schemaVersion: typeof data.schemaVersion === "number" ? data.schemaVersion : 0,
    engineVersion: typeof data.engineVersion === "string" ? data.engineVersion : ENGINE_VERSION,
    likeCount: data.likeCount,
    viewCount: typeof data.viewCount === "number" && data.viewCount >= 0 ? data.viewCount : 0,
    palette,
  };
}

function postRecord(post: StoredPost): Record<string, unknown> {
  return {
    ownerUid: post.ownerUid,
    authorName: post.authorName,
    title: post.title,
    description: post.description,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    schemaVersion: post.schemaVersion,
    engineVersion: post.engineVersion,
    likeCount: post.likeCount,
    viewCount: post.viewCount,
    palette: post.palette,
  };
}

async function consumeRate(tx: CommunityTx, uid: string, action: RateAction, now: number) {
  const limit = COMMUNITY_RATE_LIMITS[action];
  const path = `communityRateLimits/${uid}_${action}`;
  const current = await tx.get(path);
  const windowStart = typeof current?.data.windowStart === "number" ? current.data.windowStart : now;
  const count = typeof current?.data.count === "number" ? current.data.count : 0;
  const expired = now - windowStart >= limit.windowMs;
  const nextCount = expired ? 1 : count + 1;
  if (!expired && count >= limit.max) throw new CommunityError("rate_limited", 429);
  tx.set(path, { windowStart: expired ? now : windowStart, count: nextCount });
}

function authorNameFromProfile(data: Record<string, unknown> | undefined) {
  const displayName = typeof data?.displayName === "string" ? data.displayName.replace(/\s+/g, " ").trim() : "";
  if (displayName) return displayName.slice(0, 30);
  const email = typeof data?.email === "string" ? data.email.trim() : "";
  const local = email.split("@")[0]?.replace(/\s+/g, "") ?? "";
  if (local) return local.slice(0, 30);
  return "User";
}

function canOperate(ownerUid: string, actorUid: string) {
  return ownerUid === actorUid || communityOperatorUids().includes(actorUid);
}

export async function publishPost(db: CommunityDatabase, uid: string, input: PublishInput, now = Date.now(), postId = createPostId()) {
  return db.runTransaction(async (tx) => {
    await consumeRate(tx, uid, "publish", now);
    const linkPath = `users/${uid}/communityPublications/${input.projectId}`;
    const link = await tx.get(linkPath);
    if (typeof link?.data.postId === "string") {
      const existing = await tx.get(`communityPosts/${link.data.postId}`);
      const post = existing ? storedPostFromDoc(existing) : null;
      if (post) return { post, created: false };
    }
    const project = await tx.get(`users/${uid}/projects/${input.projectId}`);
    if (!project) throw new CommunityError("not_found", 404);
    const profile = await tx.get(`users/${uid}`);
    const palette = paletteFromProject(project.data);
    if (!palette) throw new CommunityError("invalid_palette", 400);
    const post: StoredPost = {
      id: postId,
      ownerUid: uid,
      authorName: authorNameFromProfile(profile?.data),
      title: input.title,
      description: input.description,
      tags: input.tags,
      status: "published",
      publishedAt: now,
      updatedAt: now,
      schemaVersion: COMMUNITY_SCHEMA_VERSION,
      engineVersion: ENGINE_VERSION,
      likeCount: 0,
      viewCount: 0,
      palette,
    };
    tx.set(`communityPosts/${postId}`, postRecord(post));
    tx.set(linkPath, { postId, createdAt: now });
    return { post, created: true };
  });
}

async function publicationForPost(tx: CommunityTx, ownerUid: string, postId: string) {
  const links = await tx.list(`users/${ownerUid}/communityPublications`);
  return links.find((link) => link.data.postId === postId) ?? null;
}

export async function updatePost(db: CommunityDatabase, actorUid: string, postId: string, patch: PostPatch, now = Date.now()) {
  return db.runTransaction(async (tx) => {
    const currentDoc = await tx.get(`communityPosts/${postId}`);
    const current = currentDoc ? storedPostFromDoc(currentDoc) : null;
    if (!current) throw new CommunityError("not_found", 404);
    const owner = current.ownerUid === actorUid;
    if (!canOperate(current.ownerUid, actorUid)) throw new CommunityError("forbidden", 403);
    if (!owner && (patch.title || patch.description !== undefined || patch.tags || patch.refreshPalette)) {
      throw new CommunityError("forbidden", 403);
    }
    await consumeRate(tx, actorUid, "publish", now);
    const next: StoredPost = { ...current, updatedAt: now };
    if (patch.title) next.title = patch.title;
    if (patch.description !== undefined) next.description = patch.description;
    if (patch.tags) next.tags = patch.tags;
    if (owner) {
      const profile = await tx.get(`users/${actorUid}`);
      next.authorName = authorNameFromProfile(profile?.data);
    }
    if (patch.status) next.status = patch.status;
    if (patch.refreshPalette) {
      const link = await publicationForPost(tx, current.ownerUid, postId);
      if (!link) throw new CommunityError("not_found", 404);
      const project = await tx.get(`users/${current.ownerUid}/projects/${link.id}`);
      if (!project) throw new CommunityError("not_found", 404);
      const palette = paletteFromProject(project.data);
      if (!palette) throw new CommunityError("invalid_palette", 400);
      next.palette = palette;
    }
    tx.set(`communityPosts/${postId}`, postRecord(next));
    return next;
  });
}

export async function deletePost(db: CommunityDatabase, actorUid: string, postId: string, now = Date.now()) {
  return db.runTransaction(async (tx) => {
    const currentDoc = await tx.get(`communityPosts/${postId}`);
    const current = currentDoc ? storedPostFromDoc(currentDoc) : null;
    if (!current) throw new CommunityError("not_found", 404);
    if (!canOperate(current.ownerUid, actorUid)) throw new CommunityError("forbidden", 403);
    await consumeRate(tx, actorUid, "publish", now);
    const link = await publicationForPost(tx, current.ownerUid, postId);
    tx.delete(`communityPosts/${postId}`);
    if (link) tx.delete(link.path);
  });
}

export async function setPostLike(db: CommunityDatabase, uid: string, postId: string, liked: boolean, now = Date.now()) {
  return db.runTransaction(async (tx) => {
    await consumeRate(tx, uid, "like", now);
    const likePath = `users/${uid}/communityLikes/${postId}`;
    const [postDoc, likeDoc] = await Promise.all([
      tx.get(`communityPosts/${postId}`),
      tx.get(likePath),
    ]);
    const post = postDoc ? storedPostFromDoc(postDoc) : null;
    const currently = Boolean(likeDoc);
    if (!post) {
      if (!liked && currently) {
        tx.delete(likePath);
        return { liked: false, likeCount: 0 };
      }
      throw new CommunityError("not_found", 404);
    }
    if (post.status !== "published" && liked && !currently) throw new CommunityError("not_found", 404);
    if (currently === liked) return { liked, likeCount: post.likeCount };
    const likeCount = Math.max(0, post.likeCount + (liked ? 1 : -1));
    if (liked) tx.set(likePath, { createdAt: now });
    else tx.delete(likePath);
    tx.set(`communityPosts/${postId}`, postRecord({ ...post, likeCount }));
    return { liked, likeCount };
  });
}

export async function recordPostView(db: CommunityDatabase, postId: string, viewerId: string, now = Date.now()) {
  return db.runTransaction(async (tx) => {
    const postDoc = await tx.get(`communityPosts/${postId}`);
    const post = postDoc ? storedPostFromDoc(postDoc) : null;
    if (!post || post.status !== "published") throw new CommunityError("not_found", 404);
    const seenPath = `communityPostViews/${postId}_${viewerId}`;
    const seen = await tx.get(seenPath);
    if (seen) return post.viewCount;
    const viewCount = post.viewCount + 1;
    tx.set(seenPath, { postId, viewerId, at: now });
    tx.set(`communityPosts/${postId}`, postRecord({ ...post, viewCount }));
    return viewCount;
  });
}

export async function reportPost(db: CommunityDatabase, uid: string, postId: string, reason: string, now = Date.now()) {
  return db.runTransaction(async (tx) => {
    const postDoc = await tx.get(`communityPosts/${postId}`);
    const post = postDoc ? storedPostFromDoc(postDoc) : null;
    if (!post || post.status !== "published") throw new CommunityError("not_found", 404);
    const path = `communityReports/${postId}_${uid}`;
    const existing = await tx.get(path);
    if (existing) return { created: false };
    await consumeRate(tx, uid, "report", now);
    tx.set(path, { postId, reporterUid: uid, reason, createdAt: now, status: "open" });
    return { created: true };
  });
}

export async function copyPost(
  db: CommunityDatabase,
  uid: string,
  postId: string,
  title: string,
  intentId: string,
  now = Date.now(),
  projectId = randomUUID().replace(/-/g, "").slice(0, 20),
): Promise<CopyResult> {
  return db.runTransaction(async (tx) => {
    await consumeRate(tx, uid, "copy", now);
    const intentPath = `users/${uid}/communityCopyIntents/${intentId}`;
    const intent = await tx.get(intentPath);
    const postDoc = await tx.get(`communityPosts/${postId}`);
    const post = postDoc ? storedPostFromDoc(postDoc) : null;
    if (typeof intent?.data.projectId === "string") {
      const source = sourceFor(postId, post?.authorName ?? "");
      const saved = await tx.get(`users/${uid}/projects/${intent.data.projectId}`);
      const palette = saved ? paletteFromProject(saved.data) : null;
      if (palette && readProjectSource(saved?.data.source)) {
        return {
          projectId: intent.data.projectId,
          title: typeof saved?.data.title === "string" ? saved.data.title : title,
          ...palette,
          source: readProjectSource(saved?.data.source) ?? source,
          created: false,
        };
      }
    }
    if (!post || post.status !== "published" || post.schemaVersion !== COMMUNITY_SCHEMA_VERSION) {
      throw new CommunityError("not_found", 404);
    }
    const profile = await tx.get(`users/${uid}`);
    if (!profile) throw new CommunityError("profile_missing", 409);
    const source: ProjectSource = sourceFor(postId, post.authorName);
    const projectData = {
      title,
      input: post.palette.input,
      selectedPaletteId: post.palette.selectedPaletteId,
      overrides: post.palette.overrides,
      tokenSnapshot: post.palette.tokenSnapshot,
      colorHistory: [],
      source,
      createdAt: now,
      updatedAt: now,
    };
    let savedId = projectId;
    if (effectiveProfilePlan(profile.data, now) === "pro") {
      tx.set(`users/${uid}/projects/${projectId}`, projectData);
    } else {
      const slots = await Promise.all(Array.from({ length: FREE_PROJECT_LIMIT }, (_, index) => (
        tx.get(`users/${uid}/projects/slot-${index + 1}`)
      )));
      const openIndex = slots.findIndex((slot) => !slot);
      if (openIndex < 0) throw new CommunityError("project_limit", 409);
      savedId = `slot-${openIndex + 1}`;
      tx.set(`users/${uid}/projects/${savedId}`, projectData);
    }
    const savedSource = sourceFor(postId, post.authorName);
    projectData.source = savedSource;
    tx.set(intentPath, { projectId: savedId, createdAt: now });
    return {
      projectId: savedId,
      title,
      input: post.palette.input,
      selectedPaletteId: post.palette.selectedPaletteId,
      overrides: post.palette.overrides,
      tokenSnapshot: post.palette.tokenSnapshot,
      source: savedSource,
      created: true,
    };
  });
}

function sourceFor(postId: string, authorName: string): ProjectSource {
  return {
    kind: "community",
    postId,
    authorName,
    href: `/community?post=${postId}`,
  };
}

export async function readLikeMap(read: (path: string) => Promise<StoredDoc | null>, uid: string, postIds: string[]) {
  const docs = await Promise.all(postIds.map((postId) => read(`users/${uid}/communityLikes/${postId}`)));
  return Object.fromEntries(postIds.map((postId, index) => [postId, Boolean(docs[index])]));
}
