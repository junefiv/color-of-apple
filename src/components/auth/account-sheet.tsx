"use client";

import { useState } from "react";
import { Crown, LogIn, LogOut, UserRoundCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uiToast } from "@/components/ui/toast";
import { useMatchuStore } from "@/lib/store";
import { trackProductEvent } from "@/lib/analytics";

export function AccountButton() {
  const router = useRouter();
  const locale = useMatchuStore((state) => state.locale);
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isKo = locale === "ko";
  const isPro = profile?.plan === "pro";

  async function login() {
    try {
      await signIn();
      void trackProductEvent("user_login", { source: "account_sheet" });
      uiToast.success(isKo ? "Google 계정으로 로그인했어요." : "Signed in with Google.", locale);
    } catch {
      uiToast.error(isKo ? "로그인을 완료하지 못했습니다." : "Could not complete sign-in.", locale);
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className="studio-gnb-action"
          aria-label={user ? (isKo ? "계정 메뉴" : "Account menu") : (isKo ? "로그인" : "Sign in")}
        >
          {user ? <UserRoundCheck aria-hidden /> : <LogIn aria-hidden />}
          <span>{user ? (profile?.displayName ?? (isKo ? "내 계정" : "Account")) : (isKo ? "로그인" : "Sign in")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-2">
          {loading ? (
            <DropdownMenuItem disabled className="py-2">{isKo ? "계정을 확인하는 중…" : "Checking your account…"}</DropdownMenuItem>
          ) : !user ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-2">
                  <span className="block text-sm font-semibold text-foreground">{isKo ? "로그인이 필요합니다" : "Sign in required"}</span>
                  <span className="mt-0.5 block font-normal leading-4">{isKo ? "프로젝트 저장·공유·보내기를 사용할 수 있어요." : "Save, share, and export your projects."}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2" onClick={() => { void login(); }}><LogIn aria-hidden />{isKo ? "Google로 로그인" : "Sign in with Google"}</DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-2">
                  <span className="block truncate text-sm font-semibold text-foreground">{profile?.displayName ?? user.displayName ?? (isKo ? "사용자" : "User")}</span>
                  <span className="mt-0.5 block truncate font-normal">{profile?.email ?? user.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center justify-between px-2 py-2 text-foreground">
                  <span>{isKo ? "현재 플랜" : "Current plan"}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-semibold">
                    {isPro ? <Crown className="size-3" aria-hidden /> : null}{isPro ? "Pro" : "Free"}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              {!isPro ? (
                <DropdownMenuItem className="py-2" onClick={() => { setOpen(false); router.push("/coming-soon"); }}>
                  <Crown aria-hidden />{isKo ? "플랜 업그레이드" : "Upgrade plan"}
                  <span className="ml-auto text-[10px] text-muted-foreground">₩990/{isKo ? "월" : "mo"}</span>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="py-2" onClick={() => { setOpen(false); void signOut(); }}>
                <LogOut aria-hidden />{isKo ? "로그아웃" : "Sign out"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
