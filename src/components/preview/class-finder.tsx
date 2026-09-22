"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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

type SeatTone = "success" | "warning" | "danger" | "info";

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
  featured?: boolean;
};

const CLASSES: ClassItem[] = [
  { id: "yoga-dawn", title: "새벽 플로우 요가", place: "성수동 스튜디오", time: "토 10:00–11:30", price: "35,000원", seats: "3자리 남음", tone: "warning", category: "요가", host: "유나", cover: "/preview/classes/yoga-dawn.jpg", alt: "새벽 해변에서 플로우 요가를 하는 모습", featured: true },
  { id: "clay-weekend", title: "주말 도예 원데이", place: "연남동 공방", time: "일 14:00–16:30", price: "58,000원", seats: "예약 가능", tone: "success", category: "도예", host: "민재", cover: "/preview/classes/clay-weekend.jpg", alt: "물레 위에서 도자기를 빚는 손" },
  { id: "bake-intro", title: "홈베이킹 입문", place: "한남동 키친", time: "토 15:30–18:00", price: "42,000원", seats: "신규 클래스", tone: "info", category: "베이킹", host: "소희", cover: "/preview/classes/bake-intro.jpg", alt: "갓 구운 빵과 밀이삭" },
  { id: "rattan-prop", title: "라탄 소품 클래스", place: "서촌 워크숍", time: "일 11:00–13:00", price: "49,000원", seats: "마감", tone: "danger", category: "공예", host: "도윤", cover: "/preview/classes/rattan-prop.jpg", alt: "라탄과 버드나무로 만든 소품 바구니" },
  { id: "yoga-sunset", title: "석양 하타 요가", place: "한남동 루프탑", time: "토 17:00–18:20", price: "38,000원", seats: "예약 가능", tone: "success", category: "요가", host: "하린", cover: "/preview/classes/yoga-sunset.jpg", alt: "석양 빛 아래 명상 요가" },
  { id: "clay-cup", title: "머그컵 도예", place: "성수동 공방", time: "일 11:00–13:00", price: "52,000원", seats: "2자리 남음", tone: "warning", category: "도예", host: "지훈", cover: "/preview/classes/clay-cup.jpg", alt: "물레에서 컵 형태를 다듬는 손" },
  { id: "bake-sourdough", title: "사워도우 클래스", place: "연남동 키친", time: "토 11:00–14:00", price: "61,000원", seats: "예약 가능", tone: "success", category: "베이킹", host: "나래", cover: "/preview/classes/bake-sourdough.jpg", alt: "슬라이스한 사워도우 빵" },
  { id: "rattan-macrame", title: "마크라메 월행잉", place: "서촌 스튜디오", time: "일 14:00–16:00", price: "45,000원", seats: "신규 클래스", tone: "info", category: "공예", host: "세린", cover: "/preview/classes/rattan-macrame.jpg", alt: "벽에 걸린 마크라메 월행잉" },
  { id: "yoga-vinyasa", title: "빈야사 플로우", place: "망원동 스튜디오", time: "토 09:00–10:20", price: "33,000원", seats: "예약 가능", tone: "success", category: "요가", host: "도아", cover: "/preview/classes/yoga-vinyasa.jpg", alt: "스튜디오에서 다운독 자세를 하는 모습" },
  { id: "clay-plate", title: "접시 굽기 원데이", place: "익선동 공방", time: "일 15:00–17:30", price: "64,000원", seats: "1자리 남음", tone: "warning", category: "도예", host: "태민", cover: "/preview/classes/clay-plate.jpg", alt: "겹쳐 둔 핸드메이드 접시" },
  { id: "bake-macaron", title: "마카롱 입문", place: "청담동 키친", time: "토 13:00–16:00", price: "68,000원", seats: "마감", tone: "danger", category: "베이킹", host: "유주", cover: "/preview/classes/bake-macaron.jpg", alt: "알록달록한 마카롱" },
  { id: "rattan-tray", title: "라탄 트레이 만들기", place: "을지로 워크숍", time: "일 10:00–12:30", price: "47,000원", seats: "예약 가능", tone: "success", category: "공예", host: "현우", cover: "/preview/classes/rattan-tray.jpg", alt: "손으로 짠 라탄 트레이" },
  { id: "yoga-restore", title: "리스토러티브 요가", place: "이태원 스튜디오", time: "일 19:00–20:10", price: "36,000원", seats: "신규 클래스", tone: "info", category: "요가", host: "미루", cover: "/preview/classes/yoga-restore.jpg", alt: "산 위에서 나무 자세를 하는 모습" },
  { id: "clay-pot", title: "화분 도예 클래스", place: "성수동 공방", time: "토 14:00–16:30", price: "55,000원", seats: "3자리 남음", tone: "warning", category: "도예", host: "은지", cover: "/preview/classes/clay-pot.jpg", alt: "테라코타 화분에 심은 허브" },
  { id: "bake-cookie", title: "쿠키 데코 원데이", place: "연남동 키친", time: "일 13:00–15:00", price: "39,000원", seats: "예약 가능", tone: "success", category: "베이킹", host: "가은", cover: "/preview/classes/bake-cookie.jpg", alt: "초콜릿 칩 쿠키" },
  { id: "rattan-mirror", title: "라탄 거울 프레임", place: "서촌 워크숍", time: "토 16:00–18:00", price: "54,000원", seats: "2자리 남음", tone: "warning", category: "공예", host: "시온", cover: "/preview/classes/rattan-mirror.jpg", alt: "라탄 테두리를 두른 원형 거울" },
];

const PAGE_SIZE = 8;

function ClassCover({ item, className }: { item: ClassItem; className?: string }) {
  return (
    <img src={item.cover} alt={item.alt} className={`aspect-square w-full object-cover ${className ?? ""}`} />
  );
}

const TABS = ["클래스 찾기", "찜한 클래스", "내 예약"] as const;
const PEOPLE = ["1명", "2명", "3명"];

type Panel = "detail" | "booking" | null;

function FindBar({
  query,
  onQuery,
  onSearch,
  dateValue,
  onDate,
  people,
  onPeople,
  stacked,
}: {
  query: string;
  onQuery: (value: string) => void;
  onSearch: () => void;
  dateValue: string;
  onDate: (value: string) => void;
  people: string;
  onPeople: (value: string) => void;
  stacked?: boolean;
}) {
  return (
    <div className={stacked ? "pv-find pv-find-stack" : "pv-find"}>
      <form
        className="pv-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <input
          className="pv-search-input"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="클래스나 지역 검색"
          data-token="surface"
        />
        <button className="pv-search-submit" type="submit" aria-label="검색" data-token="primary">
          <Search className="size-4" />
        </button>
      </form>
      <label className="pv-find-field">
        <span className="sr-only">날짜</span>
        <input
          className="pv-find-input"
          type="date"
          value={dateValue}
          onChange={(event) => onDate(event.target.value)}
          data-token="surface"
        />
      </label>
      <label className="pv-find-field">
        <span className="sr-only">인원</span>
        <select
          className="pv-find-input"
          value={people}
          onChange={(event) => onPeople(event.target.value)}
          data-token="surface"
        >
          {PEOPLE.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

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
      className="pv-card overflow-hidden border text-left transition-colors hover:bg-[var(--color-neutral-hover)] active:bg-[var(--color-neutral-pressed)]"
      data-token="surface"
      style={{
        borderColor: selected
          ? "var(--color-border-strong)"
          : "var(--color-border-default)",
        ...(selected
          ? { background: "var(--color-primary-selected, var(--color-primary-subtle))" }
          : {}),
      }}
    >
      <button type="button" className="block w-full text-left" onClick={onSelect}>
        <div className="relative">
          <ClassCover item={item} />
          {item.featured ? (
            <span
              className="absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold"
              style={{
                background: "var(--color-accent-default)",
                color: "var(--color-accent-on)",
              }}
              data-token="accent"
            >
              인기
            </span>
          ) : null}
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
            <StatusBadge tone={item.tone}>{item.seats}</StatusBadge>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {item.place} · {item.time}
          </p>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.price}</p>
        </div>
      </button>
      <div className="flex gap-2 border-t border-[var(--color-border-subtle)] px-3 py-2">
        <button
          className="pv-btn flex-1 border border-[var(--color-border-default)] bg-transparent text-[var(--color-text-link)] hover:bg-[var(--color-neutral-hover)] active:bg-[var(--color-neutral-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
          type="button"
          data-token="link-text"
          onClick={onSelect}
        >
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
      <p className="text-base font-semibold text-[var(--color-text-primary)]">{item.price}</p>
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
      <p className="text-base font-semibold text-[var(--color-text-primary)]">{item.price}</p>
      <p className="text-[var(--color-text-secondary)]">
        {item.host} 선생님과 함께하는 원데이 클래스. 재료는 현장에서 준비됩니다.
      </p>
    </div>
  );
}

export function ClassFinderWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [tab, setTab] = useState<(typeof TABS)[number]>("클래스 찾기");
  const [query, setQuery] = useState("");
  const [dateValue, setDateValue] = useState("2026-04-11");
  const [people, setPeople] = useState("2명");
  const [selectedId, setSelectedId] = useState(CLASSES[0].id);
  const [panel, setPanel] = useState<Panel>(null);
  const [page, setPage] = useState(1);
  const selected = CLASSES.find((item) => item.id === selectedId) ?? CLASSES[0];
  const results = CLASSES;
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border-default)] bg-[var(--color-surface-default)] px-5 py-3">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">클래스업</p>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full px-3 py-1.5 hover:bg-[var(--color-neutral-hover)] active:bg-[var(--color-neutral-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
                style={{
                  background: item === tab
                    ? "var(--color-primary-selected, var(--color-primary-subtle))"
                    : "transparent",
                  color: item === tab
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                  boxShadow: item === tab
                    ? "inset 0 -2px 0 var(--color-primary-default)"
                    : "none",
                }}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="ml-auto min-w-0">
            <FindBar
              query={query}
              onQuery={setQuery}
              onSearch={() => show({ type: "toast", message: "이번 주말 클래스를 다시 찾아볼게요.", tone: "info" }, 1600)}
              dateValue={dateValue}
              onDate={setDateValue}
              people={people}
              onPeople={setPeople}
            />
          </div>
        </header>

        <div className={`grid min-h-0 flex-1 ${panel ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
          <div className="min-h-0 space-y-4 overflow-auto p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                  data-token={item === currentPage ? "primary-selected" : "neutral"}
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
            <aside className="border-l border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-4">
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
  const [query, setQuery] = useState("");
  const [dateValue, setDateValue] = useState("2026-04-11");
  const [people, setPeople] = useState("2명");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const results = useMemo(() => CLASSES.slice(0, 4), []);

  function openDetail(item: ClassItem) {
    setSelectedId(item.id);
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
    setSelectedId(item.id);
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
            className="py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-focus-ring)]"
            style={{
              color: item === tab
                ? "var(--color-primary-default)"
                : "var(--color-text-tertiary)",
              background: item === tab
                ? "var(--color-primary-selected, var(--color-primary-subtle))"
                : "transparent",
              boxShadow: item === tab
                ? "inset 0 2px 0 var(--color-primary-default)"
                : "none",
            }}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </nav>}
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <div className="space-y-3 bg-[var(--color-bg-canvas)] px-4 pb-5 pt-3">
        <FindBar
          stacked
          query={query}
          onQuery={setQuery}
          onSearch={() => show({ type: "snackbar", message: "근처 클래스를 다시 찾았어요." }, 1400)}
          dateValue={dateValue}
          onDate={setDateValue}
          people={people}
          onPeople={setPeople}
        />
        <div className="space-y-3">
          {results.map((item) => (
            <ClassCard
              key={item.id}
              item={item}
              compact
              selected={item.id === selectedId}
              onSelect={() => openDetail(item)}
              onBook={() => openBooking(item)}
            />
          ))}
        </div>
      </div>
    </IntroPhone>
  );
}
