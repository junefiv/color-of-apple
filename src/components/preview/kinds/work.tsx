"use client";

import { useState } from "react";
import { BarChart, DonutChart, LineChart } from "../charts";
import { StatusBadge } from "../shared";
import { AvatarGroup, Progress } from "../widgets";
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

export function WorkWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState(false);
  const [chip, setChip] = useState("전체");

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Flow"
          links={["기능", "요금", "고객"]}
          searchPlaceholder="업무와 프로젝트 검색"
          cta="업무 추가"
          onCta={() =>
            setOverlay({
              type: "modal",
              title: "새 업무 추가",
              body: "프로젝트와 담당자를 고른 뒤 업무를 만듭니다.",
              confirm: "추가하기",
              onConfirm: () => show({ type: "toast", message: "변경사항이 저장되었습니다.", tone: "success" }, 2200),
            })
          }
          onNotify={() => {
            setProfileOpen(false);
            setNotifyOpen((value) => !value);
          }}
          notifyOpen={notifyOpen}
          notifyPanel={
            <Menu
              items={[
                {
                  label: "저장 완료",
                  onClick: () => show({ type: "toast", message: "변경사항이 저장되었습니다.", tone: "success" }, 2200),
                },
                {
                  label: "마감 임박 3건",
                  onClick: () => show({ type: "toast", message: "마감이 가까운 작업이 3개 있습니다.", tone: "warning" }, 2200),
                },
                {
                  label: "동기화 실패",
                  onClick: () => show({ type: "toast", message: "동기화하지 못한 파일이 있습니다.", tone: "danger" }, 2200),
                },
                {
                  label: "새 멤버",
                  onClick: () => show({ type: "toast", message: "새로운 멤버가 워크스페이스에 참여했습니다.", tone: "info" }, 2200),
                },
              ]}
              onClose={() => setNotifyOpen(false)}
            />
          }
          onHelp={() =>
            setOverlay((current) =>
              current.type === "tooltip" ? { type: "none" } : { type: "tooltip", message: "알림을 누르면 상태 메시지를 볼 수 있습니다." },
            )
          }
          onProfile={() => {
            setNotifyOpen(false);
            setProfileOpen((value) => !value);
          }}
          profileOpen={profileOpen}
          profilePanel={
            <Menu
              items={[
                {
                  label: "활동 보기",
                  onClick: () => setOverlay({ type: "drawer", title: "최근 활동", body: "윤서가 파일을 올렸고, 민준이 업무를 완료했습니다." }),
                },
                { label: "설정", onClick: () => show({ type: "toast", message: "설정은 곧 열립니다.", tone: "info" }, 1800) },
              ]}
              onClose={() => setProfileOpen(false)}
            />
          }
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="프로젝트 소개"
            title="할 일과 진행을 한 화면에서."
            body="상태, 선택, 차트, 테이블이 같은 톤으로 맞는지 보는 업무 관리 소개 페이지입니다."
            primary="프로젝트 만들기"
            onPrimary={() =>
              setOverlay({
                type: "modal",
                title: "프로젝트 만들기",
                body: "이름과 팀을 정하면 보드가 바로 열립니다.",
                confirm: "만들기",
                onConfirm: () => show({ type: "toast", message: "변경사항이 저장되었습니다.", tone: "success" }, 2200),
              })
            }
            secondary="둘러보기"
            onSecondary={() => setOverlay({ type: "drawer", title: "둘러보기", body: "보드, 목록, 타임라인 순으로 둘러봅니다." })}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["진행 중", "18", "primary"],
              ["검토", "7", "secondary"],
              ["완료율", "74%", "accent"],
            ].map(([label, value]) => (
              <div key={label} className="pv-card p-4">
                <p className="text-xs text-[var(--color-text-tertiary)]">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {["전체", "진행 중", "검토", "완료"].map((item) => (
              <button key={item} type="button" className="pv-chip" data-selected={chip === item} onClick={() => setChip(item)}>
                {item}
              </button>
            ))}
            <input className="pv-input w-40" type="date" defaultValue="2026-09-24" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["할 일", "와이어 정리", "info"],
              ["진행", "모바일 온보딩", "warning"],
              ["완료", "브랜드 가이드", "success"],
            ].map(([col, card, tone]) => (
              <div key={col} className="pv-card space-y-3 p-3">
                <p className="text-xs text-[var(--color-text-tertiary)]">{col}</p>
                <button
                  type="button"
                  className="w-full rounded-xl border border-[var(--color-border-subtle)] p-3 text-left"
                  onClick={() => setOverlay({ type: "drawer", title: String(card), body: "담당자와 댓글, 첨부 파일을 이 패널에서 봅니다." })}
                >
                  <p className="text-sm font-medium">{card}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <AvatarGroup />
                    <StatusBadge tone={tone as "info" | "warning" | "success"}>{col}</StatusBadge>
                  </div>
                  <Progress value={col === "완료" ? 100 : 64} />
                </button>
              </div>
            ))}
          </div>

          <div className="pv-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="font-medium">업무 목록</p>
              <button className="pv-btn pv-btn-ghost" type="button" onClick={() => setRowMenu((value) => !value)}>
                더보기
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 font-medium">업무</th>
                  <th className="px-3 py-2 font-medium">담당</th>
                  <th className="px-3 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--color-border-subtle)]">
                  <td className="px-3 py-2">사용자 흐름 검토</td>
                  <td className="px-3 py-2">
                    <AvatarGroup />
                  </td>
                  <td className="relative px-3 py-2">
                    <StatusBadge tone="warning">검토</StatusBadge>
                    {rowMenu ? (
                      <Menu
                        items={[
                          { label: "열기", onClick: () => setOverlay({ type: "drawer", title: "사용자 흐름 검토", body: "댓글 2개, 첨부 1개." }) },
                          {
                            label: "삭제",
                            danger: true,
                            onClick: () =>
                              setOverlay({
                                type: "modal",
                                title: "이 업무를 삭제할까요?",
                                body: "삭제하면 되돌릴 수 없습니다.",
                                confirm: "삭제",
                                danger: true,
                                onConfirm: () => show({ type: "toast", message: "업무를 삭제했습니다.", tone: "danger" }, 2000),
                              }),
                          },
                        ]}
                        onClose={() => setRowMenu(false)}
                      />
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="pv-card p-4 lg:col-span-2">
              <p className="mb-3 font-medium">주간 진행</p>
              <BarChart />
              <div className="mt-4">
                <LineChart />
              </div>
            </div>
            <div className="pv-card p-4">
              <p className="mb-3 font-medium">상태 분포</p>
              <DonutChart />
            </div>
          </div>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function WorkApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });
  const [done, setDone] = useState(false);
  const [seg, setSeg] = useState("오늘");

  function openSheet() {
    setOverlay({
      type: "sheet",
      title: "새 업무",
      body: (
        <div className="space-y-3">
          <input className="pv-input" placeholder="업무명" />
          <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => show({ type: "toast", message: "업무를 추가했습니다.", tone: "success" }, 1800)}>
            추가
          </button>
        </div>
      ),
    });
  }

  return (
    <IntroPhone
      nav={<BottomNav items={["홈", "보드", "+", "더보기"]} active="홈" onItem={(item) => item === "+" && openSheet()} />}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar
        title="Flow"
        subtitle="오늘의 업무"
        onNotify={() => show({ type: "snackbar", message: "마감이 가까운 작업이 3개 있어요." }, 2200)}
      />
      <div className="space-y-4 px-5 py-4">
        <div className="flex gap-2">
          {["오늘", "주간", "완료"].map((item) => (
            <button key={item} type="button" className="pv-chip" data-selected={seg === item} onClick={() => setSeg(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="pv-card p-4">
          <p className="text-xs text-[var(--color-text-tertiary)]">오늘 목표</p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: "var(--color-primary-text)" }}>
            74%
          </p>
          <Progress value={74} />
        </div>
        <label className="pv-card flex items-center gap-3 p-3 text-sm">
          <input type="checkbox" checked={done} onChange={() => {
            setDone(true);
            show({ type: "toast", message: "변경사항이 저장되었습니다.", tone: "success" }, 1800);
          }} />
          컬러 토큰 정리
          <StatusBadge tone="success">완료</StatusBadge>
        </label>
        <button
          type="button"
          className="pv-card flex w-full items-center justify-between p-3 text-left"
          onClick={() =>
            setOverlay({
              type: "sheet",
              title: "모바일 온보딩",
              body: (
                <div className="space-y-3 text-sm">
                  <p>멤버 4명 · 댓글 2</p>
                  <Progress value={82} />
                  <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => show({ type: "toast", message: "업데이트를 저장했습니다.", tone: "success" }, 1800)}>
                    업데이트
                  </button>
                </div>
              ),
            })
          }
        >
          <span>모바일 온보딩</span>
          <StatusBadge tone="info">진행 중</StatusBadge>
        </button>
        <button
          type="button"
          className="text-sm text-[var(--color-text-secondary)]"
          onClick={() =>
            setOverlay({
              type: "action",
              items: [
                { label: "공유", onClick: () => show({ type: "toast", message: "링크를 복사했습니다.", tone: "info" }, 1600) },
                {
                  label: "삭제",
                  danger: true,
                  onClick: () =>
                    setOverlay({
                      type: "dialog",
                      title: "업무를 삭제할까요?",
                      body: "이 작업은 되돌릴 수 없습니다.",
                      confirm: "삭제",
                      danger: true,
                      onConfirm: () => show({ type: "toast", message: "삭제했습니다.", tone: "danger" }, 1600),
                    }),
                },
              ],
            })
          }
        >
          더보기
        </button>
      </div>
    </IntroPhone>
  );
}
