import { communityDatabase } from "@/lib/community/firestore";
import { communityFailure, communityJson, readJson, requireCommunityUser } from "@/lib/community/http";
import { reportPost } from "@/lib/community/service";
import { parsePostId, parseReport } from "@/lib/community/validate";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ postId: string }> }) {
  const postId = parsePostId((await context.params).postId);
  if (!postId) return communityJson({ error: "invalid" }, 400);
  try {
    const user = await requireCommunityUser(request);
    const reason = parseReport(await readJson(request));
    if (!reason) return communityJson({ error: "invalid" }, 400);
    return communityJson(await reportPost(communityDatabase(), user.uid, postId, reason));
  } catch (error) {
    return communityFailure(error);
  }
}
