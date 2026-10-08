import type { PostPatch, PublishInput, PublicSort } from "./types";

export const COMMUNITY_DESCRIPTION_MAX = 80;
const TAG = /^[@#][^\s@#,]{1,20}$/;

const PROJECT_ID = /^(?:slot-[1-5]|[A-Za-z0-9]{8,128})$/;
const POST_ID = /^[A-Za-z0-9]{8,128}$/;
const INTENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length > max) return null;
  return text;
}

export function parseTags(value: unknown) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 3) return null;
  const tags: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || !TAG.test(entry)) return null;
    if (!tags.includes(entry)) tags.push(entry);
  }
  return tags;
}

export function tagsFromDraft(value: string) {
  const found = value.match(/[@#][^\s@#,]+/g) ?? [];
  const leftover = value.replace(/[@#][^\s@#,]+/g, "").replace(/[\s,]+/g, "");
  const tags = parseTags(found);
  return { tags: tags ?? [], valid: leftover.length === 0 && tags !== null };
}

export function parsePublishInput(value: unknown): PublishInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (typeof body.projectId !== "string" || !PROJECT_ID.test(body.projectId)) return null;
  const title = cleanText(body.title, 60);
  const description = body.description === undefined ? "" : cleanText(body.description, COMMUNITY_DESCRIPTION_MAX);
  const tags = parseTags(body.tags);
  if (!title || title.length < 1 || description === null || !tags) return null;
  return { projectId: body.projectId, title, description, tags };
}

export function parsePostPatch(value: unknown): PostPatch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const patch: PostPatch = {};
  if ("title" in body) {
    const title = cleanText(body.title, 60);
    if (!title || title.length < 1) return null;
    patch.title = title;
  }
  if ("description" in body) {
    const description = cleanText(body.description, COMMUNITY_DESCRIPTION_MAX);
    if (description === null) return null;
    patch.description = description;
  }
  if ("tags" in body) {
    const tags = parseTags(body.tags);
    if (!tags) return null;
    patch.tags = tags;
  }
  if ("status" in body) {
    if (body.status !== "published" && body.status !== "hidden") return null;
    patch.status = body.status;
  }
  if ("refreshPalette" in body) {
    if (typeof body.refreshPalette !== "boolean") return null;
    patch.refreshPalette = body.refreshPalette;
  }
  if (Object.keys(patch).length === 0) return null;
  return patch;
}

export function parsePublicSort(value: string | null): PublicSort | null {
  return value === "latest" || value === "liked" ? value : null;
}

export function parsePostId(value: string) {
  return POST_ID.test(value) ? value : null;
}

export function parseIntentId(value: unknown) {
  return typeof value === "string" && INTENT_ID.test(value) ? value : null;
}

export function parseViewerId(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return parseIntentId((value as { viewerId?: unknown }).viewerId);
}

export function parseLikeBody(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const liked = (value as { liked?: unknown }).liked;
  return typeof liked === "boolean" ? liked : null;
}

export function parsePostIds(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const postIds = (value as { postIds?: unknown }).postIds;
  if (!Array.isArray(postIds) || postIds.length < 1 || postIds.length > 12) return null;
  const ids: string[] = [];
  for (const id of postIds) {
    if (typeof id !== "string" || !POST_ID.test(id) || ids.includes(id)) return null;
    ids.push(id);
  }
  return ids;
}

export function parseReport(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const reason = cleanText((value as { reason?: unknown }).reason, 500);
  if (!reason || reason.length < 1) return null;
  return reason;
}

export function parseCopyBody(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as { title?: unknown; intentId?: unknown };
  const title = cleanText(body.title, 60);
  const intentId = parseIntentId(body.intentId);
  if (!title || title.length < 1 || !intentId) return null;
  return { title, intentId };
}
