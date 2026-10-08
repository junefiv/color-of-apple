import { communityDatabase } from "@/lib/community/firestore";
import { communityFailure, communityJson, readJson, requireCommunityUser } from "@/lib/community/http";
import { copyPost } from "@/lib/community/service";
import { parseCopyBody, parsePostId } from "@/lib/community/validate";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ postId: string }> }) {
  const postId = parsePostId((await context.params).postId);
  if (!postId) return communityJson({ error: "invalid" }, 400);
  try {
    const user = await requireCommunityUser(request);
    const body = parseCopyBody(await readJson(request));
    if (!body) return communityJson({ error: "invalid" }, 400);
    return communityJson(await copyPost(communityDatabase(), user.uid, postId, body.title, body.intentId));
  } catch (error) {
    return communityFailure(error);
  }
}
