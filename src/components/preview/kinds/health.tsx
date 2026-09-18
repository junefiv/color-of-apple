"use client";

import { useState } from "react";
import { BarChart, LineChart } from "../charts";
import { StatusBadge } from "../shared";
import { EmptySlot, Progress } from "../widgets";
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

export function HealthWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [goal, setGoal] = useState(70);
  const [empty, setEmpty] = useState(false);

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Pulse"
          links={["활동", "운동", "수면"]}
          searchPlaceholder="운동 검색"
          cta="기록"
          onCta={() =>
            setOverlay({
              type: "modal",
              title: "오늘 운동을 저장할까요?",
              body: "러닝 32분 · 248 kcal",
              confirm: "저장",
              onConfirm: () => show({ type: "toast", message: "운동 기록을 저장했습니다.", tone: "success" }, 1800),
            })
          }
          onNotify={() => show({ type: "toast", message: "기기 동기화에 실패했습니다.", tone: "danger" }, 2200)}
          onHelp={() => setOverlay({ type: "tooltip", message: "링이 닫히면 오늘의 목표를 달성한 것입니다." })}
          onProfile={() => setOverlay({ type: "drawer", title: "연결된 기기", body: "Watch · 마지막 동기화 2분 전" })}
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="건강 소개"
            title="게이지와 차트가 팔레트 위에서 읽혀야 합니다."
            body="걸음, 심박수, 목표, 경고가 한 소개 페이지에 모입니다."
            primary="운동 시작"
            onPrimary={() =>
              setOverlay({
                type: "modal",
                title: "러닝을 시작할까요?",
                body: "타이머와 심박 추적이 켜집니다.",
                confirm: "시작",
                onConfirm: () => show({ type: "toast", message: "운동을 시작했습니다.", tone: "success" }, 1600),
              })
            }
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">걸음</p>
              <p className="text-2xl font-semibold">8,420</p>
              <Progress value={84} />
            </div>
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">수면</p>
              <StatusBadge tone="info">7시간</StatusBadge>
            </div>
            <div className="pv-card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">목표</p>
              <input type="range" className="mt-2 w-full" value={goal} onChange={(event) => setGoal(Number(event.target.value))} />
            </div>
          </div>
          <div className="flex gap-2">
            {["러닝", "사이클", "요가"].map((item) => (
              <button key={item} className="pv-chip" type="button">
                {item}
              </button>
            ))}
            <button className="pv-chip" type="button" onClick={() => setEmpty((value) => !value)}>
              빈 데이터
            </button>
          </div>
          {empty ? (
            <EmptySlot label="아직 기록된 운동이 없습니다." />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="pv-card p-4">
                <p className="mb-2 font-medium">심박수</p>
                <LineChart />
              </div>
              <div className="pv-card p-4">
                <p className="mb-2 font-medium">운동 시간</p>
                <BarChart />
              </div>
            </div>
          )}
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function HealthApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });

  function openWorkout() {
    setOverlay({
      type: "sheet",
      title: "운동 선택",
      body: (
        <div className="space-y-2">
          {["러닝", "사이클", "요가"].map((item) => (
            <button key={item} className="pv-btn pv-btn-outline w-full" type="button" onClick={() => show({ type: "toast", message: `${item}을 시작했습니다.`, tone: "success" }, 1600)}>
              {item}
            </button>
          ))}
        </div>
      ),
    });
  }

  return (
    <IntroPhone
      nav={<BottomNav items={["오늘", "기록", "+", "나"]} active="오늘" onItem={(item) => item === "+" && openWorkout()} />}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar title="Pulse" subtitle="오늘의 운동" onNotify={() => show({ type: "snackbar", message: "워치 연결이 끊어졌어요." }, 2000)} />
      <div className="space-y-4 px-5 py-4">
        <div className="grid place-items-center">
          <div className="grid size-28 place-items-center rounded-full border-8 border-[var(--color-primary-default)] text-2xl font-semibold">84</div>
        </div>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">목표까지 1,580걸음</p>
        <StatusBadge tone="success">목표 근접</StatusBadge>
        <button className="pv-btn pv-btn-primary w-full" type="button" onClick={openWorkout}>
          운동 시작
        </button>
        <BarChart compact />
      </div>
    </IntroPhone>
  );
}
