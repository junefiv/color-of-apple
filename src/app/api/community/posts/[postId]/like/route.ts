import { communityDatabase } from "@/lib/community/firestore";
import { communityFailure, communityJson, readJson, requireCommunityUser } from "@/lib/community/http";
import { setPostLike } from "@/lib/community/service";
import { parseLikeBody, parsePostId } from "@/lib/community/validate";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ postId: string }> }) {
  const postId = parsePostId((await context.params).postId);
  if (!postId) return communityJson({ error: "invalid" }, 400);
  try {
    const user = await requireCommunityUser(request);
    const liked = parseLikeBody(await readJson(request));
    if (liked === null) return communityJson({ error: "invalid" }, 400);
    return communityJson(await setPostLike(communityDatabase(), user.uid, postId, liked));
  } catch (error) {
    return communityFailure(error);
  }
}
