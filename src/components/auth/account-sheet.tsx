"use client";

import { useEffect, useState } from "react";
import { Crown, FolderOpen, LogIn, LogOut, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { uiToast } from "@/components/ui/toast";
import {
  deleteProject,
  FREE_EXPORT_LIMIT,
  FREE_GENERATION_LIMIT,
  FREE_PROJECT_LIMIT,
  getUtcQuotaWindow,
  subscribeCurrentUsage,
  subscribeProjects,
  type SavedProject,
  type UsageSnapshot,
} from "@/lib/firebase/data";
import { encodeShare } from "@/lib/share/encode";
import { useMatchuStore } from "@/lib/store";

const EMPTY_USAGE: UsageSnapshot = { generationCount: 0, exportCount: 0 };

export function AccountButton() {
  const router = useRouter();
  const locale = useMatchuStore((state) => state.locale);
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [usage, setUsage] = useState<UsageSnapshot>(EMPTY_USAGE);

  useEffect(() => {
    if (!user) return;
    const unsubscribeProjects = subscribeProjects(user.uid, setProjects);
    const unsubscribeUsage = subscribeCurrentUsage(user.uid, setUsage);
    return () => {
      unsubscribeProjects();
      unsubscribeUsage();
    };
  }, [user]);

  const isKo = locale === "ko";
  const isPro = profile?.plan === "pro";
  const visibleProjects = user ? projects : [];
  const visibleUsage = user ? usage : EMPTY_USAGE;
  const resetAt = new Intl.DateTimeFormat(isKo ? "ko-KR" : "en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(getUtcQuotaWindow().end);

  async function login() {
    try {
      await signIn();
      uiToast.success(isKo ? "Google 계정으로 로그인했어요." : "Signed in with Google.", locale);
    } catch {
      uiToast.error(isKo ? "로그인을 완료하지 못했습니다." : "Could not complete sign-in.", locale);
    }
  }

  async function removeProject(project: SavedProject) {
    if (!user) return;
    const confirmed = window.confirm(
      isKo ? `“${project.title}” 프로젝트를 삭제할까요?` : `Delete “${project.title}”?`,
    );
    if (!confirmed) return;
    try {
      await deleteProject(user.uid, project.id);
      uiToast.success(isKo ? "프로젝트를 삭제했어요." : "Project deleted.", locale);
    } catch {
      uiToast.error(isKo ? "프로젝트를 삭제하지 못했습니다." : "Could not delete the project.", locale);
    }
  }

  function openProject(project: SavedProject) {
    const payload = encodeShare({
      input: project.input,
      selectedPaletteId: project.selectedPaletteId,
      overrides: project.overrides,
    });
    setOpen(false);
    router.push(`/result?d=${payload}&p=${encodeURIComponent(project.id)}`);
  }

  return (
    <>
      {user ? (
        <div
          className="gnb-usage"
          aria-label={isKo ? "현재 무료 사용량" : "Current free usage"}
          title={isPro
            ? (isKo ? "Pro 플랜은 사용량 제한이 없습니다." : "The Pro plan has no usage limits.")
            : (isKo ? `생성·내보내기 한도는 UTC ${resetAt}에 초기화됩니다.` : `Generation and export limits reset at ${resetAt} UTC.`)}
        >
          <GnbUsageRow
            label={isKo ? "저장 프로젝트" : "Saved projects"}
            value={isPro ? `${visibleProjects.length} / ∞` : `${visibleProjects.length} / ${FREE_PROJECT_LIMIT}`}
          />
          <GnbUsageRow
            label={isKo ? "팔레트 생성" : "Generations"}
            value={isPro ? "∞" : `${visibleUsage.generationCount} / ${FREE_GENERATION_LIMIT}`}
          />
          <GnbUsageRow
            label={isKo ? "내보내기" : "Exports"}
            value={isPro ? "∞" : `${visibleUsage.exportCount} / ${FREE_EXPORT_LIMIT}`}
          />
        </div>
      ) : null}
      <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="studio-gnb-action"
        aria-label={isKo ? "계정 및 프로젝트" : "Account and projects"}
      >
        <UserRound aria-hidden />
        <span>{user ? (profile?.displayName ?? (isKo ? "내 계정" : "Account")) : (isKo ? "로그인" : "Sign in")}</span>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isKo ? "계정 및 프로젝트" : "Account & projects"}</SheetTitle>
          <SheetDescription>
            {isKo ? "Color of Apple의 저장 공간과 사용량을 관리합니다." : "Manage your Color of Apple projects and usage."}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className="px-4 text-sm text-muted-foreground">{isKo ? "계정을 확인하는 중…" : "Checking your account…"}</p>
        ) : !user ? (
          <div className="px-4">
            <Button className="w-full" onClick={login}><LogIn aria-hidden />{isKo ? "Google로 계속하기" : "Continue with Google"}</Button>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {isKo ? "팔레트 생성, 저장, 공유 및 내보내기를 사용하려면 로그인이 필요합니다." : "Sign in to generate, save, share, and export palettes."}
            </p>
          </div>
        ) : (
          <div className="space-y-5 px-4 pb-5">
            <section className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{profile?.displayName ?? user.displayName ?? (isKo ? "사용자" : "User")}</p>
                  <p className="truncate text-xs text-muted-foreground">{profile?.email ?? user.email}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-1 text-xs font-semibold">
                  {isPro ? <Crown className="size-3" aria-hidden /> : null}{isPro ? "Pro" : "Free"}
                </span>
              </div>

            </section>

            {!isPro ? (
              <section className="rounded-xl border border-[var(--color-primary-default)]/30 p-4">
                <p className="font-semibold">Color of Apple Pro · ₩990/{isKo ? "월" : "month"}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {isKo ? "프로젝트 무제한 · 생성 및 내보내기 무제한 · 광고 제거" : "Unlimited projects, generations, and exports · No ads"}
                </p>
                <Button className="mt-3 w-full" onClick={() => { setOpen(false); router.push("/coming-soon"); }}> 
                  <Crown aria-hidden />{isKo ? "월 990원으로 업그레이드" : "Upgrade for ₩990/month"}
                </Button>
              </section>
            ) : null}

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{isKo ? "내 프로젝트" : "My projects"}</h2>
                <span className="text-xs text-muted-foreground">{visibleProjects.length}</span>
              </div>
              {visibleProjects.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  {isKo ? "아직 저장한 프로젝트가 없습니다." : "No saved projects yet."}
                </p>
              ) : (
                <div className="space-y-2">
                  {visibleProjects.map((project) => (
                    <div key={project.id} className="flex items-center gap-2 rounded-xl border border-border p-2">
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openProject(project)}>
                        <span className="block truncate text-sm font-medium">{project.title}</span>
                        <span className="block text-[11px] text-muted-foreground">{project.input.hex.toUpperCase()}</span>
                      </button>
                      <Button size="icon-sm" variant="ghost" aria-label={isKo ? "프로젝트 열기" : "Open project"} onClick={() => openProject(project)}><FolderOpen aria-hidden /></Button>
                      <Button size="icon-sm" variant="ghost" aria-label={isKo ? "프로젝트 삭제" : "Delete project"} onClick={() => removeProject(project)}><Trash2 aria-hidden /></Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Button variant="outline" className="w-full" onClick={() => signOut()}><LogOut aria-hidden />{isKo ? "로그아웃" : "Sign out"}</Button>
          </div>
        )}
      </SheetContent>
      </Sheet>
    </>
  );
}

function GnbUsageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="gnb-usage-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
