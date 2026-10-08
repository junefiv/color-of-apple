import { communityDatabase } from "@/lib/community/firestore";
import { communityFailure, communityJson, readJson } from "@/lib/community/http";
import { recordPostView } from "@/lib/community/service";
import { parsePostId, parseViewerId } from "@/lib/community/validate";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ postId: string }> }) {
  const postId = parsePostId((await context.params).postId);
  if (!postId) return communityJson({ error: "invalid" }, 400);
  try {
    const viewerId = parseViewerId(await readJson(request));
    if (!viewerId) return communityJson({ error: "invalid" }, 400);
    const viewCount = await recordPostView(communityDatabase(), postId, viewerId);
    return communityJson({ viewCount });
  } catch (error) {
    return communityFailure(error);
  }
}
