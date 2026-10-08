import type { User } from "firebase/auth";
import type { CommunityPage, CommunityPost, CopyResult, PostStatus, PublicSort } from "./types";

export class CommunityRequestError extends Error {
  constructor(readonly code: string, readonly status: number) {
    super(code);
    this.name = "CommunityRequestError";
  }
}

async function communityRequest<T>(user: User | null, path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  if (user) headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  const data = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new CommunityRequestError(data.error ?? "unavailable", response.status);
  return data as T;
}

export function fetchPublicPosts(sort: PublicSort, cursor: string | null) {
  const params = new URLSearchParams({ sort });
  if (cursor) params.set("cursor", cursor);
  return communityRequest<CommunityPage>(null, `/api/community/posts?${params}`);
}

export function fetchMyPosts(user: User, cursor: string | null) {
  const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return communityRequest<CommunityPage>(user, `/api/community/mine${params}`);
}

export function fetchCommunityPost(postId: string, user: User | null) {
  return communityRequest<{ post: CommunityPost }>(user, `/api/community/posts/${postId}`);
}

export function publishCommunityPost(user: User, body: {
  projectId: string;
  title: string;
  description: string;
  tags: string[];
}) {
  return communityRequest<{ post: CommunityPost; created: boolean }>(user, "/api/community/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patchCommunityPost(user: User, postId: string, body: {
  title?: string;
  description?: string;
  tags?: string[];
  status?: PostStatus;
  refreshPalette?: boolean;
}) {
  return communityRequest<{ post: CommunityPost }>(user, `/api/community/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteCommunityPost(user: User, postId: string) {
  return communityRequest<{ deleted: boolean }>(user, `/api/community/posts/${postId}`, { method: "DELETE" });
}

export function setCommunityLike(user: User, postId: string, liked: boolean) {
  return communityRequest<{ liked: boolean; likeCount: number }>(user, `/api/community/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({ liked }),
  });
}

export function recordCommunityView(postId: string, viewerId: string) {
  return communityRequest<{ viewCount: number }>(null, `/api/community/posts/${postId}/view`, {
    method: "POST",
    body: JSON.stringify({ viewerId }),
  });
}

export function fetchLikeStatus(user: User, postIds: string[]) {
  return communityRequest<{ likes: Record<string, boolean> }>(user, "/api/community/like-status", {
    method: "POST",
    body: JSON.stringify({ postIds }),
  });
}

export function reportCommunityPost(user: User, postId: string, reason: string) {
  return communityRequest<{ created: boolean }>(user, `/api/community/posts/${postId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function copyCommunityPost(user: User, postId: string, title: string, intentId: string) {
  return communityRequest<CopyResult>(user, `/api/community/posts/${postId}/copy`, {
    method: "POST",
    body: JSON.stringify({ title, intentId }),
  });
}

export function fetchPublications(user: User) {
  return communityRequest<{ items: Array<{ projectId: string; postId: string }> }>(user, "/api/community/publications");
}
