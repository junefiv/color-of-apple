"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Library, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uiToast } from "@/components/ui/toast";
import { trackProductEvent } from "@/lib/analytics";
import { generateColorSystem } from "@/lib/color-engine";
import { deleteProject, subscribeProjects, type SavedProject } from "@/lib/firebase/data";
import { encodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";

export function ProjectLibraryDialog({
  open,
  onOpenChange,
  currentProjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId: string | null;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(null);
  const [historyProject, setHistoryProject] = useState<SavedProject | null>(null);

  useEffect(() => {
    if (!open || !user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeProjects(user.uid, (next) => {
      setProjects(next);
      setLoading(false);
    });
  }, [open, user]);

  const projectColors = useMemo(() => Object.fromEntries(
    projects.map((project) => [project.id, projectColorSummary(project)]),
  ), [projects]);

  function openProject(project: SavedProject) {
    const payload = encodeShare({
      input: project.input,
      selectedPaletteId: project.selectedPaletteId,
      overrides: project.overrides,
      tokenSnapshot: project.tokenSnapshot,
      projectTitle: project.title,
    });
    void trackProductEvent("project_opened", { source: "token_panel" });
    onOpenChange(false);
    router.push(`/result?d=${payload}&p=${encodeURIComponent(project.id)}`);
  }

  async function removeProject(project: SavedProject) {
    if (!user) return;
    try {
      await deleteProject(user.uid, project.id);
      setProjectToDelete(null);
      uiToast.success(isKo ? "저장한 컬러를 삭제했어요." : "Saved colors deleted.", locale);
      if (project.id === currentProjectId) router.replace("/result");
    } catch {
      uiToast.error(isKo ? "저장한 컬러를 삭제하지 못했습니다." : "Could not delete the saved colors.", locale);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[88dvh] overflow-hidden sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Library className="size-4" aria-hidden />
              {isKo ? "저장한 컬러" : "Saved colors"}
            </DialogTitle>
            <DialogDescription>
              {isKo ? "저장한 컬러를 선택해 현재 작업 화면에서 엽니다." : "Choose saved colors to open in the current workspace."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-36 overflow-y-auto pr-1">
            {loading ? (
              <p className="grid min-h-36 place-items-center text-sm text-muted-foreground">{isKo ? "저장한 컬러를 불러오는 중…" : "Loading saved colors…"}</p>
            ) : projects.length === 0 ? (
              <div className="grid min-h-36 place-items-center rounded-xl border border-dashed p-5 text-center">
                <div>
                  <Library className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden />
                  <p className="font-medium">{isKo ? "저장한 컬러가 없습니다." : "No saved colors yet."}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{isKo ? "현재 컬러를 저장하면 여기에 표시됩니다." : "Save the current colors and they will appear here."}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {projects.map((project) => {
                  const colors = projectColors[project.id];
                  const isCurrent = project.id === currentProjectId;
                  return (
                    <article key={project.id} className={`rounded-xl border p-3 ${isCurrent ? "border-[var(--color-primary-default)] bg-[var(--color-primary-selected)]" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => isCurrent ? onOpenChange(false) : openProject(project)}>
                          <span className="flex items-center gap-2">
                            <strong className="truncate text-sm">{project.title}</strong>
                            {isCurrent ? <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-[9px] font-semibold">{isKo ? "현재 컬러" : "Current"}</span> : null}
                          </span>
                          <span className="mt-2 flex flex-col gap-1.5">
                            <ProjectColorChip label="P" value={colors.primary} />
                            <ProjectColorChip label="S" value={colors.secondary} />
                            <ProjectColorChip label="A" value={colors.accent} />
                          </span>
                          <span className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock3 className="size-3" aria-hidden />
                            {isKo ? "마지막 수정" : "Updated"} · {formatProjectDate(project.updatedAt?.toDate(), locale)}
                          </span>
                        </button>
                        <Button size="icon-sm" variant="ghost" aria-label={isKo ? "저장한 컬러 삭제" : "Delete saved colors"} onClick={() => setProjectToDelete(project)}>
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                      <div className="mt-3 flex gap-2 border-t pt-3">
                        <Button size="sm" variant="outline" className="flex-1" disabled={project.colorHistory.length === 0} onClick={() => setHistoryProject(project)}>
                          {isKo ? `변경 이력${project.colorHistory.length ? ` ${project.colorHistory.length}` : ""}` : `History${project.colorHistory.length ? ` ${project.colorHistory.length}` : ""}`}
                        </Button>
                        <Button size="sm" className="flex-1" disabled={isCurrent} onClick={() => openProject(project)}>
                          <Library aria-hidden />{isCurrent ? (isKo ? "열려 있음" : "Open") : (isKo ? "열기" : "Open")}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(historyProject)} onOpenChange={(next) => { if (!next) setHistoryProject(null); }}>
        <DialogContent className="max-h-[80dvh] overflow-hidden sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isKo ? "컬러 변경 이력" : "Color change history"}</DialogTitle>
            <DialogDescription>{historyProject?.title}</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto rounded-lg border">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="sticky top-0 bg-muted"><tr>
                <th className="p-3">{isKo ? "토큰" : "Token"}</th><th className="p-3">{isKo ? "기존 색" : "Previous"}</th>
                <th className="p-3">{isKo ? "변경한 색" : "Changed"}</th><th className="p-3">{isKo ? "변경 시간" : "Changed at"}</th>
              </tr></thead>
              <tbody>{[...(historyProject?.colorHistory ?? [])].reverse().map((entry, index) => (
                <tr key={`${entry.changedAt}-${entry.token}-${index}`} className="border-t">
                  <td className="p-3 font-mono">{entry.token}</td><td className="p-3"><ColorHistoryValue value={entry.before} /></td>
                  <td className="p-3"><ColorHistoryValue value={entry.after} /></td><td className="whitespace-nowrap p-3">{formatProjectDate(new Date(entry.changedAt), locale, true)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(projectToDelete)} onOpenChange={(next) => { if (!next) setProjectToDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isKo ? "저장한 컬러를 삭제할까요?" : "Delete these saved colors?"}</DialogTitle>
            <DialogDescription>{isKo
              ? `“${projectToDelete?.title ?? ""}” 컬러와 변경 이력이 영구적으로 삭제됩니다.`
              : `“${projectToDelete?.title ?? ""}” and its color history will be permanently deleted.`}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" autoFocus />}>{isKo ? "취소" : "Cancel"}</DialogClose>
            <Button variant="destructive" onClick={() => projectToDelete && removeProject(projectToDelete)}>
              <Trash2 aria-hidden />{isKo ? "영구 삭제" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ColorHistoryValue({ value }: { value: string }) {
  return <span className="inline-flex items-center gap-2 font-mono"><i className="size-4 shrink-0 rounded border" style={{ background: value }} aria-hidden />{value.toUpperCase()}</span>;
}

function ProjectColorChip({ label, value }: { label: string; value: string }) {
  return <span className="inline-flex items-center gap-2 font-mono text-[10px] text-muted-foreground"><i className="size-3 rounded-full border border-black/10" style={{ background: value }} aria-hidden /><b className="w-3 font-sans text-[9px]">{label}</b>{value.toUpperCase()}</span>;
}

function projectColorSummary(project: SavedProject) {
  const generated = generateColorSystem(project.input, project.selectedPaletteId).semantic.light;
  const value = (path: "primary.default" | "secondary.default" | "accent.default", fallback: string) => (
    project.overrides[path] ?? project.tokenSnapshot[path] ?? fallback
  ).toUpperCase();
  return {
    primary: value("primary.default", generated.primary.default),
    secondary: value("secondary.default", generated.secondary.default),
    accent: value("accent.default", generated.accent.default),
  };
}

function formatProjectDate(date: Date | undefined, locale: "ko" | "en", includeTime = false) {
  if (!date || Number.isNaN(date.getTime())) return locale === "ko" ? "날짜 없음" : "No date";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
