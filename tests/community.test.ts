import { DEFAULT_INPUT } from "@/lib/color-engine";
import { columnCountForWidth, communityRows } from "@/lib/community/layout";
import { paletteDots } from "@/lib/community/palette";
import { slicePosts } from "@/lib/community/page";
import { decodeCommunityCursor, encodeCommunityCursor } from "@/lib/community/cursor";
import { readProjectSource } from "@/lib/community/source";
import { MemoryCommunityDb } from "@/lib/community/memory-db";
import { copyPost, deletePost, publishPost, recordPostView, setPostLike, updatePost } from "@/lib/community/service";
import { parsePostPatch, parsePublishInput, parseTags } from "@/lib/community/validate";
import type { CommunityPalette, StoredPost } from "@/lib/community/types";
import { describe, expect, it } from "vitest";

const palette: CommunityPalette = {
  input: DEFAULT_INPUT,
  selectedPaletteId: "studio",
  tokenSnapshot: {
    "primary.default": "#112233",
    "secondary.default": "#445566",
    "accent.default": "#778899",
    "surface.default": "#FFFFFF",
    "text.primary": "#101010",
  },
  overrides: {},
};

function projectData(snapshot = palette.tokenSnapshot) {
  return { ...palette, tokenSnapshot: snapshot, title: "Saved", colorHistory: [] };
}

function seedPost(id: string, publishedAt: number, likeCount: number, status: StoredPost["status"] = "published"): StoredPost {
  return {
    id,
    ownerUid: "owner",
    authorName: "Ada",
    title: id,
    description: "",
    tags: [],
    status,
    publishedAt,
    updatedAt: publishedAt,
    schemaVersion: 1,
    engineVersion: "2.1.0",
    likeCount,
    viewCount: 0,
    palette,
  };
}

describe("community palette cards", () => {
  it("uses only the five snapshot tokens and leaves missing colors empty", () => {
    const dots = paletteDots({ "primary.default": "#abcdef", "surface.default": "#ffffff" });
    expect(dots.map((dot) => dot.hex)).toEqual(["#ABCDEF", null, null, "#FFFFFF", null]);
    expect(dots.map((dot) => dot.path)).toEqual([
      "primary.default",
      "secondary.default",
      "accent.default",
      "surface.default",
      "text.primary",
    ]);
  });

  it("keeps every card when one row expands", () => {
    const rows = communityRows(["a", "b", "c", "d", "e"], 2, 2);
    expect(rows.map((row) => row.cards)).toEqual([["a", "b"], ["c", "d"], ["e"]]);
    expect(rows.map((row) => row.detailIndex)).toEqual([null, 2, null]);
    expect(columnCountForWidth(320)).toBe(2);
    expect(columnCountForWidth(140)).toBe(1);
    expect(columnCountForWidth(520)).toBe(3);
  });

  it("reads projects that have no provenance", () => {
    expect(readProjectSource(undefined)).toBeNull();
    expect(readProjectSource({ kind: "community", postId: "abc", authorName: "Ada", href: "/community?post=abc" })).toBeNull();
    expect(readProjectSource({
      kind: "community",
      postId: "abcdef12",
      authorName: "Ada",
      href: "/community?post=abcdef12",
    })?.href).toBe("/community?post=abcdef12");
  });
});

describe("community pages", () => {
  const posts = [
    seedPost("bbbbbbbb", 300, 1),
    seedPost("aaaaaaaa", 300, 4),
    seedPost("cccccccc", 200, 9, "hidden"),
    seedPost("dddddddd", 100, 4),
  ];

  it("orders published posts and keeps a cursor for a full page", () => {
    const page = slicePosts(posts, "liked", null);
    expect(page.items.map((post) => post.id)).toEqual(["aaaaaaaa", "dddddddd", "bbbbbbbb"]);
    expect(page.items.every((post) => !("ownerUid" in post))).toBe(true);
    expect(page.items.some((post) => post.status)).toBe(false);

    const many = Array.from({ length: 13 }, (_, index) => seedPost(`p${index.toString(16).padStart(7, "0")}`, 1_000 - index, index));
    const first = slicePosts(many, "latest", null);
    expect(first.items).toHaveLength(12);
    expect(first.nextCursor).toBeTruthy();
    const cursor = decodeCommunityCursor(first.nextCursor!, "latest");
    const second = slicePosts(many, "latest", cursor);
    expect(second.items.map((post) => post.id)).toEqual([many[12].id]);
    expect(second.nextCursor).toBeNull();
    expect(encodeCommunityCursor(cursor!)).toBe(first.nextCursor);
  });

  it("rejects a cursor for a different sort and ignores client like counts", () => {
    const cursor = encodeCommunityCursor({ sort: "latest", publishedAt: 10, id: "abcdef12" });
    expect(decodeCommunityCursor(cursor, "liked")).toBeNull();
    expect(parsePostPatch({ title: "Named", likeCount: 99, ownerUid: "other" })).toEqual({ title: "Named" });
  });
});

describe("community writes", () => {
  function database() {
    const db = new MemoryCommunityDb();
    db.docs.set("users/owner/projects/slot-1", projectData());
    db.docs.set("users/owner", { plan: "free", displayName: "Ada" });
    db.docs.set("users/pro", { plan: "pro" });
    return db;
  }

  it("publishes one post for the same project and keeps the first publish time", async () => {
    const db = database();
    const first = await publishPost(db, "owner", {
      projectId: "slot-1",
      title: "Apricot",
      description: "",
      tags: ["#soft"],
    }, 1_000, "post0001");
    expect(first.post.authorName).toBe("Ada");
    const second = await publishPost(db, "owner", {
      projectId: "slot-1",
      title: "Changed",
      description: "",
      tags: [],
    }, 2_000, "post0002");
    expect(second.created).toBe(false);
    expect(second.post.id).toBe(first.post.id);
    expect([...db.docs.keys()].filter((path) => path.startsWith("communityPosts/"))).toEqual(["communityPosts/post0001"]);

    db.docs.set("users/owner/projects/slot-1", projectData({ ...palette.tokenSnapshot, "primary.default": "#00FF00" }));
    const updated = await updatePost(db, "owner", first.post.id, { title: "Renamed", refreshPalette: true }, 3_000);
    expect(updated.publishedAt).toBe(1_000);
    expect(updated.title).toBe("Renamed");
    expect(updated.palette.tokenSnapshot["primary.default"]).toBe("#00FF00");
    await expect(updatePost(db, "stranger", first.post.id, { title: "Nope" }, 4_000)).rejects.toMatchObject({ status: 403 });
  });

  it("changes a like only when the requested state differs", async () => {
    const db = database();
    const published = await publishPost(db, "owner", {
      projectId: "slot-1",
      title: "Apricot",
      description: "",
      tags: [],
    }, 1_000, "post0001");
    db.reads = 0;
    db.writes = 0;
    const liked = await setPostLike(db, "fan", published.post.id, true, 2_000);
    expect(liked).toEqual({ liked: true, likeCount: 1 });
    const repeated = await setPostLike(db, "fan", published.post.id, true, 2_100);
    expect(repeated.likeCount).toBe(1);
    const removed = await setPostLike(db, "fan", published.post.id, false, 2_200);
    expect(removed).toEqual({ liked: false, likeCount: 0 });
    const stillOff = await setPostLike(db, "fan", published.post.id, false, 2_300);
    expect(stillOff.likeCount).toBe(0);
    await updatePost(db, "owner", published.post.id, { status: "hidden" }, 3_000);
    await expect(setPostLike(db, "fan", published.post.id, true, 3_100)).rejects.toMatchObject({ status: 404 });
    expect(db.docs.get("communityPosts/post0001")?.likeCount).toBe(0);
  });

  it("copies into one private project and blocks a hidden original", async () => {
    const db = database();
    const published = await publishPost(db, "owner", {
      projectId: "slot-1",
      title: "Apricot",
      description: "",
      tags: [],
    }, 1_000, "post0001");
    const intent = "11111111-1111-4111-8111-111111111111";
    const first = await copyPost(db, "owner", published.post.id, "Copy", intent, 2_000);
    const second = await copyPost(db, "owner", published.post.id, "Copy", intent, 2_100);
    expect(first.created).toBe(true);
    expect(second).toMatchObject({ created: false, projectId: first.projectId });
    expect(db.docs.get(`users/owner/projects/${first.projectId}`)?.source).toMatchObject({
      kind: "community",
      postId: "post0001",
    });
    expect(db.docs.get(`users/owner/projects/${first.projectId}`)?.colorHistory).toEqual([]);
    await deletePost(db, "owner", published.post.id, 3_000);
    await expect(copyPost(db, "owner", published.post.id, "Again", "22222222-2222-4222-8222-222222222222", 3_100)).rejects.toMatchObject({ status: 404 });
    expect(db.docs.get(`users/owner/projects/${first.projectId}`)?.title).toBe("Copy");
  });

  it("counts one view per viewer and keeps the account name", async () => {
    const db = database();
    const published = await publishPost(db, "owner", {
      projectId: "slot-1",
      title: "Apricot",
      description: "",
      tags: ["#soft", "@calm"],
    }, 1_000, "post0001");
    const viewer = "11111111-1111-4111-8111-111111111111";
    expect(await recordPostView(db, published.post.id, viewer, 2_000)).toBe(1);
    expect(await recordPostView(db, published.post.id, viewer, 2_100)).toBe(1);
    expect(published.post.authorName).toBe("Ada");
    expect(parseTags(["soft"])).toBeNull();
    expect(parsePublishInput({ projectId: "slot-1", title: "Apricot", description: "x".repeat(81), tags: ["#soft"] })).toBeNull();
    expect(parsePublishInput({ projectId: "slot-1", title: "Apricot", description: "짧은 설명", tags: ["#soft"] })?.description).toBe("짧은 설명");
  });
});
