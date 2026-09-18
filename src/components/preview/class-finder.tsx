"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "./shared";
import {
  AppOverlays,
  IntroPhone,
  IntroViewport,
  WebOverlays,
  useTimedOverlay,
  type AppOverlay,
  type WebOverlay,
} from "./kinds/shared";

type SeatTone = "success" | "accent" | "danger" | "info";

type ClassItem = {
  id: string;
  title: string;
  place: string;
  time: string;
  price: string;
  seats: string;
  tone: SeatTone;
  category: string;
  cover: string;
  alt: string;
  host: string;
};

const CLASSES: ClassItem[] = [
  { id: "yoga-dawn", title: "새벽 플로우 요가", place: "성수동 스튜디오", time: "토 10:00–11:30", price: "35,000원", seats: "3자리 남음", tone: "accent", category: "요가", host: "유나", cover: "/preview/classes/yoga-dawn.jpg", alt: "새벽 해변에서 플로우 요가를 하는 모습" },
  { id: "clay-weekend", title: "주말 도예 원데이", place: "연남동 공방", time: "일 14:00–16:30", price: "58,000원", seats: "예약 가능", tone: "success", category: "도예", host: "민재", cover: "/preview/classes/clay-weekend.jpg", alt: "물레 위에서 도자기를 빚는 손" },
  { id: "bake-intro", title: "홈베이킹 입문", place: "한남동 키친", time: "토 15:30–18:00", price: "42,000원", seats: "신규 클래스", tone: "info", category: "베이킹", host: "소희", cover: "/preview/classes/bake-intro.jpg", alt: "갓 구운 빵과 밀이삭" },
  { id: "rattan-prop", title: "라탄 소품 클래스", place: "서촌 워크숍", time: "일 11:00–13:00", price: "49,000원", seats: "마감", tone: "danger", category: "공예", host: "도윤", cover: "/preview/classes/rattan-prop.jpg", alt: "라탄과 버드나무로 만든 소품 바구니" },
  { id: "yoga-sunset", title: "석양 하타 요가", place: "한남동 루프탑", time: "토 17:00–18:20", price: "38,000원", seats: "예약 가능", tone: "success", category: "요가", host: "하린", cover: "/preview/classes/yoga-sunset.jpg", alt: "석양 빛 아래 명상 요가" },
  { id: "clay-cup", title: "머그컵 도예", place: "성수동 공방", time: "일 11:00–13:00", price: "52,000원", seats: "2자리 남음", tone: "accent", category: "도예", host: "지훈", cover: "/preview/classes/clay-cup.jpg", alt: "물레에서 컵 형태를 다듬는 손" },
  { id: "bake-sourdough", title: "사워도우 클래스", place: "연남동 키친", time: "토 11:00–14:00", price: "61,000원", seats: "예약 가능", tone: "success", category: "베이킹", host: "나래", cover: "/preview/classes/bake-sourdough.jpg", alt: "슬라이스한 사워도우 빵" },
  { id: "rattan-macrame", title: "마크라메 월행잉", place: "서촌 스튜디오", time: "일 14:00–16:00", price: "45,000원", seats: "신규 클래스", tone: "info", category: "공예", host: "세린", cover: "/preview/classes/rattan-macrame.jpg", alt: "벽에 걸린 마크라메 월행잉" },
  { id: "yoga-vinyasa", title: "빈야사 플로우", place: "망원동 스튜디오", time: "토 09:00–10:20", price: "33,000원", seats: "예약 가능", tone: "success", category: "요가", host: "도아", cover: "/preview/classes/yoga-vinyasa.jpg", alt: "스튜디오에서 다운독 자세를 하는 모습" },
  { id: "clay-plate", title: "접시 굽기 원데이", place: "익선동 공방", time: "일 15:00–17:30", price: "64,000원", seats: "1자리 남음", tone: "accent", category: "도예", host: "태민", cover: "/preview/classes/clay-plate.jpg", alt: "겹쳐 둔 핸드메이드 접시" },
  { id: "bake-macaron", title: "마카롱 입문", place: "청담동 키친", time: "토 13:00–16:00", price: "68,000원", seats: "마감", tone: "danger", category: "베이킹", host: "유주", cover: "/preview/classes/bake-macaron.jpg", alt: "알록달록한 마카롱" },
  { id: "rattan-tray", title: "라탄 트레이 만들기", place: "을지로 워크숍", time: "일 10:00–12:30", price: "47,000원", seats: "예약 가능", tone: "success", category: "공예", host: "현우", cover: "/preview/classes/rattan-tray.jpg", alt: "손으로 짠 라탄 트레이" },
  { id: "yoga-restore", title: "리스토러티브 요가", place: "이태원 스튜디오", time: "일 19:00–20:10", price: "36,000원", seats: "신규 클래스", tone: "info", category: "요가", host: "미루", cover: "/preview/classes/yoga-restore.jpg", alt: "산 위에서 나무 자세를 하는 모습" },
  { id: "clay-pot", title: "화분 도예 클래스", place: "성수동 공방", time: "토 14:00–16:30", price: "55,000원", seats: "3자리 남음", tone: "accent", category: "도예", host: "은지", cover: "/preview/classes/clay-pot.jpg", alt: "테라코타 화분에 심은 허브" },
  { id: "bake-cookie", title: "쿠키 데코 원데이", place: "연남동 키친", time: "일 13:00–15:00", price: "39,000원", seats: "예약 가능", tone: "success", category: "베이킹", host: "가은", cover: "/preview/classes/bake-cookie.jpg", alt: "초콜릿 칩 쿠키" },
  { id: "rattan-mirror", title: "라탄 거울 프레임", place: "서촌 워크숍", time: "토 16:00–18:00", price: "54,000원", seats: "2자리 남음", tone: "accent", category: "공예", host: "시온", cover: "/preview/classes/rattan-mirror.jpg", alt: "라탄 테두리를 두른 원형 거울" },
];

const PAGE_SIZE = 8;

function ClassCover({ item, className }: { item: ClassItem; className?: string }) {
  return (
    <img src={item.cover} alt={item.alt} className={`aspect-square w-full object-cover ${className ?? ""}`} />
  );
}

const TABS = ["클래스 찾기", "찜한 클래스", "내 예약"] as const;
const DATES = ["토 4/11", "일 4/12", "다음 주"];
const CATEGORIES = ["전체", "요가", "도예", "베이킹", "공예"];

type Panel = "detail" | "booking" | null;

function ClassCard({
  item,
  selected,
  onSelect,
  onBook,
}: {
  item: ClassItem;
  selected?: boolean;
  compact?: boolean;
  onSelect: () => void;
  onBook: () => void;
}) {
  return (
    <article
      className="pv-card overflow-hidden text-left"
      data-token="surface"
      style={selected ? { outline: "2px solid var(--color-primary-border)" } : undefined}
    >
      <button type="button" className="block w-full text-left" onClick={onSelect}>
        <ClassCover item={item} />
        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
            <StatusBadge tone={item.tone}>{item.seats}</StatusBadge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {item.place} · {item.time}
          </p>
          <p className="text-sm font-semibold text-[var(--color-accent-text)]">{item.price}</p>
        </div>
      </button>
      <div className="flex gap-2 border-t border-[var(--color-border-subtle)] px-3 py-2">
        <button className="pv-btn pv-btn-outline flex-1" type="button" data-token="text" onClick={onSelect}>
          상세 보기
        </button>
        <button
          className="pv-btn pv-btn-primary flex-1"
          type="button"
          data-token="primary"
          disabled={item.tone === "danger"}
          onClick={onBook}
        >
          예약하기
        </button>
      </div>
    </article>
  );
}

function BookingBody({ item }: { item: ClassItem }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="font-semibold text-[var(--color-text-primary)]">{item.title}</p>
      <p className="text-[var(--color-text-secondary)]">
        {item.place}
        <br />
        {item.time} · {item.host} 선생님
      </p>
      <p className="text-base font-semibold text-[var(--color-accent-text)]">{item.price}</p>
      <label className="block space-y-1 text-xs text-[var(--color-text-secondary)]">
        예약 인원
        <select className="pv-input" defaultValue="2">
          <option>1명</option>
          <option>2명</option>
          <option>3명</option>
        </select>
      </label>
    </div>
  );
}

function DetailBody({ item }: { item: ClassItem }) {
  return (
    <div className="space-y-3 text-sm">
      <ClassCover item={item} className="rounded-xl" />
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{item.title}</h3>
        <StatusBadge tone={item.tone}>{item.seats}</StatusBadge>
      </div>
      <p className="text-[var(--color-text-secondary)]">
        {item.place} · {item.time}
      </p>
      <p className="text-base font-semibold text-[var(--color-accent-text)]">{item.price}</p>
      <p className="text-[var(--color-text-secondary)]">
        {item.host} 선생님과 함께하는 원데이 클래스. 재료는 현장에서 준비됩니다.
      </p>
    </div>
  );
}

export function ClassFinderWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [tab, setTab] = useState<(typeof TABS)[number]>("클래스 찾기");
  const [date, setDate] = useState(DATES[0]);
  const [category, setCategory] = useState("전체");
  const [region, setRegion] = useState("성수 · 연남 · 한남");
  const [people, setPeople] = useState("2명");
  const [selectedId, setSelectedId] = useState(CLASSES[0].id);
  const [panel, setPanel] = useState<Panel>(null);
  const [page, setPage] = useState(1);
  const selected = CLASSES.find((item) => item.id === selectedId) ?? CLASSES[0];
  const results = useMemo(
    () => CLASSES.filter((item) => category === "전체" || item.category === category),
    [category],
  );
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changeCategory(next: string) {
    setCategory(next);
    setPage(1);
    setPanel(null);
  }

  function selectClass(id: string) {
    setSelectedId(id);
    setPanel("detail");
  }

  function bookClass(id: string) {
    const item = CLASSES.find((entry) => entry.id === id);
    if (!item || item.tone === "danger") return;
    setSelectedId(id);
    setPanel("booking");
  }

  return (
    <IntroViewport>
      <div className="relative flex min-h-0 flex-1 flex-col bg-[var(--color-bg-canvas)]">
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] px-5 py-3">
          <p className="text-sm font-semibold">클래스업</p>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full px-3 py-1.5"
                style={{
                  background: item === tab ? "var(--color-primary-default)" : "transparent",
                  color: item === tab ? "var(--color-primary-on)" : "var(--color-text-secondary)",
                }}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </header>

        <div className={`grid min-h-0 flex-1 ${panel ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
          <div className="min-h-0 space-y-4 overflow-auto p-5">
            <section className="pv-card space-y-3 p-4" data-token="surface">
              <p className="text-xs tracking-[0.16em] text-[var(--color-text-tertiary)]">클래스 찾기</p>
              <h2 className="text-2xl font-semibold tracking-tight">이번 주말, 뭐 배워볼까?</h2>
              <div className="grid gap-2 md:grid-cols-[1.2fr_0.9fr_0.7fr_auto]">
                <input
                  className="pv-input"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="지역 검색"
                  data-token="surface"
                />
                <input className="pv-input" type="date" defaultValue="2026-04-11" data-token="surface" />
                <select className="pv-input" value={people} onChange={(event) => setPeople(event.target.value)} data-token="surface">
                  <option>1명</option>
                  <option>2명</option>
                  <option>3명</option>
                </select>
                <button
                  className="pv-btn pv-btn-primary"
                  type="button"
                  data-token="primary"
                  onClick={() => show({ type: "toast", message: "이번 주말 클래스를 다시 찾아볼게요.", tone: "info" }, 1600)}
                >
                  검색
                </button>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-2">
              {DATES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="pv-chip"
                  data-selected={item === date}
                  data-token={item === date ? "primary" : "text"}
                  onClick={() => setDate(item)}
                >
                  {item}
                </button>
              ))}
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="pv-chip"
                  data-selected={item === category}
                  data-token={item === category ? "secondary" : "text"}
                  onClick={() => changeCategory(item)}
                >
                  {item}
                </button>
              ))}
              <button
                className="pv-btn pv-btn-secondary-fill"
                type="button"
                data-token="secondary"
                onClick={() =>
                  setOverlay({
                    type: "drawer",
                    title: "필터",
                    body: "시간대, 난이도, 가격대를 골라 클래스를 좁힐 수 있어요.",
                  })
                }
              >
                필터
              </button>
              <button
                className="pv-btn pv-btn-outline"
                type="button"
                data-token="text"
                onClick={() => {
                  changeCategory("전체");
                  setDate(DATES[0]);
                }}
              >
                필터 초기화
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {pageItems.map((item) => (
                <ClassCard
                  key={item.id}
                  item={item}
                  compact
                  selected={item.id === selectedId && panel !== null}
                  onSelect={() => selectClass(item.id)}
                  onBook={() => bookClass(item.id)}
                />
              ))}
            </div>

            <nav className="flex items-center justify-center gap-2" aria-label="클래스 목록 페이지">
              <button
                className="pv-btn pv-btn-outline"
                type="button"
                data-token="text"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                이전
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
                <button
                  key={item}
                  type="button"
                  className="pv-chip"
                  data-selected={item === currentPage}
                  data-token={item === currentPage ? "primary" : "text"}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ))}
              <button
                className="pv-btn pv-btn-outline"
                type="button"
                data-token="text"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                다음
              </button>
            </nav>
          </div>

          {panel ? (
            <aside className="border-l border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] p-4">
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {panel === "booking" ? "예약 확인" : "클래스 상세"}
              </p>
              <div className="mt-3">
                {panel === "booking" ? <BookingBody item={selected} /> : <DetailBody item={selected} />}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="pv-btn pv-btn-outline flex-1" type="button" onClick={() => setPanel(null)}>
                  닫기
                </button>
                {panel === "detail" ? (
                  <button className="pv-btn pv-btn-primary flex-1" type="button" onClick={() => bookClass(selected.id)}>
                    예약하기
                  </button>
                ) : (
                  <button
                    className="pv-btn pv-btn-primary flex-1"
                    type="button"
                    onClick={() => {
                      setPanel(null);
                      show({ type: "toast", message: "예약이 확정되었습니다.", tone: "success" }, 1800);
                    }}
                  >
                    예약 확정
                  </button>
                )}
              </div>
            </aside>
          ) : null}
        </div>

        <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
      </div>
    </IntroViewport>
  );
}

export function ClassFinderApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });
  const [tab, setTab] = useState<(typeof TABS)[number]>("클래스 찾기");
  const [date, setDate] = useState(DATES[0]);
  const [category, setCategory] = useState("전체");
  const selected = CLASSES[0];
  const results = useMemo(
    () =>
      CLASSES.filter((item) => category === "전체" || item.category === category).slice(0, 4),
    [category],
  );

  function openDetail(item: ClassItem) {
    setOverlay({
      type: "sheet",
      title: item.title,
      body: (
        <div className="space-y-3">
          <DetailBody item={item} />
          <button
            className="pv-btn pv-btn-primary w-full"
            type="button"
            onClick={() => openBooking(item)}
            disabled={item.tone === "danger"}
          >
            예약하기
          </button>
        </div>
      ),
    });
  }

  function openBooking(item: ClassItem) {
    if (item.tone === "danger") return;
    setOverlay({
      type: "dialog",
      title: "예약 확인",
      body: `${item.title} · ${item.time} · ${item.price}`,
      confirm: "예약 확정",
      onConfirm: () => show({ type: "toast", message: "예약이 확정되었습니다.", tone: "success" }, 1600),
    });
  }

  return (
    <IntroPhone
      nav={<nav className="grid shrink-0 grid-cols-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] text-center text-[11px]">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            className="py-3"
            style={{ color: item === tab ? "var(--color-primary-text)" : "var(--color-text-tertiary)" }}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <div className="space-y-3 bg-[var(--color-bg-canvas)] px-4 pb-5 pt-3">
        <div>
          <p className="text-xs text-[var(--color-text-tertiary)]">클래스 찾기</p>
          <h2 className="text-xl font-semibold">이번 주말, 뭐 배워볼까?</h2>
        </div>
        <input className="pv-input" defaultValue="성수 · 연남" placeholder="지역 검색" data-token="surface" />
        <div className="grid grid-cols-2 gap-2">
          <input className="pv-input" type="date" defaultValue="2026-04-11" data-token="surface" />
          <select className="pv-input" defaultValue="2명" data-token="surface">
            <option>1명</option>
            <option>2명</option>
            <option>3명</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className="pv-btn pv-btn-primary flex-1"
            type="button"
            onClick={() => show({ type: "snackbar", message: "근처 클래스를 다시 찾았어요." }, 1400)}
          >
            검색
          </button>
          <button
            className="pv-btn pv-btn-secondary-fill"
            type="button"
            onClick={() =>
              setOverlay({
                type: "sheet",
                title: "필터",
                body: <p className="text-sm text-[var(--color-text-secondary)]">시간대와 난이도로 좁힐 수 있어요.</p>,
              })
            }
          >
            필터
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {DATES.map((item) => (
            <button key={item} type="button" className="pv-chip" data-selected={item === date} onClick={() => setDate(item)}>
              {item}
            </button>
          ))}
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className="pv-chip"
              data-selected={item === category}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {results.map((item) => (
            <ClassCard
              key={item.id}
              item={item}
              compact
              selected={item.id === selected.id}
              onSelect={() => openDetail(item)}
              onBook={() => openBooking(item)}
            />
          ))}
        </div>
      </div>
    </IntroPhone>
  );
}
