"use client";

import { useState } from "react";
import { BarChart, ChartLegend, DonutChart, LineChart } from "../charts";
import { OverlayPin } from "../overlay-pin";
import { StatusBadge } from "../shared";
import { Avatar, AvatarGroup, Progress } from "../widgets";

type Overlay = "none" | "modal" | "drawer" | "toast" | "tooltip";

const projects = [
  { name: "모바일 온보딩", owner: "윤서", progress: 82, status: "진행 중", due: "09.24", tone: "info" as const },
  { name: "디자인 시스템", owner: "민준", progress: 64, status: "검토 대기", due: "09.27", tone: "warning" as const },
  { name: "브랜드 가이드", owner: "하린", progress: 100, status: "완료", due: "09.18", tone: "success" as const },
  { name: "랜딩 페이지", owner: "도윤", progress: 31, status: "지연", due: "09.20", tone: "danger" as const },
];

export function WebWorkspace() {
  const [nav, setNav] = useState("Overview");
  const [collapsed, setCollapsed] = useState(false);
  const [checked, setChecked] = useState([1]);
  const [picked, setPicked] = useState(1);
  const [help, setHelp] = useState(false);
  const [rowMenu, setRowMenu] = useState<number | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [chartTab, setChartTab] = useState("주간");
  const [helpTab, setHelpTab] = useState("도움말");
  const [openFaq, setOpenFaq] = useState("notify");
  const [priority, setPriority] = useState("보통");
  const [stage, setStage] = useState("디자인");
  const [progress, setProgress] = useState(65);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [toast, setToast] = useState<string | null>(null);
  const [popover, setPopover] = useState(false);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="preview-viewport pv-preview">
      <OverlayPin
        value={overlay}
        options={[
          ["none", "없음"],
          ["modal", "모달"],
          ["drawer", "드로어"],
          ["toast", "토스트"],
          ["tooltip", "툴팁"],
        ]}
        onChange={(next) => {
          setOverlay(next);
          if (next === "toast") showToast("변경사항을 저장했습니다.");
        }}
      />
      <aside
        className={`${collapsed ? "w-16" : "w-48"} hidden shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)] md:flex`}
      >
        <div className="px-3 py-3 text-xs font-semibold tracking-[0.18em] text-[var(--color-text-tertiary)]">
          {collapsed ? "M" : "LOGO"}
        </div>
        <nav className="space-y-1 px-2">
          {[
            ["Overview", ""],
            ["Projects", "8"],
            ["Calendar", ""],
            ["Files", ""],
            ["Members", ""],
          ].map(([label, badge]) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm"
              style={
                nav === label
                  ? { background: "var(--color-primary-subtle)", color: "var(--color-primary-text)" }
                  : { color: "var(--color-text-secondary)" }
              }
              onClick={() => setNav(label)}
            >
              <span>{collapsed ? label[0] : label}</span>
              {badge && !collapsed ? (
                <span className="rounded-full bg-[var(--color-accent-default)] px-1.5 text-[10px] text-[var(--color-accent-on)]">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-[var(--color-border-subtle)] px-2 py-3">
          <button type="button" className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)]">
            {collapsed ? "S" : "Settings"}
          </button>
          <div className="relative">
            <button
              type="button"
              className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-[var(--color-text-secondary)]"
              onMouseEnter={() => setHelp(true)}
              onMouseLeave={() => setHelp(false)}
            >
              {collapsed ? "?" : "Help"}
            </button>
            {help ? (
              <span className="absolute bottom-full left-2 z-10 mb-1 whitespace-nowrap rounded-md bg-[var(--color-surface-inverse)] px-2 py-1 text-[11px] text-[var(--color-text-inverse)]">
                단축키와 가이드
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="w-full rounded-lg px-2.5 py-2 text-left text-xs text-[var(--color-text-tertiary)]"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? "›" : "사이드바 접기"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] px-4 py-3">
          <div className="relative">
            <button type="button" className="text-sm text-[var(--color-text-secondary)]" onClick={() => setWorkspaceOpen((value) => !value)}>
              Design Team ▾
            </button>
            {workspaceOpen ? (
              <div className="absolute left-0 z-20 mt-1 w-40 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] p-1 shadow-[0_12px_28px_var(--color-shadow-default)]">
                {["Design Team", "Product", "Studio"].map((item) => (
                  <button key={item} type="button" className="block w-full rounded-md px-2 py-1.5 text-left text-sm" onClick={() => setWorkspaceOpen(false)}>
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <input className="pv-input max-w-64 flex-1" placeholder="검색" />
          <button type="button" className="relative grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]">
            🔔
            <span className="absolute -right-1 -top-1 rounded-full bg-[var(--color-accent-default)] px-1 text-[9px] text-[var(--color-accent-on)]">
              3
            </span>
          </button>
          <button type="button" className="grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" title="도움말">
            ?
          </button>
          <Avatar initials="YU" />
          <button className="pv-btn pv-btn-outline" type="button">
            초대하기
          </button>
          <button className="pv-btn pv-btn-primary" type="button">
            새 프로젝트
          </button>
        </header>

        <div className="preview-scroll space-y-6 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">팀의 프로젝트와 최근 활동을 확인하세요.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="pv-input w-28" defaultValue="month">
                <option value="month">이번 달</option>
                <option value="week">이번 주</option>
              </select>
              <button className="pv-btn pv-btn-ghost" type="button">
                필터
              </button>
              <button className="pv-btn pv-btn-outline" type="button">
                내보내기
              </button>
              <button className="pv-btn pv-btn-primary" type="button">
                새 프로젝트
              </button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-[var(--color-success-surface)] px-3 py-2 text-sm text-[var(--color-success-text)]">
              ✓ 변경사항이 저장되었습니다.
            </div>
            <div className="rounded-xl bg-[var(--color-warning-surface)] px-3 py-2 text-sm text-[var(--color-warning-text)]">
              ! 마감이 가까운 작업이 3개 있습니다.
            </div>
            <div className="rounded-xl bg-[var(--color-danger-surface)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
              × 동기화하지 못한 파일이 있습니다.
            </div>
            <div className="rounded-xl bg-[var(--color-info-surface)] px-3 py-2 text-sm text-[var(--color-info-text)]">
              i 새로운 멤버가 워크스페이스에 참여했습니다.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="pv-card p-3">
              <p className="text-xs text-[var(--color-text-tertiary)]">활성 프로젝트</p>
              <p className="mt-1 text-2xl font-semibold">12</p>
              <p className="text-xs text-[var(--color-text-secondary)]">+2</p>
            </div>
            <div className="pv-card p-3" style={{ outline: "2px solid var(--color-primary-default)" }}>
              <p className="text-xs text-[var(--color-text-tertiary)]">완료율</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--color-primary-text)" }}>
                74%
              </p>
              <Progress value={74} />
            </div>
            <div className="pv-card p-3" style={{ background: "var(--color-secondary-default)", color: "var(--color-secondary-on)" }}>
              <p className="text-xs opacity-80">검토 대기</p>
              <p className="mt-1 text-2xl font-semibold">8</p>
            </div>
            <div className="pv-card p-3">
              <p className="text-xs text-[var(--color-text-tertiary)]">이번 달 성과</p>
              <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--color-accent-default)" }}>
                +18.4%
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="pv-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">프로젝트 활동</p>
                <div className="flex items-center gap-2">
                  {["주간", "월간", "분기"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="text-sm"
                      style={
                        chartTab === item
                          ? { borderBottom: "2px solid var(--color-primary-default)", color: "var(--color-text-primary)" }
                          : { color: "var(--color-text-tertiary)" }
                      }
                      onClick={() => setChartTab(item)}
                    >
                      {item}
                    </button>
                  ))}
                  <select className="pv-input w-24" defaultValue="sep">
                    <option value="sep">9월</option>
                    <option value="aug">8월</option>
                  </select>
                </div>
              </div>
              <BarChart />
              <div className="mt-4">
                <LineChart />
              </div>
              <div className="mt-3">
                <ChartLegend full />
              </div>
            </div>
            <div className="pv-card space-y-3 p-4">
              <p className="font-medium">작업 분포</p>
              <DonutChart />
              <Progress value={74} />
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <StatusBadge tone="success">완료</StatusBadge>
                  <span>18</span>
                </li>
                <li className="flex justify-between">
                  <StatusBadge tone="info">진행 중</StatusBadge>
                  <span>7</span>
                </li>
                <li className="flex justify-between">
                  <StatusBadge tone="warning">검토</StatusBadge>
                  <span>3</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pv-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <p className="font-medium">최근 프로젝트</p>
              <div className="flex gap-2">
                <input className="pv-input w-36" placeholder="검색" />
                <button className="pv-btn pv-btn-ghost" type="button">
                  필터
                </button>
                <select className="pv-input w-24" defaultValue="due">
                  <option value="due">정렬</option>
                </select>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-subtle)] text-[var(--color-text-tertiary)]">
                <tr>
                  <th className="px-3 py-2" />
                  <th className="px-3 py-2 font-medium">프로젝트</th>
                  <th className="px-3 py-2 font-medium">담당자</th>
                  <th className="px-3 py-2 font-medium">진행률</th>
                  <th className="px-3 py-2 font-medium">상태</th>
                  <th className="px-3 py-2 font-medium">마감일</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {projects.map((row, index) => (
                  <tr
                    key={row.name}
                    className="pv-row border-t border-[var(--color-border-subtle)]"
                    style={picked === index ? { background: "var(--color-interaction-selected)" } : undefined}
                    onClick={() => setPicked(index)}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={checked.includes(index)}
                        onChange={(event) =>
                          setChecked((current) =>
                            event.target.checked ? [...current, index] : current.filter((item) => item !== index),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {index === 1 ? <AvatarGroup /> : <Avatar initials={row.owner.slice(0, 2)} size="sm" />}
                        {index === 1 ? null : <span>{row.owner}</span>}
                      </div>
                    </td>
                    <td className="w-32 px-3 py-2">
                      <Progress value={row.progress} />
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" onMouseEnter={() => setPopover(index === 1)} onMouseLeave={() => setPopover(false)}>
                        <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                      </button>
                    </td>
                    <td className="px-3 py-2 text-[var(--color-text-secondary)]">{row.due}</td>
                    <td className="relative px-3 py-2">
                      <button type="button" onClick={() => setRowMenu(rowMenu === index ? null : index)}>
                        ⋯
                      </button>
                      {rowMenu === index ? (
                        <div className="absolute right-3 z-10 w-28 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] p-1 shadow-[0_12px_28px_var(--color-shadow-default)]">
                          {["열기", "공유", "보관"].map((item) => (
                            <button key={item} type="button" className="block w-full rounded-md px-2 py-1.5 text-left" onClick={() => setRowMenu(null)}>
                              {item}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]">
              <span>1–4 / 24개 항목</span>
              <div className="flex gap-1">
                <button className="pv-btn pv-btn-ghost" type="button">
                  이전
                </button>
                <button className="pv-btn pv-btn-outline" type="button">
                  1
                </button>
                <button className="pv-btn pv-btn-ghost" type="button">
                  2
                </button>
                <button className="pv-btn pv-btn-outline" type="button">
                  다음
                </button>
              </div>
            </div>
          </div>

          <div className="pv-card space-y-4 p-5">
            <h3 className="font-semibold">새 작업 추가</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-[var(--color-text-secondary)]">프로젝트</span>
                <select className="pv-input" defaultValue="onboarding">
                  <option value="onboarding">모바일 온보딩</option>
                  <option value="system">디자인 시스템</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-[var(--color-text-secondary)]">작업명</span>
                <input className="pv-input" defaultValue="사용자 흐름 검토" data-state="focus" />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-[var(--color-text-secondary)]">담당자</span>
                <input className="pv-input" placeholder="멤버 검색" list="members" />
                <datalist id="members">
                  <option value="윤서" />
                  <option value="민준" />
                </datalist>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-[var(--color-text-secondary)]">마감일</span>
                <input className="pv-input" type="date" defaultValue="2026-09-24" />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-[var(--color-text-secondary)]">프로젝트 코드</span>
                <input className="pv-input" defaultValue="ABC-2026-###" data-error="true" />
                <span className="mt-1 block text-xs text-[var(--color-danger-text)]">사용할 수 없는 형식입니다.</span>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-[var(--color-text-secondary)]">워크스페이스</span>
                <input className="pv-input" defaultValue="Design Team" disabled />
              </label>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {["낮음", "보통", "높음"].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="radio" name="priority" checked={priority === item} onChange={() => setPriority(item)} />
                  {item}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["기획", "디자인", "개발"].map((item) => (
                <button key={item} type="button" className="pv-chip" data-selected={stage === item} onClick={() => setStage(item)}>
                  {item}
                </button>
              ))}
            </div>
            <label className="block text-sm text-[var(--color-text-secondary)]">
              진행률 {progress}%
              <input type="range" className="mt-2 w-full" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
            </label>
            <textarea className="pv-input min-h-20" placeholder="작업에 필요한 내용을 입력하세요." />
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" /> 완료 시 팀에 알림
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> 이메일 알림 받기
              </label>
              <label className="ml-auto flex items-center gap-2">
                자동 저장
                <span className="inline-flex h-6 w-11 rounded-full p-0.5" style={{ background: "var(--color-primary-default)" }}>
                  <span className="size-5 translate-x-5 rounded-full bg-[var(--color-primary-on)]" />
                </span>
              </label>
            </div>
            <div className="rounded-xl border border-dashed border-[var(--color-border-default)] px-3 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              파일을 끌어 놓거나 찾아보기
            </div>
            <div className="flex justify-end gap-2">
              <button className="pv-btn pv-btn-outline" type="button">
                임시 저장
              </button>
              <button className="pv-btn pv-btn-primary" type="button" onClick={() => showToast("작업을 추가했습니다.")}>
                작업 추가
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="pv-card space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">최근 활동</p>
                <button className="pv-btn pv-btn-ghost" type="button" onClick={() => setOverlay("drawer")}>
                  더보기
                </button>
              </div>
              {[
                ["윤서", "파일을 업로드했습니다.", "2분 전", "success"],
                ["민준", "작업을 완료했습니다.", "1시간 전", "info"],
              ].map(([name, body, time, tone]) => (
                <div key={body} className="flex items-start gap-2">
                  <Avatar initials={name.slice(0, 2)} size="sm" />
                  <div>
                    <p className="text-sm">{body}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{time}</p>
                  </div>
                  <StatusBadge tone={tone as "success" | "info"}>{tone === "success" ? "완료" : "활동"}</StatusBadge>
                </div>
              ))}
            </div>
            <div className="pv-card space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">멤버</p>
                <button className="pv-btn pv-btn-outline" type="button">
                  초대
                </button>
              </div>
              <AvatarGroup />
              <div className="flex items-center justify-between text-sm">
                <span>윤서</span>
                <StatusBadge tone="info">Owner</StatusBadge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>민준</span>
                <StatusBadge tone="warning">Pending</StatusBadge>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--color-text-disabled)]">
                <span>게스트</span>
                <span>비활성</span>
              </div>
            </div>
            <div className="pv-card space-y-3 p-4">
              <p className="font-medium">환경 설정</p>
              <label className="flex items-center justify-between text-sm">
                알림
                <span className="inline-flex h-6 w-11 rounded-full p-0.5" style={{ background: "var(--color-primary-default)" }}>
                  <span className="size-5 translate-x-5 rounded-full bg-[var(--color-primary-on)]" />
                </span>
              </label>
              <div className="flex gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="visibility" defaultChecked /> 팀
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="visibility" /> 공개
                </label>
              </div>
              <select className="pv-input" defaultValue="list">
                <option value="list">목록</option>
                <option value="board">보드</option>
              </select>
              <div className="flex gap-1 rounded-full bg-[var(--color-surface-subtle)] p-1">
                {["좁게", "보통"].map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className="flex-1 rounded-full py-1 text-xs"
                    style={
                      index === 1
                        ? { background: "var(--color-primary-default)", color: "var(--color-primary-on)" }
                        : { color: "var(--color-text-secondary)" }
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked /> 자동 저장
              </label>
              <label className="block text-sm text-[var(--color-text-secondary)]">
                Accent 강도
                <input type="range" className="mt-2 w-full" defaultValue={60} />
              </label>
            </div>
          </div>

          <div className="pv-card p-4">
            <div className="mb-3 flex gap-4 text-sm">
              {["활동 기록", "업데이트", "도움말"].map((item) => (
                <button
                  key={item}
                  type="button"
                  style={
                    helpTab === item
                      ? { borderBottom: "2px solid var(--color-primary-default)" }
                      : { color: "var(--color-text-tertiary)" }
                  }
                  onClick={() => setHelpTab(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
              {[
                ["share", "프로젝트는 어떻게 공유하나요?", "멤버를 초대하거나 링크를 복사합니다."],
                ["notify", "알림 설정은 어디에서 바꾸나요?", "Settings에서 채널별 알림을 설정할 수 있습니다."],
                ["restore", "삭제한 항목을 복구할 수 있나요?", "보관함에서 30일 동안 복구할 수 있습니다."],
              ].map(([id, title, body]) => (
                <div key={id} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                    onClick={() => setOpenFaq(openFaq === id ? "" : id)}
                  >
                    {title}
                    <span className="text-[var(--color-text-tertiary)]">{openFaq === id ? "–" : "+"}</span>
                  </button>
                  {openFaq === id ? <p className="px-3 pb-3 text-xs text-[var(--color-text-secondary)]">{body}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="pv-btn pv-btn-outline" type="button" onClick={() => showToast("변경사항을 저장했습니다.")}>
              성공
            </button>
            <button className="pv-btn pv-btn-outline" type="button" onClick={() => showToast("마감이 가까운 작업이 있습니다.")}>
              경고
            </button>
            <button className="pv-btn pv-btn-outline" type="button" onClick={() => showToast("동기화에 실패했습니다.")}>
              오류
            </button>
            <button className="pv-btn pv-btn-outline" type="button" onClick={() => showToast("새 멤버가 참여했습니다.")}>
              정보
            </button>
            <button className="pv-btn pv-btn-primary" type="button" onClick={() => setOverlay("modal")}>
              변경사항 확인
            </button>
            <button className="pv-btn pv-btn-secondary-fill" type="button" onClick={() => setOverlay("drawer")}>
              활동 내역 열기
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-danger-default)] p-4">
            <p className="font-semibold text-[var(--color-danger-text)]">Danger Zone</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm">프로젝트 보관</p>
                <p className="text-xs text-[var(--color-text-secondary)]">프로젝트를 읽기 전용 상태로 전환합니다.</p>
              </div>
              <button className="pv-btn pv-btn-outline" type="button" disabled>
                보관하기
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--color-danger-text)]">프로젝트 삭제</p>
                <p className="text-xs text-[var(--color-text-secondary)]">이 작업은 되돌릴 수 없습니다.</p>
              </div>
              <button className="pv-btn pv-btn-danger" type="button" onClick={() => setOverlay("modal")}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {overlay === "modal" ? (
        <div className="absolute inset-0 z-30 grid place-items-center p-6" style={{ background: "var(--color-overlay-scrim)" }}>
          <div className="pv-card w-full max-w-md p-5" style={{ background: "var(--color-surface-overlay)" }}>
            <h3 className="text-base font-semibold">변경사항을 적용할까요?</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">이 동작은 팀 전체에 반영됩니다.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="pv-btn pv-btn-outline" type="button" onClick={() => setOverlay("none")}>
                취소
              </button>
              <button className="pv-btn pv-btn-danger" type="button" onClick={() => setOverlay("none")}>
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {overlay === "drawer" ? (
        <div className="absolute inset-0 z-30 flex justify-end" style={{ background: "var(--color-overlay-scrim)" }}>
          <div className="h-full w-80 bg-[var(--color-surface-overlay)] p-5">
            <h3 className="font-semibold">활동 내역</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">최근 업데이트를 시간순으로 봅니다.</p>
            <button className="pv-btn pv-btn-primary mt-4 w-full" type="button" onClick={() => setOverlay("none")}>
              닫기
            </button>
          </div>
        </div>
      ) : null}
      {toast || overlay === "toast" ? (
        <div
          className="absolute bottom-5 right-5 z-40 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--color-surface-inverse)", color: "var(--color-text-inverse)" }}
        >
          {toast ?? "변경사항을 저장했습니다."}
        </div>
      ) : null}
      {popover || overlay === "tooltip" ? (
        <div className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-[var(--color-surface-overlay)] px-3 py-2 text-xs shadow-[0_12px_28px_var(--color-shadow-default)]">
          검토 대기 작업은 담당자 확인이 필요합니다.
        </div>
      ) : null}
    </div>
  );
}
