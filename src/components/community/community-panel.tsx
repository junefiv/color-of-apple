"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Eye, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { PaletteDots } from "@/components/community/palette-dots";
import { PublishDialog } from "@/components/community/publish-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uiToast } from "@/components/ui/toast";
import { useCopy } from "@/hooks/use-copy";
import {
  CommunityRequestError,
  copyCommunityPost,
  deleteCommunityPost,
  fetchCommunityPost,
  fetchLikeStatus,
  fetchMyPosts,
  fetchPublicPosts,
  patchCommunityPost,
  reportCommunityPost,
  setCommunityLike,
  recordCommunityView,
} from "@/lib/community/client";
import { columnCountForWidth, communityRows } from "@/lib/community/layout";
import {
  cachedLike,
  clearCommunityIntent,
  readCommunityIntent,
  readCommunitySession,
  rememberLike,
  syncLikeCache,
  uncachedLikeIds,
  writeCommunityIntent,
  writeCommunitySession,
} from "@/lib/community/session";
import type { CommunityPost, CommunitySort } from "@/lib/community/types";
import { encodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";

type Bucket = {
  items: CommunityPost[];
  cursor: string | null;
  done: boolean;
  error: boolean;
  loaded: boolean;
};

function emptyBucket(): Bucket {
  return { items: [], cursor: null, done: false, error: false, loaded: false };
}

function mergePosts(current: CommunityPost[], incoming: CommunityPost[]) {
  const seen = new Set(current.map((post) => post.id));
  return [...current, ...incoming.filter((post) => !seen.has(post.id))];
}

export function CommunityPanel({
  mode,
  selectedId,
  onSelect,
  onProjectLimit,
}: {
  mode: "edit" | "community";
  selectedId: string | null;
  onSelect: (post: CommunityPost | null) => void;
  onProjectLimit: () => void;
}) {
  const copy = useCopy();
  const locale = useMatchuStore((state) => state.locale);
  const router = useRouter();
  const params = useSearchParams();
  const { user, signIn } = useAuth();
  const [sort, setSort] = useState<CommunitySort>("latest");
  const [buckets, setBuckets] = useState<Record<CommunitySort, Bucket>>({ latest: emptyBucket(), liked: emptyBucket(), mine: emptyBucket() });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [columns, setColumns] = useState(2);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<"unavailable" | "unsupported" | null>(null);
  const [copyPost, setCopyPost] = useState<CommunityPost | null>(null);
  const [copyTitle, setCopyTitle] = useState("");
  const [copyIntent, setCopyIntent] = useState("");
  const [savedCopy, setSavedCopy] = useState<Awaited<ReturnType<typeof copyCommunityPost>> | null>(null);
  const [reportPost, setReportPost] = useState<CommunityPost | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [editPost, setEditPost] = useState<CommunityPost | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const bucketsRef = useRef(buckets);
  const loadingRef = useRef(false);
  const userScrolled = useRef(false);
  const expanding = useRef(false);
  const generation = useRef<Record<CommunitySort, number>>({ latest: 0, liked: 0, mine: 0 });
  const directFetch = useRef<string | null>(null);
  bucketsRef.current = buckets;
  const bucket = buckets[sort];
  const rows = useMemo(() => communityRows(bucket.items, bucket.items.findIndex((post) => post.id === expandedId), columns), [bucket.items, columns, expandedId]);

  function choose(post: CommunityPost, updateUrl: boolean) {
    onSelect(post);
    writeCommunitySession(post);
    if (updateUrl && mode === "community") {
      const next = `/community?post=${post.id}`;
      if (`${window.location.pathname}${window.location.search}` !== next) window.history.replaceState(null, "", next);
    }
  }

  async function load(nextSort: CommunitySort, reset: boolean) {
    if (nextSort === "mine" && !user) return;
    const current = bucketsRef.current[nextSort];
    if (!reset && (current.done || current.error || loadingRef.current)) return;
    const cursor = reset ? null : current.cursor;
    if (!reset && loadingRef.current) return;
    const gen = (generation.current[nextSort] ?? 0) + (reset ? 1 : 0);
    if (reset) generation.current[nextSort] = gen;
    const activeGen = generation.current[nextSort];
    loadingRef.current = true;
    setBuckets((state) => ({ ...state, [nextSort]: { ...state[nextSort], error: false } }));
    try {
      const page = nextSort === "mine"
        ? await fetchMyPosts(user!, cursor)
        : await fetchPublicPosts(nextSort, cursor);
      if (generation.current[nextSort] !== activeGen) return;
      setBuckets((state) => {
        const previous = reset ? emptyBucket() : state[nextSort];
        return {
          ...state,
          [nextSort]: {
            items: mergePosts(reset ? [] : previous.items, page.items),
            cursor: page.nextCursor,
            done: page.nextCursor === null,
            error: false,
            loaded: true,
          },
        };
      });
    } catch {
      if (generation.current[nextSort] !== activeGen) return;
      setBuckets((state) => ({ ...state, [nextSort]: { ...state[nextSort], error: true, loaded: true } }));
    } finally {
      if (generation.current[nextSort] === activeGen) loadingRef.current = false;
    }
  }

  useEffect(() => { syncLikeCache(user?.uid ?? null); setLikes({}); }, [user?.uid]);

  useEffect(() => {
    if (bucket.loaded || bucket.error) return;
    if (sort === "mine" && !user) return;
    void load(sort, true);
    // The first page for a sort loads once. Later pages wait for a real scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, user, bucket.loaded, bucket.error]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => setColumns(columnCountForWidth(root.clientWidth)));
    observer.observe(root);
    setColumns(columnCountForWidth(root.clientWidth));
    return () => observer.disconnect();
  }, [sort, bucket.loaded]);

  useEffect(() => {
    const root = scrollerRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !bucket.loaded || bucket.done || bucket.error) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      if (!userScrolled.current || expanding.current || loadingRef.current) return;
      void load(sort, false);
    }, { root, rootMargin: "160px 0px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, bucket.cursor, bucket.done, bucket.loaded, bucket.error, bucket.items.length]);

  useEffect(() => {
    if (!user) return;
    const missing = uncachedLikeIds(bucket.items.map((post) => post.id)).slice(0, 12);
    if (missing.length === 0) return;
    let cancel = false;
    void fetchLikeStatus(user, missing).then((result) => {
      if (cancel) return;
      for (const [postId, liked] of Object.entries(result.likes)) rememberLike(postId, liked);
      setLikes((current) => ({ ...current, ...result.likes }));
    }).catch(() => undefined);
    return () => { cancel = true; };
  }, [bucket.items, user]);

  useEffect(() => {
    if (!user) return;
    const intent = readCommunityIntent();
    if (!intent) return;
    clearCommunityIntent();
    if (intent.kind === "like") void toggleLike(intent.postId, intent.liked);
    if (intent.kind === "copy") {
      setCopyIntent(intent.intentId);
      setCopyTitle(intent.title);
      const post = bucket.items.find((item) => item.id === intent.postId) ?? null;
      if (post) setCopyPost(post);
    }
    // Resume only the intent captured before sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const requested = mode === "community" ? params.get("post") : readCommunitySession()?.postId ?? null;
    if (!requested || requested === selectedId) return;
    const found = bucket.items.find((post) => post.id === requested);
    if (found) {
      choose(found, false);
      return;
    }
    const session = readCommunitySession();
    if (!params.get("post") && session?.post?.id === requested) {
      choose(session.post, false);
      return;
    }
    if (!bucket.loaded || directFetch.current === requested) return;
    directFetch.current = requested;
    let cancel = false;
    void fetchCommunityPost(requested, user).then((result) => {
      if (!cancel) choose(result.post, false);
    }).catch((error: unknown) => {
      if (cancel) return;
      setNotice(error instanceof CommunityRequestError && error.status === 422 ? "unsupported" : "unavailable");
    });
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket.items, bucket.loaded, mode, params, selectedId, user]);

  function changeSort(next: CommunitySort) {
    userScrolled.current = false;
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    setExpandedId(null);
    setSort(next);
  }

  function toggleCard(post: CommunityPost, row: HTMLDivElement | null) {
    const scroller = scrollerRef.current;
    const before = row?.getBoundingClientRect().top ?? 0;
    const opening = expandedId !== post.id;
    expanding.current = true;
    setExpandedId((current) => current === post.id ? null : post.id);
    choose(post, true);
    if (opening) void countView(post.id);
    window.requestAnimationFrame(() => {
      const after = row?.getBoundingClientRect().top ?? before;
      if (scroller) scroller.scrollTop += after - before;
      window.setTimeout(() => { expanding.current = false; }, 350);
    });
  }

  async function countView(postId: string) {
    const viewerId = communityViewerId();
    if (!viewerId) return;
    try {
      const result = await recordCommunityView(postId, viewerId);
      setBuckets((state) => {
        const next = { ...state };
        for (const key of ["latest", "liked", "mine"] as const) {
          next[key] = {
            ...next[key],
            items: next[key].items.map((post) => post.id === postId ? { ...post, viewCount: result.viewCount } : post),
          };
        }
        return next;
      });
    } catch {
      // A missed view count should not block opening the palette.
    }
  }

  async function toggleLike(postId: string, liked: boolean) {
    if (!user) {
      writeCommunityIntent({ kind: "like", postId, liked });
      try { await signIn(); } catch { uiToast.error(copy.community.loginMine, locale); }
      return;
    }
    const previous = cachedLike(postId) === true;
    const previousCount = bucket.items.find((post) => post.id === postId)?.likeCount ?? 0;
    rememberLike(postId, liked);
    setLikes((current) => ({ ...current, [postId]: liked }));
    setBuckets((state) => ({
      ...state,
      [sort]: {
        ...state[sort],
        items: state[sort].items.map((post) => post.id === postId ? { ...post, likeCount: Math.max(0, previousCount + (liked === previous ? 0 : liked ? 1 : -1)) } : post),
      },
    }));
    try {
      const result = await setCommunityLike(user, postId, liked);
      rememberLike(postId, result.liked);
      setLikes((current) => ({ ...current, [postId]: result.liked }));
      setBuckets((state) => {
        const next = { ...state };
        for (const key of ["latest", "liked", "mine"] as const) {
          next[key] = {
            ...next[key],
            items: next[key].items.map((post) => post.id === postId ? { ...post, likeCount: result.likeCount } : post),
          };
        }
        return next;
      });
    } catch {
      rememberLike(postId, previous);
      setLikes((current) => ({ ...current, [postId]: previous }));
      setBuckets((state) => ({
        ...state,
        [sort]: {
          ...state[sort],
          items: state[sort].items.map((post) => post.id === postId ? { ...post, likeCount: previousCount } : post),
        },
      }));
      uiToast.error(locale === "ko" ? "좋아요를 반영하지 못했습니다." : "Could not update the like.", locale);
    }
  }

  function replacePost(postId: string, next: CommunityPost | null) {
    setBuckets((state) => {
      const apply = (key: CommunitySort, items: CommunityPost[]) => items.flatMap((item) => {
        if (item.id !== postId) return [item];
        if (!next || (key !== "mine" && next.status === "hidden")) return [];
        return [{ ...next, status: key === "mine" ? next.status : undefined }];
      });
      return {
        latest: { ...state.latest, items: apply("latest", state.latest.items) },
        liked: { ...state.liked, items: apply("liked", state.liked.items) },
        mine: { ...state.mine, items: apply("mine", state.mine.items) },
      };
    });
    if (!next && selectedId === postId) onSelect(null);
  }

  async function mutate(post: CommunityPost, body: Parameters<typeof patchCommunityPost>[2]) {
    if (!user) return;
    setBusy(true);
    try {
      const result = await patchCommunityPost(user, post.id, body);
      replacePost(post.id, result.post);
      if (selectedId === post.id && result.post.status !== "hidden") choose(result.post, false);
      uiToast.success(body.status === "hidden" ? copy.community.hidden : copy.community.updated, locale);
    } catch {
      uiToast.error(locale === "ko" ? "게시물을 바꾸지 못했습니다." : "Could not update the post.", locale);
    } finally {
      setBusy(false);
    }
  }

  async function remove(post: CommunityPost) {
    if (!user) return;
    setBusy(true);
    try {
      await deleteCommunityPost(user, post.id);
      replacePost(post.id, null);
      setExpandedId(null);
      uiToast.success(copy.community.deleted, locale);
    } catch {
      uiToast.error(locale === "ko" ? "게시물을 삭제하지 못했습니다." : "Could not delete the post.", locale);
    } finally {
      setBusy(false);
    }
  }

  async function saveCopy() {
    if (!copyPost || !copyTitle.trim() || busy) return;
    const intentId = copyIntent || crypto.randomUUID();
    setCopyIntent(intentId);
    if (!user) {
      writeCommunityIntent({ kind: "copy", postId: copyPost.id, title: copyTitle.trim(), intentId });
      try { await signIn(); } catch { uiToast.error(copy.community.loginMine, locale); }
      return;
    }
    setBusy(true);
    try {
      const saved = await copyCommunityPost(user, copyPost.id, copyTitle.trim(), intentId);
      setSavedCopy(saved);
      uiToast.success(copy.community.copied, locale);
    } catch (error) {
      if (error instanceof CommunityRequestError && error.code === "project_limit") onProjectLimit();
      else uiToast.error(locale === "ko" ? "컬러북에 저장하지 못했습니다." : "Could not save to your colorbook.", locale);
    } finally {
      setBusy(false);
    }
  }

  function openSavedCopy() {
    if (!savedCopy) return;
    const payload = encodeShare({
      input: savedCopy.input,
      selectedPaletteId: savedCopy.selectedPaletteId,
      overrides: savedCopy.overrides,
      tokenSnapshot: savedCopy.tokenSnapshot,
      projectTitle: savedCopy.title,
      source: savedCopy.source,
    });
    router.push(`/result?d=${payload}&p=${savedCopy.projectId}`);
  }

  return (
    <div className="community-panel">
      <div className="community-sorts" role="tablist" aria-label={copy.community.entry}>
        {(["latest", "liked", "mine"] as const).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={sort === key} className="community-sort" onClick={() => changeSort(key)}>
            {copy.community[key]}
          </button>
        ))}
        <button type="button" className="community-refresh" aria-label={copy.community.refresh} onClick={() => { generation.current[sort] += 1; void load(sort, true); }}>
          <RefreshCw aria-hidden />
        </button>
      </div>
      {notice ? (
        <div className="community-notice">
          <p>{notice === "unsupported" ? copy.community.unsupported : copy.community.unavailable}</p>
          <Button size="sm" variant="outline" onClick={() => { setNotice(null); if (mode === "community") window.history.replaceState(null, "", "/community"); }}>{copy.community.backToList}</Button>
        </div>
      ) : null}
      <div
        ref={scrollerRef}
        className="community-scroller"
        onScroll={(event) => { if (event.currentTarget.scrollTop > 8) userScrolled.current = true; }}
      >
        {!bucket.loaded && !bucket.error && !(sort === "mine" && !user) ? <p className="community-empty">{copy.community.loading}</p> : null}
        {sort === "mine" && !user ? (
          <div className="community-empty">
            <p>{copy.community.loginMine}</p>
            <Button size="sm" onClick={() => { void signIn(); }}>{copy.community.login}</Button>
          </div>
        ) : bucket.items.length === 0 && bucket.loaded && !bucket.error ? (
          <p className="community-empty">{sort === "mine" ? copy.community.emptyMine : copy.community.empty}</p>
        ) : (
          rows.map((row, rowIndex) => (
            <div key={row.cards.map((post) => post.id).join("-") || rowIndex} className="community-row" ref={(node) => { if (node && row.detailIndex !== null) node.dataset.expanded = "true"; }}>
              <div className="community-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {row.cards.map((post) => {
                  const liked = likes[post.id] ?? cachedLike(post.id) === true;
                  return (
                    <article key={post.id} className="community-card" data-selected={post.id === selectedId || undefined}>
                      <button type="button" className="community-card-select" aria-pressed={post.id === selectedId} onClick={(event) => toggleCard(post, event.currentTarget.closest(".community-row"))}>
                        <PaletteDots snapshot={post.palette.tokenSnapshot} labels={copy.community.roles} missingLabel={copy.community.missingColor} />
                      </button>
                      <div className="community-card-stats">
                        <button type="button" className="community-like" aria-pressed={liked} aria-label={liked ? copy.community.unlike : copy.community.like} onClick={() => { void toggleLike(post.id, !liked); }}>
                          <Heart aria-hidden fill={liked ? "currentColor" : "none"} />
                          <span>{post.likeCount}</span>
                        </button>
                        <span className="community-views" aria-label={`${copy.community.views} ${post.viewCount}`}>
                          <Eye aria-hidden />
                          <span>{post.viewCount}</span>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
              {row.detailIndex !== null ? (
                <CommunityDetail
                  post={bucket.items[row.detailIndex]}
                  liked={likes[bucket.items[row.detailIndex].id] ?? false}
                  busy={busy}
                  copy={copy}
                  locale={locale}
                  onClose={() => setExpandedId(null)}
                  onLike={(liked) => { void toggleLike(bucket.items[row.detailIndex!].id, liked); }}
                  onCopy={() => {
                    const post = bucket.items[row.detailIndex!];
                    setSavedCopy(null);
                    setCopyTitle(post.title);
                    setCopyIntent(crypto.randomUUID());
                    setCopyPost(post);
                  }}
                  onShare={() => {
                    const post = bucket.items[row.detailIndex!];
                    void navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`).then(
                      () => uiToast.success(copy.community.shared, locale),
                      () => uiToast.error(copy.result.shareFailed, locale),
                    );
                  }}
                  onReport={() => { setReportReason(""); setReportPost(bucket.items[row.detailIndex!]); }}
                  onEdit={() => setEditPost(bucket.items[row.detailIndex!])}
                  onHide={() => { void mutate(bucket.items[row.detailIndex!], { status: bucket.items[row.detailIndex!].status === "hidden" ? "published" : "hidden" }); }}
                  onRefreshPalette={() => { void mutate(bucket.items[row.detailIndex!], { refreshPalette: true }); }}
                  onDelete={() => { void remove(bucket.items[row.detailIndex!]); }}
                />
              ) : null}
            </div>
          ))
        )}
        {bucket.error ? <Button size="sm" variant="outline" onClick={() => { void load(sort, bucket.items.length === 0); }}>{copy.community.retry}</Button> : null}
        {bucket.done && bucket.items.length > 0 ? <p className="community-end">{copy.community.end}</p> : null}
        <div ref={sentinelRef} className="community-sentinel" aria-hidden />
      </div>
      {!selectedId ? <p className="community-pick">{copy.community.pick}</p> : null}

      <Dialog open={Boolean(copyPost)} onOpenChange={(open) => { if (!open) { setCopyPost(null); setSavedCopy(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{copy.community.save}</DialogTitle></DialogHeader>
          {copyPost ? <PaletteDots snapshot={copyPost.palette.tokenSnapshot} labels={copy.community.roles} missingLabel={copy.community.missingColor} large /> : null}
          <label className="grid gap-1.5 text-sm font-medium">
            {copy.community.name}
            <Input value={copyTitle} maxLength={60} onChange={(event) => setCopyTitle(event.target.value)} />
          </label>
          <DialogFooter>
            {savedCopy ? <Button onClick={openSavedCopy}>{copy.community.openSaved}</Button> : <Button disabled={!copyTitle.trim() || busy} onClick={() => { void saveCopy(); }}>{busy ? copy.community.loading : copy.community.save}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reportPost)} onOpenChange={(open) => { if (!open) setReportPost(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{copy.community.report}</DialogTitle></DialogHeader>
          <Textarea value={reportReason} maxLength={500} onChange={(event) => setReportReason(event.target.value)} />
          <DialogFooter>
            <Button disabled={!reportReason.trim() || busy} onClick={() => {
              if (!reportPost) return;
              void (async () => {
                if (!user) {
                  try { await signIn(); } catch { return; }
                  return;
                }
                setBusy(true);
                try {
                  await reportCommunityPost(user, reportPost.id, reportReason.trim());
                  uiToast.success(copy.community.reported, locale);
                  setReportPost(null);
                } catch {
                  uiToast.error(locale === "ko" ? "신고를 보내지 못했습니다." : "Could not send the report.", locale);
                } finally {
                  setBusy(false);
                }
              })();
            }}>{copy.community.report}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editPost ? (
        <PublishDialog
          open
          onOpenChange={(open) => { if (!open) setEditPost(null); }}
          snapshot={editPost.palette.tokenSnapshot}
          defaultTitle={editPost.title}
          existingPostId={editPost.id}
          onSaved={(post) => replacePost(post.id, post)}
        />
      ) : null}
    </div>
  );
}

function CommunityDetail({
  post,
  liked,
  busy,
  copy,
  locale,
  onClose,
  onLike,
  onCopy,
  onShare,
  onReport,
  onEdit,
  onHide,
  onRefreshPalette,
  onDelete,
}: {
  post: CommunityPost;
  liked: boolean;
  busy: boolean;
  copy: ReturnType<typeof useCopy>;
  locale: "ko" | "en";
  onClose: () => void;
  onLike: (liked: boolean) => void;
  onCopy: () => void;
  onShare: () => void;
  onReport: () => void;
  onEdit: () => void;
  onHide: () => void;
  onRefreshPalette: () => void;
  onDelete: () => void;
}) {
  const date = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(post.publishedAt));
  return (
    <section className="community-detail">
      <PaletteDots snapshot={post.palette.tokenSnapshot} labels={copy.community.roles} missingLabel={copy.community.missingColor} large />
      <div className="community-detail-copy">
        <h2>{post.title}</h2>
        {post.description ? <p className="community-detail-body">{post.description}</p> : null}
        <p className="community-detail-meta">{post.authorName} · {date}{post.status ? ` · ${post.status === "hidden" ? copy.community.statusHidden : copy.community.statusPublished}` : ""}</p>
        {post.tags.length > 0 ? <ul className="community-tags">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}
      </div>
      <div className="community-detail-actions">
        <Button size="sm" variant={liked ? "secondary" : "outline"} aria-pressed={liked} onClick={() => onLike(!liked)}>
          <Heart aria-hidden fill={liked ? "currentColor" : "none"} />{liked ? copy.community.unlike : copy.community.like}
        </Button>
        <Button size="sm" onClick={onCopy}>{copy.community.save}</Button>
        <Button size="sm" variant="outline" onClick={onShare}>{copy.community.share}</Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="community-more">{copy.community.more}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onReport}>{copy.community.report}</DropdownMenuItem>
            {post.status ? <DropdownMenuItem disabled={busy} onClick={onEdit}>{copy.community.edit}</DropdownMenuItem> : null}
            {post.status ? <DropdownMenuItem disabled={busy} onClick={onRefreshPalette}>{copy.community.updatePalette}</DropdownMenuItem> : null}
            {post.status ? <DropdownMenuItem disabled={busy} onClick={onHide}>{post.status === "hidden" ? copy.community.republish : copy.community.hide}</DropdownMenuItem> : null}
            {post.status ? <DropdownMenuItem disabled={busy} variant="destructive" onClick={onDelete}>{copy.community.remove}</DropdownMenuItem> : null}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="ghost" onClick={onClose}>{copy.community.close}</Button>
      </div>
    </section>
  );
}

function communityViewerId() {
  const key = "matchu-community-viewer";
  try {
    const existing = window.localStorage.getItem(key);
    if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(existing)) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return null;
  }
}
