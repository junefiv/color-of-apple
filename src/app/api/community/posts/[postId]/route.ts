import { communityDatabase, readCommunityPost, revalidateCommunityList } from "@/lib/community/firestore";
import { communityFailure, communityJson, optionalCommunityUser, readJson, requireCommunityUser } from "@/lib/community/http";
import { toCommunityPost } from "@/lib/community/page";
import { communityOperatorUids, deletePost, updatePost } from "@/lib/community/service";
import { parsePostId, parsePostPatch } from "@/lib/community/validate";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ postId: string }> }) {
  const postId = parsePostId((await context.params).postId);
  if (!postId) return communityJson({ error: "invalid" }, 400);
  try {
    const viewer = await optionalCommunityUser(request);
    const post = await readCommunityPost(postId);
    if (!post) return communityJson({ error: "not_found" }, 404);
    const owner = viewer?.uid === post.ownerUid || (viewer ? communityOperatorUids().includes(viewer.uid) : false);
    if (post.status !== "published" && !owner) return communityJson({ error: "not_found" }, 404);
    const view = toCommunityPost(post, owner ? "mine" : "public");
    if (!view) return communityJson({ error: "unsupported_schema" }, 422);
    return communityJson({ post: view });
  } catch (error) {
    return communityFailure(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ postId: string }> }) {
  const postId = parsePostId((await context.params).postId);
  if (!postId) return communityJson({ error: "invalid" }, 400);
  try {
    const user = await requireCommunityUser(request);
    const patch = parsePostPatch(await readJson(request));
    if (!patch) return communityJson({ error: "invalid" }, 400);
    const post = await updatePost(communityDatabase(), user.uid, postId, patch);
    const view = toCommunityPost(post, "mine");
    if (!view) return communityJson({ error: "unsupported_schema" }, 422);
    revalidateCommunityList();
    return communityJson({ post: view });
  } catch (error) {
    return communityFailure(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ postId: string }> }) {
  const postId = parsePostId((await context.params).postId);
  if (!postId) return communityJson({ error: "invalid" }, 400);
  try {
    const user = await requireCommunityUser(request);
    await deletePost(communityDatabase(), user.uid, postId);
    revalidateCommunityList();
    return communityJson({ deleted: true });
  } catch (error) {
    return communityFailure(error);
  }
}
