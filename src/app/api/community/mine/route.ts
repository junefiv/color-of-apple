import { queryCommunityPage } from "@/lib/community/firestore";
import { communityFailure, communityJson, requireCommunityUser } from "@/lib/community/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get("cursor");
  if (cursor !== null && cursor.length === 0) return communityJson({ error: "invalid" }, 400);
  try {
    const user = await requireCommunityUser(request);
    return communityJson(await queryCommunityPage("mine", cursor, user.uid));
  } catch (error) {
    return communityFailure(error);
  }
}
