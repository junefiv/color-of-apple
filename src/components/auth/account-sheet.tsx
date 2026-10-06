"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Crown, LogIn, LogOut, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PlanUpgradeDialog } from "@/components/billing/plan-upgrade-dialog";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AccountButton() {
  const locale = useMatchuStore((state) => state.locale);
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

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

  async function confirmLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      setLogoutOpen(false);
      uiToast.success(isKo ? "로그아웃했어요." : "Signed out.", locale);
    } catch {
      uiToast.error(isKo ? "로그아웃하지 못했습니다. 다시 시도해 주세요." : "Could not sign out. Please try again.", locale);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          ref={accountButtonRef}
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
                <DropdownMenuItem className="py-2" onClick={() => { setOpen(false); setUpgradeOpen(true); }}>
                  <Crown aria-hidden />{isKo ? "플랜 업그레이드" : "Upgrade plan"}
                  <span className="ml-auto text-[10px] text-muted-foreground">₩990/{isKo ? "월" : "mo"}</span>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem className="py-2" render={<Link href="/billing" />} onClick={() => setOpen(false)}>
                <Crown aria-hidden />{isKo ? "구독 관리" : "Manage subscription"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="py-2" onClick={() => { setOpen(false); setLogoutOpen(true); }}>
                <LogOut aria-hidden />{isKo ? "로그아웃" : "Sign out"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <PlanUpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} finalFocus={accountButtonRef} />
      <Dialog open={logoutOpen} onOpenChange={(next) => { if (!signingOut) setLogoutOpen(next); }}>
        <DialogContent finalFocus={accountButtonRef} showCloseButton={!signingOut}>
          <DialogHeader>
            <DialogTitle>{isKo ? "로그아웃할까요?" : "Sign out?"}</DialogTitle>
            <DialogDescription>{isKo ? "다시 로그인하면 저장한 컬러북을 볼 수 있어요." : "Sign in again to access your saved colorbooks."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={signingOut} onClick={() => setLogoutOpen(false)} autoFocus>
              {isKo ? "취소" : "Cancel"}
            </Button>
            <Button variant="destructive" disabled={signingOut} onClick={() => { void confirmLogout(); }}>
              <LogOut aria-hidden />{signingOut ? (isKo ? "로그아웃 중…" : "Signing out…") : (isKo ? "로그아웃" : "Sign out")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
