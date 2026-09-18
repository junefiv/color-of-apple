"use client";

import { useState } from "react";
import { BarChart } from "../charts";
import { OverlayPin } from "../overlay-pin";
import { PhoneFrame } from "../phone-frame";
import { PreviewFit } from "../preview-fit";
import { StatusBadge } from "../shared";
import { Avatar, AvatarGroup, Progress } from "../widgets";

type Overlay = "none" | "sheet" | "dialog" | "toast" | "snackbar" | "action";

const projects = [
  { name: "모바일 온보딩", progress: 82, status: "진행 중", tone: "info" as const },
  { name: "디자인 시스템", progress: 64, status: "검토 대기", tone: "warning" as const },
  { name: "랜딩 페이지", progress: 31, status: "지연", tone: "danger" as const },
];

export function AppWorkspace() {
  const [filter, setFilter] = useState("전체");
  const [picked, setPicked] = useState(1);
  const [formOpen, setFormOpen] = useState(true);
  const [activityTab, setActivityTab] = useState("활동");
  const [openDay, setOpenDay] = useState("어제");
  const [priority, setPriority] = useState("보통");
  const [density, setDensity] = useState("보통");
  const [notify, setNotify] = useState(true);
  const [hideDone, setHideDone] = useState(false);
  const [progress, setProgress] = useState(65);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="preview-viewport pv-preview">
      <OverlayPin
        value={overlay}
        options={[
          ["none", "없음"],
          ["sheet", "시트"],
          ["dialog", "다이얼로그"],
          ["toast", "토스트"],
          ["snackbar", "스낵바"],
        ]}
        onChange={(next) => {
          setOverlay(next);
          if (next === "toast") showToast("작업을 저장했습니다.");
        }}
      />
      <div className="preview-phones preview-phones-single">
        <PreviewFit width={390} height={844}>
          <PhoneFrame>
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="flex items-start justify-between px-5 pt-2">
                <div>
                  <h2 className="text-lg font-semibold">Workspace</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">팀 프로젝트와 최근 활동</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="relative grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]">
                    🔔
                    <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--color-accent-default)]" />
                  </button>
                  <Avatar initials="YU" size="sm" />
                </div>
              </div>

              <div className="phone-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    ["✓ 8개의 작업이 완료됐어요", "var(--color-success-surface)", "var(--color-success-text)"],
                    ["! 마감이 가까운 작업이 3개예요", "var(--color-warning-surface)", "var(--color-warning-text)"],
                    ["× 파일 1개를 동기화하지 못했어요", "var(--color-danger-surface)", "var(--color-danger-text)"],
                    ["i 새 댓글이 등록됐어요", "var(--color-info-surface)", "var(--color-info-text)"],
                  ].map(([label, bg, color]) => (
                    <div key={label} className="min-w-52 shrink-0 rounded-xl px-3 py-2 text-xs" style={{ background: bg, color }}>
                      {label}
                    </div>
                  ))}
                </div>

                <input className="pv-input" placeholder="프로젝트와 작업 검색" />
                <div className="flex gap-2 overflow-x-auto">
                  {["전체", "진행 중", "검토", "완료", "지연"].map((chip) => (
                    <button key={chip} type="button" className="pv-chip shrink-0" data-selected={filter === chip} onClick={() => setFilter(chip)}>
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="pv-card p-4">
                  <p className="text-xs text-[var(--color-text-tertiary)]">이번 주 진행률</p>
                  <p className="mt-1 text-3xl font-semibold" style={{ color: "var(--color-primary-text)" }}>
                    74%
                  </p>
                  <Progress value={74} />
                  <div className="mt-3 flex justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>완료 18</span>
                    <span>진행 중 7</span>
                    <span style={{ color: "var(--color-accent-default)" }}>검토 3</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["활성 프로젝트", "12", false, false],
                      ["검토 대기", "8", true, false],
                      ["완료 작업", "18", false, false],
                      ["이번 달 성과", "+18%", false, true],
                    ] as const
                  ).map(([label, value, selected, disabled]) => (
                    <div
                      key={label}
                      className="pv-card p-3"
                      style={
                        disabled
                          ? { opacity: 0.45 }
                          : selected
                            ? { outline: "2px solid var(--color-primary-default)" }
                            : undefined
                      }
                    >
                      <p className="text-xs text-[var(--color-text-tertiary)]">{label}</p>
                      <p className="text-lg font-semibold" style={label === "이번 달 성과" ? { color: "var(--color-accent-default)" } : undefined}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pv-card p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">활동 분석</p>
                    <select className="pv-input w-24" defaultValue="week">
                      <option value="week">이번 주</option>
                    </select>
                  </div>
                  <BarChart compact />
                  <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">● 완료 ● 진행 ● 검토</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">최근 프로젝트</p>
                    <button className="text-xs" type="button" style={{ color: "var(--color-primary-text)" }}>
                      모두 보기
                    </button>
                  </div>
                  <div className="space-y-2">
                    {projects.map((item, index) => (
                      <div key={item.name}>
                        <div
                          className="pv-card flex w-full items-center gap-3 p-3 text-left"
                          style={picked === index ? { outline: "2px solid var(--color-primary-default)" } : undefined}
                          onClick={() => setPicked(index)}
                        >
                          <div className="size-9 rounded-lg bg-[var(--color-secondary-default)]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">진행률 {item.progress}%</p>
                            <Progress value={item.progress} />
                          </div>
                          <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                          <button
                            type="button"
                            className="px-1"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOverlay("action");
                            }}
                          >
                            ⋯
                          </button>
                        </div>
                        {picked === index ? (
                          <div className="pv-card mt-2 space-y-3 p-3">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">멤버 4명 · 업데이트 2시간 전</p>
                            <div className="flex gap-2">
                              {["UI", "Mobile", "In review"].map((chip) => (
                                <span key={chip} className="pv-chip">
                                  {chip}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm">디자인 토큰과 공통 컴포넌트를 정리합니다.</p>
                            <AvatarGroup />
                            <ul className="space-y-1 text-sm">
                              <li>✓ 컬러 토큰 정리</li>
                              <li className="text-[var(--color-text-secondary)]">○ 버튼 상태 검수</li>
                              <li className="text-[var(--color-text-secondary)]">○ 모바일 프리뷰</li>
                            </ul>
                            <div className="grid grid-cols-2 gap-2">
                              <button className="pv-btn pv-btn-outline" type="button" onClick={() => setPicked(-1)}>
                                접기
                              </button>
                              <button className="pv-btn pv-btn-primary" type="button" onClick={() => setOverlay("sheet")}>
                                업데이트 추가
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pv-card p-3">
                  <button type="button" className="flex w-full items-center justify-between text-sm" onClick={() => setFormOpen((value) => !value)}>
                    새 작업 추가
                    <span className="text-[var(--color-text-tertiary)]">{formOpen ? "–" : "+"}</span>
                  </button>
                  {formOpen ? (
                    <div className="mt-3 space-y-3">
                      <input className="pv-input" defaultValue="버튼 상태 검수" data-error="true" />
                      <p className="text-xs text-[var(--color-danger-text)]">이미 있는 작업명입니다.</p>
                      <select className="pv-input" defaultValue="minjun">
                        <option value="minjun">민준</option>
                        <option value="yoon">윤서</option>
                      </select>
                      <div className="flex gap-2">
                        {["낮음", "보통", "높음"].map((item) => (
                          <button key={item} type="button" className="pv-chip" data-selected={priority === item} onClick={() => setPriority(item)}>
                            {item}
                          </button>
                        ))}
                      </div>
                      <input type="range" className="w-full" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked /> 완료 시 알림
                      </label>
                      <label className="flex items-center justify-between text-sm">
                        자동 저장
                        <span className="inline-flex h-6 w-11 rounded-full p-0.5" style={{ background: "var(--color-primary-default)" }}>
                          <span className="size-5 translate-x-5 rounded-full bg-[var(--color-primary-on)]" />
                        </span>
                      </label>
                      <textarea className="pv-input min-h-16" placeholder="내용을 입력하세요." />
                      <div className="grid grid-cols-2 gap-2">
                        <button className="pv-btn pv-btn-outline" type="button" onClick={() => setFormOpen(false)}>
                          취소
                        </button>
                        <button className="pv-btn pv-btn-primary" type="button" onClick={() => showToast("작업을 추가했습니다.")}>
                          작업 추가
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="mb-2 flex gap-3 text-sm">
                    {["활동", "댓글", "파일"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        style={
                          activityTab === item
                            ? { borderBottom: "2px solid var(--color-primary-default)" }
                            : { color: "var(--color-text-tertiary)" }
                        }
                        onClick={() => setActivityTab(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
                    {["오늘", "어제", "지난주"].map((day) => (
                      <div key={day} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                          onClick={() => setOpenDay(openDay === day ? "" : day)}
                        >
                          {day}
                          <span className="text-[var(--color-text-tertiary)]">{openDay === day ? "–" : "+"}</span>
                        </button>
                        {openDay === day ? (
                          <div className="space-y-1 px-3 pb-3 text-xs text-[var(--color-text-secondary)]">
                            <p>윤서님이 파일을 업로드했습니다.</p>
                            <p>민준님이 작업을 완료했습니다.</p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">화면 설정</p>
                  <label className="flex items-center justify-between text-sm">
                    알림 받기
                    <button
                      type="button"
                      className="h-6 w-11 rounded-full p-0.5"
                      style={{ background: notify ? "var(--color-primary-default)" : "var(--color-border-default)" }}
                      onClick={() => setNotify((value) => !value)}
                    >
                      <span className={`block size-5 rounded-full bg-[var(--color-primary-on)] ${notify ? "translate-x-5" : ""}`} />
                    </button>
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    완료 항목 숨기기
                    <button
                      type="button"
                      className="h-6 w-11 rounded-full p-0.5"
                      style={{ background: hideDone ? "var(--color-primary-default)" : "var(--color-border-default)" }}
                      onClick={() => setHideDone((value) => !value)}
                    >
                      <span className={`block size-5 rounded-full bg-[var(--color-primary-on)] ${hideDone ? "translate-x-5" : ""}`} />
                    </button>
                  </label>
                  <select className="pv-input" defaultValue="list">
                    <option value="list">목록</option>
                    <option value="board">보드</option>
                  </select>
                  <div className="flex gap-1 rounded-full bg-[var(--color-surface-subtle)] p-1">
                    {["좁게", "보통"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="flex-1 rounded-full py-1 text-xs"
                        style={
                          density === item
                            ? { background: "var(--color-primary-default)", color: "var(--color-primary-on)" }
                            : { color: "var(--color-text-secondary)" }
                        }
                        onClick={() => setDensity(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm text-[var(--color-text-secondary)]">
                    Accent 강도
                    <input type="range" className="mt-2 w-full" defaultValue={60} />
                  </label>
                  <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3 text-sm text-[var(--color-text-disabled)]">
                    <span>관리자 전용</span>
                    <span>잠김</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-danger-default)] p-3">
                  <p className="text-sm text-[var(--color-danger-text)]">프로젝트 삭제</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">이 작업은 되돌릴 수 없습니다.</p>
                  <button className="pv-btn pv-btn-danger mt-3 w-full" type="button" onClick={() => setOverlay("dialog")}>
                    삭제하기
                  </button>
                </div>
              </div>

              <nav className="grid shrink-0 grid-cols-5 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] text-center text-[11px]">
                {(
                  [
                    ["홈", true],
                    ["프로젝트", false],
                    ["추가", false],
                    ["알림", false],
                    ["더보기", false],
                  ] as const
                ).map(([label, active]) => (
                  <button
                    key={label}
                    type="button"
                    className="relative py-3"
                    style={{ color: active ? "var(--color-primary-text)" : "var(--color-text-tertiary)" }}
                    onClick={() => {
                      if (label === "추가") setFormOpen(true);
                      if (label === "알림") setOverlay("snackbar");
                    }}
                  >
                    {label === "추가" ? (
                      <span className="mx-auto grid size-8 place-items-center rounded-full bg-[var(--color-primary-default)] text-sm text-[var(--color-primary-on)]">
                        +
                      </span>
                    ) : (
                      label
                    )}
                    {label === "알림" ? (
                      <span className="absolute right-3 top-2 size-1.5 rounded-full bg-[var(--color-accent-default)]" />
                    ) : null}
                  </button>
                ))}
              </nav>

              {overlay === "action" ? (
                <div className="absolute inset-0 z-20 flex items-end" style={{ background: "var(--color-overlay-scrim)" }}>
                  <div className="w-full space-y-2 p-3">
                    <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-overlay)]">
                      {["공유", "복제", "삭제"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="block w-full border-b border-[var(--color-border-subtle)] px-3 py-3 text-sm last:border-b-0"
                          style={item === "삭제" ? { color: "var(--color-danger-text)" } : undefined}
                          onClick={() => setOverlay(item === "삭제" ? "dialog" : "none")}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <button className="pv-btn w-full bg-[var(--color-surface-overlay)]" type="button" onClick={() => setOverlay("none")}>
                      취소
                    </button>
                  </div>
                </div>
              ) : null}
              {overlay === "sheet" ? (
                <div className="absolute inset-0 z-20 flex items-end" style={{ background: "var(--color-overlay-scrim)" }}>
                  <div className="w-full rounded-t-3xl bg-[var(--color-surface-overlay)] p-5">
                    <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--color-border-default)]" />
                    <h3 className="font-semibold">업데이트 추가</h3>
                    <textarea className="pv-input mt-3 min-h-20" placeholder="진행 상황을 적습니다." />
                    <button
                      className="pv-btn pv-btn-primary mt-4 w-full"
                      type="button"
                      onClick={() => {
                        setOverlay("none");
                        showToast("업데이트를 저장했습니다.");
                      }}
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : null}
              {overlay === "dialog" ? (
                <div className="absolute inset-0 z-20 grid place-items-center p-6" style={{ background: "var(--color-overlay-scrim)" }}>
                  <div className="w-full rounded-2xl bg-[var(--color-surface-overlay)] p-4">
                    <h3 className="font-semibold">프로젝트를 삭제할까요?</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">이 작업은 되돌릴 수 없습니다.</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button className="pv-btn pv-btn-outline" type="button" onClick={() => setOverlay("none")}>
                        취소
                      </button>
                      <button className="pv-btn pv-btn-danger" type="button" onClick={() => setOverlay("none")}>
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {overlay === "snackbar" ? (
                <div
                  className="absolute bottom-16 left-4 right-4 z-20 rounded-xl px-3 py-3 text-sm"
                  style={{ background: "var(--color-surface-inverse)", color: "var(--color-text-inverse)" }}
                >
                  네트워크 연결을 확인하세요.
                  <button type="button" className="ml-3 underline" onClick={() => setOverlay("none")}>
                    닫기
                  </button>
                </div>
              ) : null}
              {toast || overlay === "toast" ? (
                <div
                  className="absolute bottom-16 left-4 right-4 z-20 rounded-xl px-3 py-3 text-sm"
                  style={{ background: "var(--color-surface-inverse)", color: "var(--color-text-inverse)" }}
                >
                  {toast ?? "작업을 저장했습니다."}
                </div>
              ) : null}
            </div>
          </PhoneFrame>
        </PreviewFit>
      </div>
    </div>
  );
}
