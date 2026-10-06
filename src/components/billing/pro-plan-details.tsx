"use client";

import { ArrowRight, FolderOpen, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/copy";
import { FREE_PROJECT_LIMIT } from "@/lib/firebase/data";

export function ProPlanDetails({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const isKo = locale === "ko";
  const comparison = [
    { feature: isKo ? "컬러북 저장" : "Saved colorbooks", free: isKo ? `최대 ${FREE_PROJECT_LIMIT}개` : `Up to ${FREE_PROJECT_LIMIT}`, pro: isKo ? "무제한" : "Unlimited", upgraded: true },
    { feature: isKo ? "광고 (도입 예정)" : "Ads (planned)", free: isKo ? "노출 예정" : "With ads", pro: isKo ? "광고 제거" : "No ads", upgraded: true },
    { feature: isKo ? "팔레트 생성" : "Palette generation", free: isKo ? "무제한" : "Unlimited", pro: isKo ? "무제한" : "Unlimited", upgraded: false },
    { feature: isKo ? "공유 링크" : "Share links", free: isKo ? "무료" : "Included", pro: isKo ? "무료" : "Included", upgraded: false },
    { feature: isKo ? "파일 다운로드" : "File downloads", free: isKo ? "무제한" : "Unlimited", pro: isKo ? "무제한" : "Unlimited", upgraded: false },
  ];

  return (
    <div className={compact ? "grid gap-4" : "mt-5 grid gap-6"}>
      <div className="text-center">
        {compact ? <p className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">Color of Apple Pro<span className="rounded-full bg-muted px-2 py-0.5 font-normal">{isKo ? "출시 준비 중" : "Coming soon"}</span></p> : null}
        <p className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          ₩990<span className="ml-1.5 text-sm font-normal tracking-normal text-[var(--text-secondary)]">{isKo ? "/ 월 · 예정" : "/ month · planned"}</span>
        </p>
      </div>
      {!compact ? <section aria-label={isKo ? "Pro 업그레이드 혜택" : "Pro upgrade benefits"} className="grid gap-3 sm:grid-cols-2">
        <article className={`rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] ${compact ? "p-4" : "p-5"}`}>
          <FolderOpen className="size-5 text-[var(--text-primary)]" aria-hidden />
          <h2 className="mt-3 font-semibold text-[var(--text-primary)]">{isKo ? "컬러북 저장 무제한" : "Unlimited saved colorbooks"}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>{isKo ? `최대 ${FREE_PROJECT_LIMIT}개` : `Up to ${FREE_PROJECT_LIMIT}`}</span>
            <ArrowRight className="size-3.5" aria-hidden />
            <strong className="text-[var(--text-primary)]">{isKo ? "무제한" : "Unlimited"}</strong>
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {isKo ? "저장 공간을 비우지 않고 새 컬러북을 계속 모아둘 수 있어요." : "Keep saving new colorbooks without clearing space for them."}
          </p>
        </article>
        <article className={`rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] ${compact ? "p-4" : "p-5"}`}>
          <ShieldCheck className="size-5 text-[var(--text-primary)]" aria-hidden />
          <h2 className="mt-3 font-semibold text-[var(--text-primary)]">{isKo ? "광고 없는 작업 환경" : "An ad-free workspace"}</h2>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{isKo ? "광고 도입 시 Pro는 광고 제거" : "Pro removes ads when they are introduced"}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {isKo ? "컬러 작업에 집중할 수 있어요. 현재는 모든 플랜에서 광고가 표시되지 않아요." : "Focus on your colors. No ads are currently shown on any plan."}
          </p>
        </article>
      </section> : null}
      <section className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface)]">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">{isKo ? "Free와 출시 예정 Pro 플랜 비교" : "Free and upcoming Pro plan comparison"}</caption>
          <thead>
            <tr className="border-b border-[var(--border-default)]">
              <th scope="col" className="w-[42%] px-4 py-4 font-medium text-[var(--text-secondary)]">{isKo ? "기능 비교" : "Compare features"}</th>
              <th scope="col" className="px-2 py-4 text-center font-semibold text-[var(--text-primary)]">Free</th>
              <th scope="col" className="bg-[var(--surface-subtle)] px-2 py-4 text-center font-semibold text-[var(--text-primary)]">
                Pro<span className="mt-0.5 block text-[11px] font-normal text-[var(--text-tertiary)]">{isKo ? "출시 예정" : "Coming soon"}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row.feature} className="border-b border-[var(--border-default)] last:border-0">
                <th scope="row" className="px-4 py-3 font-medium text-[var(--text-secondary)]">{row.feature}</th>
                <td className="px-2 py-3 text-center text-[var(--text-secondary)]">{row.free}</td>
                <td className={`bg-[var(--surface-subtle)] px-2 py-3 text-center text-[var(--text-primary)] ${row.upgraded ? "font-semibold" : ""}`}>{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-[var(--border-default)] px-4 py-3 text-xs leading-5 text-[var(--text-secondary)]">
          {isKo ? "팔레트 생성은 누구나 무료예요. 공유와 파일 다운로드는 로그인하면 무료로 사용할 수 있어요." : "Palette generation is free for everyone. Sign in to share and download files for free."}
        </p>
      </section>
    </div>
  );
}
