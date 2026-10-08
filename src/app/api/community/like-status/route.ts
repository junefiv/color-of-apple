import { readLikeStatuses } from "@/lib/community/firestore";
import { communityFailure, communityJson, readJson, requireCommunityUser } from "@/lib/community/http";
import { parsePostIds } from "@/lib/community/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser(request);
    const postIds = parsePostIds(await readJson(request));
    if (!postIds) return communityJson({ error: "invalid" }, 400);
    return communityJson({ likes: await readLikeStatuses(user.uid, postIds) });
  } catch (error) {
    return communityFailure(error);
  }
}
