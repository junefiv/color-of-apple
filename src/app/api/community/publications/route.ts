import { readPublications } from "@/lib/community/firestore";
import { communityFailure, communityJson, requireCommunityUser } from "@/lib/community/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireCommunityUser(request);
    return communityJson({ items: await readPublications(user.uid) });
  } catch (error) {
    return communityFailure(error);
  }
}
