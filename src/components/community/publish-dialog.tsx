"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PaletteDots } from "@/components/community/palette-dots";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uiToast } from "@/components/ui/toast";
import { fetchCommunityPost, patchCommunityPost, publishCommunityPost } from "@/lib/community/client";
import type { CommunityPost } from "@/lib/community/types";
import { COMMUNITY_DESCRIPTION_MAX, tagsFromDraft } from "@/lib/community/validate";
import { useCopy } from "@/hooks/use-copy";
import { useMatchuStore } from "@/lib/store";

export function PublishDialog({
  open,
  onOpenChange,
  snapshot,
  projectId,
  defaultTitle,
  existingPostId = null,
  needsSave = false,
  onSaveFirst,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: Record<string, string>;
  projectId?: string;
  defaultTitle: string;
  existingPostId?: string | null;
  needsSave?: boolean;
  onSaveFirst?: () => Promise<boolean>;
  onSaved?: (post: CommunityPost) => void;
}) {
  const copy = useCopy();
  const locale = useMatchuStore((state) => state.locale);
  const { user, signIn } = useAuth();
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [paletteSnapshot, setPaletteSnapshot] = useState(snapshot);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(defaultTitle);
    setDescription("");
    setTags("");
    setPaletteSnapshot(snapshot);
    if (!existingPostId) return;
    let cancel = false;
    void (async () => {
      try {
        const currentUser = user ?? await signIn();
        const result = await fetchCommunityPost(existingPostId, currentUser);
        if (cancel) return;
        setTitle(result.post.title);
        setDescription(result.post.description.slice(0, COMMUNITY_DESCRIPTION_MAX));
        setTags(result.post.tags.map((tag) => /^[@#]/.test(tag) ? tag : `#${tag}`).join(" "));
        setPaletteSnapshot(result.post.palette.tokenSnapshot);
      } catch {
        if (!cancel) uiToast.error(copy.community.unavailable, locale);
      }
    })();
    return () => { cancel = true; };
  }, [copy.community.unavailable, defaultTitle, existingPostId, locale, open, signIn, snapshot, user]);

  const parsedTags = tagsFromDraft(tags);
  const canSubmit = title.trim().length > 0 && title.trim().length <= 60 && description.length <= COMMUNITY_DESCRIPTION_MAX && parsedTags.valid;

  async function submit() {
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      if (needsSave && onSaveFirst) {
        const saved = await onSaveFirst();
        if (!saved) return;
      }
      const currentUser = user ?? await signIn();
      const body = {
        title: title.trim(),
        description: description.trim(),
        tags: parsedTags.tags,
      };
      const result = existingPostId
        ? await patchCommunityPost(currentUser, existingPostId, body)
        : await publishCommunityPost(currentUser, { ...body, projectId: projectId ?? "" });
      onSaved?.(existingPostId ? result.post : result.post);
      uiToast.success(existingPostId ? copy.community.updated : copy.community.published, locale);
      onOpenChange(false);
    } catch {
      uiToast.error(locale === "ko" ? "게시하지 못했습니다. 다시 시도해 주세요." : "Could not publish. Please try again.", locale);
    } finally {
      setBusy(false);
    }
  }

  const action = needsSave ? copy.community.saveAndPublish : existingPostId ? copy.community.update : copy.community.publish;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{existingPostId ? copy.community.manage : copy.community.publish}</DialogTitle>
          <DialogDescription>{copy.community.disclosure}</DialogDescription>
        </DialogHeader>
        <PaletteDots snapshot={paletteSnapshot} labels={copy.community.roles} missingLabel={copy.community.missingColor} large />
        <label className="grid gap-1.5 text-sm font-medium">
          {copy.community.title}
          <Input value={title} maxLength={60} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span className="flex items-baseline justify-between gap-2">
            {copy.community.description}
            <span className="text-[11px] font-normal text-[var(--text-secondary)]">{description.length}/{COMMUNITY_DESCRIPTION_MAX}</span>
          </span>
          <Textarea value={description} maxLength={COMMUNITY_DESCRIPTION_MAX} rows={3} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span className="flex items-baseline justify-between gap-2">
            {copy.community.tags}
            <span className="text-[11px] font-normal text-[var(--text-secondary)]">{copy.community.tagsSearch}</span>
          </span>
          <Input value={tags} placeholder="#soft @calm" onChange={(event) => setTags(event.target.value)} aria-invalid={!parsedTags.valid} />
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{locale === "ko" ? "취소" : "Cancel"}</Button>
          <Button disabled={!canSubmit || busy || (!existingPostId && !projectId)} onClick={() => { void submit(); }}>{busy ? copy.community.loading : action}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
