"use client";

import { useState } from "react";
import {
  AppBar,
  AppOverlays,
  BottomNav,
  IntroHeader,
  IntroHero,
  IntroPhone,
  IntroViewport,
  Menu,
  WebOverlays,
  useTimedOverlay,
  type AppOverlay,
  type WebOverlay,
} from "./shared";

export function MediaWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [playing, setPlaying] = useState(false);
  const [menu, setMenu] = useState(false);
  const [volume, setVolume] = useState(40);

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Wave"
          links={["탐색", "라이브러리", "라디오"]}
          searchPlaceholder="곡 · 아티스트"
          cta="구독"
          onCta={() =>
            setOverlay({
              type: "modal",
              title: "Plus를 시작할까요?",
              body: "광고 없는 재생과 오프라인 저장이 열립니다.",
              confirm: "구독",
              onConfirm: () => show({ type: "toast", message: "구독이 활성화되었습니다.", tone: "success" }, 1800),
            })
          }
          onNotify={() => show({ type: "toast", message: "새 에피소드가 올라왔습니다.", tone: "info" }, 1800)}
          onHelp={() => setOverlay({ type: "tooltip", message: "큐에 담으면 다음 곡으로 이어집니다." })}
          onProfile={() => setOverlay({ type: "drawer", title: "재생 대기열", body: "1. Night Drive  2. Harbor  3. Soft Grid" })}
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="미디어 소개"
            title="이미지와 어두운 면 위에서 강조색이 살아나야 합니다."
            body="앨범, 미니 플레이어, 큐 드로어, 볼륨이 한 소개 페이지에 있습니다."
            primary="지금 듣기"
            onPrimary={() => {
              setPlaying(true);
              show({ type: "toast", message: "재생을 시작했습니다.", tone: "success" }, 1400);
            }}
          />
          <div className="flex flex-wrap gap-2">
            {["재즈", "일렉", "로파이"].map((item) => (
              <button key={item} className="pv-chip" type="button">
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Night Drive", "Harbor", "Soft Grid"].map((name) => (
              <button key={name} type="button" className="pv-card p-3 text-left" onClick={() => setOverlay({ type: "drawer", title: name, body: "다음 곡으로 넘기거나 재생목록에 담을 수 있습니다." })}>
                <div className="mb-3 h-24 rounded-xl bg-[var(--color-secondary-default)]" />
                <p className="font-medium">{name}</p>
              </button>
            ))}
          </div>
          <div className="pv-card flex flex-wrap items-center gap-3 p-3">
            <button className="pv-btn pv-btn-primary" type="button" onClick={() => setPlaying((value) => !value)}>
              {playing ? "일시정지" : "재생"}
            </button>
            <input type="range" className="min-w-40 flex-1" defaultValue={30} />
            <input type="range" className="w-28" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
            <div className="relative">
              <button type="button" onClick={() => setMenu((value) => !value)}>
                ⋯
              </button>
              {menu ? (
                <Menu
                  items={[
                    { label: "큐에 담기", onClick: () => setOverlay({ type: "drawer", title: "재생 대기열", body: "Night Drive가 다음에 재생됩니다." }) },
                    { label: "좋아요", onClick: () => show({ type: "toast", message: "라이브러리에 담았습니다.", tone: "success" }, 1400) },
                  ]}
                  onClose={() => setMenu(false)}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function MediaApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });
  const [playing, setPlaying] = useState(true);

  return (
    <IntroPhone
      nav={<BottomNav items={["홈", "검색", "라이브러리", "나"]} active="홈" onItem={(item) => item === "라이브러리" && setOverlay({ type: "sheet", title: "재생목록", body: <p className="text-sm">야간 드라이브 · 12곡</p> })} />}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <div className="flex h-full flex-col" style={{ background: "linear-gradient(180deg, var(--color-primary-subtle), var(--color-bg-canvas))" }}>
        <AppBar title="Wave" subtitle="지금 재생" onNotify={() => show({ type: "snackbar", message: "오프라인 파일이 준비됐어요." }, 1800)} />
        <div className="space-y-4 px-5 py-4">
          <div className="mx-auto h-44 w-44 rounded-3xl bg-[var(--color-secondary-default)]" />
          <p className="text-center text-lg font-semibold">Night Drive</p>
          <input type="range" className="w-full" defaultValue={36} />
          <div className="flex justify-center gap-4">
            <button type="button" className="text-sm" onClick={() => show({ type: "toast", message: "셔플 켜짐", tone: "info" }, 1200)}>
              셔플
            </button>
            <button className="pv-btn pv-btn-primary" type="button" onClick={() => setPlaying((value) => !value)}>
              {playing ? "정지" : "재생"}
            </button>
            <button type="button" className="text-sm" onClick={() => setOverlay({ type: "sheet", title: "가사", body: <p className="text-sm"> Neon on the water…</p> })}>
              가사
            </button>
          </div>
        </div>
      </div>
    </IntroPhone>
  );
}
