import { publicCommunityPage, revalidateCommunityList, communityDatabase } from "@/lib/community/firestore";
import { communityFailure, communityJson, readJson, requireCommunityUser } from "@/lib/community/http";
import { publishPost } from "@/lib/community/service";
import { toCommunityPost } from "@/lib/community/page";
import { parsePublicSort, parsePublishInput } from "@/lib/community/validate";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sort = parsePublicSort(url.searchParams.get("sort") ?? "latest");
  const cursor = url.searchParams.get("cursor");
  if (!sort || (cursor !== null && cursor.length === 0)) return communityJson({ error: "invalid" }, 400);
  try {
    const page = await publicCommunityPage(sort, cursor);
    return communityJson(page, 200, "public, max-age=0, s-maxage=30, stale-while-revalidate=30");
  } catch (error) {
    return communityFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser(request);
    const input = parsePublishInput(await readJson(request));
    if (!input) return communityJson({ error: "invalid" }, 400);
    const result = await publishPost(communityDatabase(), user.uid, input);
    const post = toCommunityPost(result.post, "mine");
    if (!post) return communityJson({ error: "invalid_palette" }, 400);
    revalidateCommunityList();
    return communityJson({ post, created: result.created }, result.created ? 201 : 200);
  } catch (error) {
    return communityFailure(error);
  }
}
