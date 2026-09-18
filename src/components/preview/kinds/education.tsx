"use client";

import { useState } from "react";
import { StatusBadge } from "../shared";
import { Progress } from "../widgets";
import {
  AppBar,
  AppOverlays,
  BottomNav,
  IntroHeader,
  IntroHero,
  IntroPhone,
  IntroViewport,
  WebOverlays,
  useTimedOverlay,
  type AppOverlay,
  type WebOverlay,
} from "./shared";

export function EducationWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [open, setOpen] = useState(true);
  const [answer, setAnswer] = useState<"ok" | "bad" | null>(null);

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Campus"
          links={["강좌", "과제", "성적"]}
          searchPlaceholder="강좌 검색"
          cta="수강 신청"
          onCta={() =>
            setOverlay({
              type: "modal",
              title: "이 강좌를 시작할까요?",
              body: "컬러 시스템 기초 · 4주 과정",
              confirm: "시작",
              onConfirm: () => show({ type: "toast", message: "수강이 시작되었습니다.", tone: "success" }, 1800),
            })
          }
          onNotify={() => show({ type: "toast", message: "과제 마감이 내일입니다.", tone: "warning" }, 2000)}
          onHelp={() => setOverlay({ type: "tooltip", message: "퀴즈는 두 번까지 다시 풀 수 있습니다." })}
          onProfile={() => setOverlay({ type: "drawer", title: "학습 기록", body: "연속 학습 12일, 수료 배지 3개." })}
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="학습 소개"
            title="진도, 정답, 피드백 색이 분명해야 합니다."
            body="퀴즈와 수료 모달이 의미 색을 어떻게 쓰는지 보는 소개 페이지입니다."
            primary="이어서 학습"
            onPrimary={() => show({ type: "toast", message: "3강부터 이어봅니다.", tone: "info" }, 1600)}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">진도</p>
              <p className="text-2xl font-semibold">62%</p>
              <Progress value={62} />
            </div>
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">점수</p>
              <p className="text-2xl font-semibold">88</p>
            </div>
            <div className="pv-card p-4">
              <StatusBadge tone="success">수료 가능</StatusBadge>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
            <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setOpen((value) => !value)}>
              1주차 커리큘럼
              <span>{open ? "–" : "+"}</span>
            </button>
            {open ? <p className="px-4 pb-3 text-sm text-[var(--color-text-secondary)]">토큰 역할과 대비를 배웁니다.</p> : null}
          </div>
          <div className="h-32 rounded-2xl bg-[var(--color-surface-sunken)] grid place-items-center text-sm text-[var(--color-text-tertiary)]">강의</div>
          <div className="pv-card space-y-3 p-4">
            <p className="font-medium">퀴즈 · Surface의 역할은?</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="quiz" onChange={() => setAnswer("ok")} /> 카드와 패널 배경
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="quiz" onChange={() => setAnswer("bad")} /> 강조 텍스트
            </label>
            <textarea className="pv-input min-h-16" placeholder="이유를 적어보세요." />
            <button
              className="pv-btn pv-btn-primary"
              type="button"
              onClick={() =>
                show(
                  {
                    type: "toast",
                    message: answer === "ok" ? "정답입니다." : "다시 생각해보세요.",
                    tone: answer === "ok" ? "success" : "danger",
                  },
                  1800,
                )
              }
            >
              제출
            </button>
            {answer ? <StatusBadge tone={answer === "ok" ? "success" : "danger"}>{answer === "ok" ? "정답" : "오답"}</StatusBadge> : null}
          </div>
          <button
            className="pv-btn pv-btn-outline"
            type="button"
            onClick={() =>
              setOverlay({
                type: "modal",
                title: "수료증을 발급할까요?",
                body: "이 강좌의 성취 배지가 프로필에 추가됩니다.",
                confirm: "수료",
                onConfirm: () => show({ type: "toast", message: "수료증이 발급되었습니다.", tone: "success" }, 1800),
              })
            }
          >
            수료하기
          </button>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function EducationApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });

  function openQuiz() {
    setOverlay({
      type: "sheet",
      title: "퀴즈",
      body: (
        <div className="space-y-3">
          <p className="text-sm">Primary는 어디에 쓰이나요?</p>
          <button className="pv-btn pv-btn-outline w-full" type="button" onClick={() => show({ type: "toast", message: "정답입니다.", tone: "success" }, 1600)}>
            주요 행동
          </button>
          <button className="pv-btn pv-btn-outline w-full" type="button" onClick={() => show({ type: "toast", message: "오답입니다.", tone: "danger" }, 1600)}>
            본문 텍스트
          </button>
        </div>
      ),
    });
  }

  return (
    <IntroPhone
      nav={<BottomNav items={["오늘", "강좌", "퀴즈", "나"]} active="오늘" onItem={(item) => item === "퀴즈" && openQuiz()} />}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar title="Campus" subtitle="오늘의 학습" onNotify={() => show({ type: "snackbar", message: "이어서 볼 강의가 있어요." }, 1800)} />
      <div className="space-y-4 px-5 py-4">
        <div className="pv-card p-4">
          <p className="text-sm">컬러 시스템 기초</p>
          <p className="text-3xl font-semibold">3강</p>
          <Progress value={62} />
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">연속 12일</p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="h-1 flex-1 rounded-full" style={{ background: index < 3 ? "var(--color-primary-default)" : "var(--color-border-subtle)" }} />
          ))}
        </div>
        <button className="pv-btn pv-btn-primary w-full" type="button" onClick={openQuiz}>
          퀴즈 풀기
        </button>
      </div>
    </IntroPhone>
  );
}
