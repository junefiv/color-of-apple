"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Download,
  MoreHorizontal,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useMatchuStore } from "@/lib/store";

export type Category = "식비" | "쇼핑" | "교통" | "생활";
export type Entry = { id: number; name: string; nameEn: string; amount: number; category: Category; date: string; memo: string; memoEn: string };
export type NoticeTone = "success" | "danger";
export type Notify = (message: string, tone?: NoticeTone) => void;

export const CATEGORIES: Category[] = ["식비", "쇼핑", "교통", "생활"];
export const SHARES: Record<Category, number> = { 식비: 0.18, 쇼핑: 0.1, 교통: 0.08, 생활: 0.64 };
const LAST: Record<Category, number> = { 식비: 0.22, 쇼핑: 0.14, 교통: 0.07, 생활: 0.57 };
const CATEGORY_EN: Record<Category, string> = { 식비: "Food", 쇼핑: "Shopping", 교통: "Transit", 생활: "Living" };
type Sort = "latest" | "amount" | "name";

// Every visible string in the budget sample comes in Korean and English; amounts follow the locale.
export function useLedgerText() {
  const isKo = useMatchuStore((state) => state.locale) === "ko";
  const t = (ko: string, en: string) => (isKo ? ko : en);
  const money = (amount: number) => isKo
    ? `${Math.round(amount).toLocaleString("ko-KR")}원`
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(Math.round(amount));
  const cat = (item: Category | "전체") => item === "전체" ? t("전체", "All") : isKo ? item : CATEGORY_EN[item];
  // Sample dates are stored as "9월 22일".
  const day = (date: string) => isKo ? date : date.replace(/(\d+)월 (\d+)일/, (_, m: string, d: string) => `${["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m)]} ${d}`);
  // Short form for tight spots like the donut centre: 125만원 / ₩1.2M.
  const compact = (amount: number) => isKo ? `${Math.round(amount / 10000).toLocaleString("ko-KR")}만원` : `₩${amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}M` : `${Math.round(amount / 1000)}K`}`;
  const name = (entry: Entry) => isKo ? entry.name : entry.nameEn;
  const memo = (entry: Entry) => isKo ? entry.memo : entry.memoEn;
  return { isKo, t, money, compact, cat, day, name, memo };
}

function categoryDonutGradient(shares: number[]) {
  let cursor = 0;
  return shares
    .map((share, index) => {
      const start = cursor;
      cursor += share;
      return `var(--color-categorical-${index}-fg) ${start}% ${cursor}%`;
    })
    .join(", ");
}

function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className="ledger-switch" onClick={() => onChange(!checked)}>
      <i />
    </button>
  );
}

// Small dialog used by the views: traps focus, closes on Escape or the scrim, returns focus to the opener.
export function LedgerSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const root = ref.current!;
    root.querySelector<HTMLElement>("input, select, button:not([data-close])")?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const items = Array.from(root.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select, textarea"));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    root.addEventListener("keydown", key);
    return () => { root.removeEventListener("keydown", key); requestAnimationFrame(() => opener?.focus()); };
  }, []);
  const { t } = useLedgerText();
  return (
    <div className="ledger-scrim" onClick={onClose}>
      <div className="ledger-dialog" role="dialog" aria-modal="true" aria-label={title} ref={ref} onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button className="ledger-icon-btn" type="button" data-close onClick={onClose} aria-label={t("닫기", "Close")}><X size={18} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function TidyView({ mobile, entries, onOpen, onNotice, onRecategorize, onDelete }: {
  mobile: boolean;
  entries: Entry[];
  onOpen: (entry: Entry) => void;
  onNotice: Notify;
  onRecategorize: (ids: number[], category: Category) => void;
  onDelete: (ids: number[]) => void;
}) {
  const { t, money, cat, day, name, memo, isKo } = useLedgerText();
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-22");
  const [filter, setFilter] = useState<Category | "전체">("전체");
  const [sort, setSort] = useState<Sort>("latest");
  const [picked, setPicked] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [shown, setShown] = useState(4);
  const [sheet, setSheet] = useState<"filter" | "export" | "move" | null>(null);
  const [moveTo, setMoveTo] = useState<Category>("생활");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = entries.filter((entry) => (filter === "전체" || entry.category === filter)
      && `${entry.name} ${entry.memo} ${entry.nameEn} ${entry.memoEn}`.toLowerCase().includes(needle));
    if (sort === "amount") return [...next].sort((a, b) => b.amount - a.amount);
    if (sort === "name") return [...next].sort((a, b) => (isKo ? a.name.localeCompare(b.name, "ko") : a.nameEn.localeCompare(b.nameEn, "en")));
    return next;
  }, [entries, filter, query, sort, isKo]);
  const size = 5;
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages);
  const rows = mobile ? filtered.slice(0, shown) : filtered.slice((current - 1) * size, current * size);
  const allOnPage = rows.length > 0 && rows.every((row) => picked.includes(row.id));
  const toggle = (id: number) => setPicked((value) => (value.includes(id) ? value.filter((item) => item !== id) : [...value, id]));
  function toggleAll() {
    const ids = rows.map((row) => row.id);
    setPicked((value) => (allOnPage ? value.filter((id) => !ids.includes(id)) : [...new Set([...value, ...ids])]));
  }
  const sortOptions: [Sort, string][] = [["latest", t("최신순", "Newest")], ["amount", t("금액 높은순", "Highest amount")], ["name", t("이름순", "Name")]];
  const categorySelect = (
    <select value={filter} onChange={(e) => { setFilter(e.target.value as Category | "전체"); setPage(1); }}>
      {(["전체", ...CATEGORIES] as const).map((item) => <option key={item} value={item}>{cat(item)}</option>)}
    </select>
  );
  const sortSelect = <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>{sortOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>;

  const tools = (
    <div className="ledger-tools">
      <label className="ledger-search">
        <Search size={16} />
        <input aria-label={t("거래 검색", "Search transactions")} placeholder={t("거래 이름이나 메모 검색", "Search by name or memo")} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
      </label>
      {mobile ? (
        <button className="ledger-btn ledger-neutral" type="button" onClick={() => setSheet("filter")}>
          <SlidersHorizontal size={15} />{t("필터", "Filter")}
        </button>
      ) : (
        <>
          <label className="ledger-mini">{t("시작", "From")}<input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="ledger-mini">{t("끝", "To")}<input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
          <label className="ledger-mini">{t("카테고리", "Category")}{categorySelect}</label>
          <label className="ledger-mini">{t("정렬", "Sort")}{sortSelect}</label>
        </>
      )}
    </div>
  );

  const bulk = (
    <div className={mobile ? "ledger-bulkbar" : "ledger-toolbar"} data-active={picked.length > 0}>
      <span>{t(`${picked.length}건 선택`, `${picked.length} selected`)}</span>
      <button className="ledger-btn ledger-neutral" type="button" disabled={picked.length === 0} onClick={() => setSheet("move")}>{t("카테고리 변경", "Change category")}</button>
      <button className="ledger-btn ledger-danger-button" type="button" disabled={picked.length === 0} onClick={() => { onDelete(picked); onNotice(t(`${picked.length}건을 삭제했어요.`, `Deleted ${picked.length} transactions.`)); setPicked([]); }}>
        <Trash2 size={14} />{t("삭제", "Delete")}
      </button>
      {mobile && <button className="ledger-btn ledger-neutral" type="button" onClick={() => setSheet("export")}>{t("내보내기", "Export")}</button>}
    </div>
  );

  const sheetTitle = sheet === "filter" ? t("필터", "Filter") : sheet === "move" ? t("카테고리 변경", "Change category") : t("내보내기", "Export");
  const sheetBody = sheet === "filter" ? (
    <div className="ledger-sheet-form">
      <label className="ledger-field">{t("시작", "From")}<input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label>
      <label className="ledger-field">{t("끝", "To")}<input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
      <label className="ledger-field">{t("카테고리", "Category")}{categorySelect}</label>
      <label className="ledger-field">{t("정렬", "Sort")}{sortSelect}</label>
      <button className="ledger-btn ledger-primary" type="button" onClick={() => setSheet(null)}>{t("적용", "Apply")}</button>
    </div>
  ) : sheet === "move" ? (
    <div className="ledger-sheet-form">
      <p className="ledger-form-hint">{t(`선택한 ${picked.length}건을 옮길 카테고리를 골라요.`, `Pick a category for the ${picked.length} selected transactions.`)}</p>
      <div className="ledger-filters" role="radiogroup" aria-label={t("새 카테고리", "New category")}>
        {CATEGORIES.map((item) => <button key={item} type="button" role="radio" aria-checked={moveTo === item} onClick={() => setMoveTo(item)}>{cat(item)}</button>)}
      </div>
      <button className="ledger-btn ledger-primary" type="button" onClick={() => { onRecategorize(picked, moveTo); onNotice(t(`${picked.length}건을 ${cat(moveTo)}(으)로 옮겼어요.`, `Moved ${picked.length} to ${cat(moveTo)}.`)); setPicked([]); setSheet(null); }}>{t("옮기기", "Move")}</button>
    </div>
  ) : (
    <div className="ledger-sheet-form">
      <p className="ledger-form-hint">{t("선택한 기간의 거래를 CSV로 내려받아요.", "Download this period's transactions as CSV.")}</p>
      <button className="ledger-btn ledger-primary" type="button" onClick={() => { setSheet(null); onNotice(t("거래 정리 파일을 준비했어요.", "Your transaction file is ready.")); }}>{t("내보내기", "Export")}</button>
    </div>
  );

  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">CLEAN UP</span>
          <h2>{t("거래 정리", "Transactions")}</h2>
        </div>
        <span className="ledger-muted">{t(`${filtered.length}건`, `${filtered.length} items`)}</span>
      </div>
      {tools}
      {!mobile && bulk}
      {filtered.length === 0 ? (
        <div className="ledger-empty">
          <Search size={24} />
          <p>{t("일치하는 거래가 없어요.", "No matching transactions.")}</p>
          <button className="ledger-link" type="button" onClick={() => { setQuery(""); setFilter("전체"); }}>{t("필터 초기화", "Reset filters")}</button>
        </div>
      ) : mobile ? (
        <div className="ledger-entry-list">
          {rows.map((entry) => (
            <div className={`ledger-entry ledger-pick${picked.includes(entry.id) ? " is-picked" : ""}`} key={entry.id}>
              <input type="checkbox" aria-label={t(`${name(entry)} 선택`, `Select ${name(entry)}`)} checked={picked.includes(entry.id)} onChange={() => toggle(entry.id)} />
              <button type="button" onClick={() => onOpen(entry)}>
                <span className="ledger-entry-copy">
                  <strong>{name(entry)}</strong>
                  <small>{cat(entry.category)} · {day(entry.date)}</small>
                </span>
                <strong className="ledger-amount">−{money(entry.amount)}</strong>
              </button>
            </div>
          ))}
          {shown < filtered.length && <button className="ledger-btn ledger-neutral ledger-more" type="button" onClick={() => setShown((value) => value + 4)}>{t("더 보기", "Show more")}</button>}
        </div>
      ) : (
        <div className="ledger-table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label={t("현재 페이지 전체 선택", "Select all on this page")} checked={allOnPage} onChange={toggleAll} /></th>
                <th>{t("사용처", "Merchant")}</th>
                <th>{t("카테고리", "Category")}</th>
                <th>{t("날짜", "Date")}</th>
                <th>{t("금액", "Amount")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className={picked.includes(entry.id) ? "is-picked" : undefined} onClick={() => onOpen(entry)}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={t(`${name(entry)} 선택`, `Select ${name(entry)}`)} checked={picked.includes(entry.id)} onChange={() => toggle(entry.id)} /></td>
                  <td><strong>{name(entry)}</strong><small>{memo(entry)}</small></td>
                  <td>{cat(entry.category)}</td>
                  <td>{day(entry.date)}</td>
                  <td>−{money(entry.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!mobile && pages > 1 && (
        <nav className="ledger-pager" aria-label={t("거래 페이지", "Transaction pages")}>
          <button className="ledger-btn ledger-neutral" type="button" disabled={current <= 1} onClick={() => setPage(current - 1)}>{t("이전", "Previous")}</button>
          {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
            <button key={item} type="button" className="ledger-page" aria-current={item === current ? "page" : undefined} onClick={() => setPage(item)}>{item}</button>
          ))}
          <button className="ledger-btn ledger-neutral" type="button" disabled={current >= pages} onClick={() => setPage(current + 1)}>{t("다음", "Next")}</button>
        </nav>
      )}
      {mobile && picked.length > 0 && bulk}
      {sheet && <LedgerSheet title={sheetTitle} onClose={() => setSheet(null)}>{sheetBody}</LedgerSheet>}
    </section>
  );
}

export function SetupView({ budget, onSave }: { budget: number; onSave: (value: number, message: string) => void }) {
  const { t, money, cat } = useLedgerText();
  const [amount, setAmount] = useState(String(budget));
  const [auto, setAuto] = useState(true);
  const [mode, setMode] = useState<"ratio" | "last" | "manual">("ratio");
  const split = (value: number, share: Record<Category, number>) => Object.fromEntries(CATEGORIES.map((item) => [item, Math.round(value * share[item])])) as Record<Category, number>;
  const [caps, setCaps] = useState<Record<Category, number>>(() => split(budget, SHARES));
  const total = Number(amount);
  const valid = total >= 10000 && total <= 100000000 && Number.isInteger(total);
  const locked = auto && mode !== "manual";
  const assigned = CATEGORIES.reduce((sum, item) => sum + caps[item], 0);
  const over = valid && assigned > total;
  const apply = (next: number, share: Record<Category, number>) => setCaps(split(next, share));
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">SET THE RULES</span>
          <h2>{t("예산 설정", "Budget")}</h2>
        </div>
        <label className="ledger-inline ledger-switch-row">
          {t("자동 배분", "Auto split")}
          <Switch checked={auto} onChange={(value) => { setAuto(value); if (!value) setMode("manual"); else if (valid) { setMode("ratio"); apply(total, SHARES); } }} label={t("자동 배분", "Auto split")} />
        </label>
      </div>
      <label className="ledger-field">{t("한 달 예산", "Monthly budget")}
        <span className="ledger-input-wrap">
          <input aria-label={t("한 달 예산", "Monthly budget")} type="number" min={10000} max={100000000} step={1} value={amount} onChange={(e) => { setAmount(e.target.value); const next = Number(e.target.value); if (next >= 10000 && locked) apply(next, mode === "last" ? LAST : SHARES); }} aria-invalid={!!amount && !valid} />
          <span>{t("원", "KRW")}</span>
        </span>
      </label>
      {amount && !valid && <p className="ledger-form-error" role="alert">{t("10,000원부터 1억원까지 정수로 입력해 주세요.", "Enter a whole number from ₩10,000 to ₩100,000,000.")}</p>}
      <fieldset className="ledger-radios">
        <legend>{t("배분 방식", "Split method")}</legend>
        {([["ratio", t("고정 비율", "Fixed ratio")], ["last", t("지난달 기준", "Based on last month")], ["manual", t("직접 입력", "Manual")]] as const).map(([id, label]) => (
          <label key={id}>
            <input type="radio" name="split" checked={mode === id} disabled={!auto && id !== "manual"} onChange={() => { setMode(id); if (valid && id !== "manual") apply(total, id === "last" ? LAST : SHARES); }} />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="ledger-sliders">
        {CATEGORIES.map((item) => (
          <label key={item} className="ledger-slider">
            <span className="ledger-between"><span>{cat(item)}</span><strong>{money(caps[item])}</strong></span>
            <input type="range" min={0} max={valid ? total : budget} step={10000} disabled={locked} value={caps[item]} onChange={(e) => setCaps((value) => ({ ...value, [item]: Number(e.target.value) }))} />
          </label>
        ))}
      </div>
      <p className={`ledger-allocation${over ? " is-over" : ""}`} role={over ? "alert" : undefined}>
        {over
          ? t(`배분 합계가 예산보다 ${money(assigned - total)} 많아요.`, `Categories exceed the budget by ${money(assigned - total)}.`)
          : t(`배분 합계 ${money(assigned)} · 남은 금액 ${money(Math.max(0, (valid ? total : budget) - assigned))}`, `Assigned ${money(assigned)} · ${money(Math.max(0, (valid ? total : budget) - assigned))} left`)}
      </p>
      <div className="ledger-dialog-actions">
        <button className="ledger-btn ledger-secondary" type="button" onClick={() => { setAmount(String(budget)); setAuto(true); setMode("ratio"); apply(budget, SHARES); }}>{t("초기화", "Reset")}</button>
        <button className="ledger-btn ledger-primary" type="button" disabled={!valid || over} onClick={() => onSave(total, t("예산 기준을 저장했어요.", "Budget saved."))}>{t("저장", "Save")}</button>
      </div>
    </section>
  );
}

export function AlertsView() {
  const { t } = useLedgerText();
  const [on, setOn] = useState(true);
  const [channels, setChannels] = useState({ push: true, email: true, sms: false });
  const [cycle, setCycle] = useState<"now" | "daily" | "weekly">("daily");
  const [limit, setLimit] = useState(80);
  const [time, setTime] = useState("21:00");
  const [open, setOpen] = useState("budget");
  const toggle = (key: keyof typeof channels) => setChannels((value) => ({ ...value, [key]: !value[key] }));
  const rules = [
    ["budget", t("예산 초과", "Over budget"), "warning", t(`한도의 ${limit}%가 되면 알려요.`, `Alerts you at ${limit}% of a limit.`)],
    ["repeat", t("반복 결제", "Recurring payments"), "info", t("정기 결제 3일 전에 미리 알려요.", "Reminds you 3 days before a recurring payment.")],
    ["goal", t("목표 달성", "Goal reached"), "success", t("저축 목표에 도달하면 축하 알림을 보내요.", "Celebrates when you reach a savings goal.")],
  ] as const;
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">STAY AHEAD</span>
          <h2>{t("알림 · 자동화", "Alerts & automation")}</h2>
        </div>
        <label className="ledger-inline ledger-switch-row">
          {t("알림 받기", "Get alerts")}
          <Switch checked={on} onChange={setOn} label={t("알림 받기", "Get alerts")} />
        </label>
      </div>
      <fieldset className="ledger-checks" disabled={!on}>
        <legend>{t("알림 채널", "Channels")}</legend>
        <label><input type="checkbox" checked={channels.push} onChange={() => toggle("push")} />{t("앱 푸시", "Push")}</label>
        <label><input type="checkbox" checked={channels.email} onChange={() => toggle("email")} />{t("이메일", "Email")}</label>
        <label className="is-disabled"><input type="checkbox" checked={channels.sms} disabled />{t("SMS · 준비 중", "SMS · Coming soon")}</label>
      </fieldset>
      <fieldset className="ledger-radios" disabled={!on}>
        <legend>{t("알림 주기", "Frequency")}</legend>
        {([["now", t("즉시", "Instantly")], ["daily", t("매일", "Daily")], ["weekly", t("매주", "Weekly")]] as const).map(([id, label]) => (
          <label key={id}><input type="radio" name="cycle" checked={cycle === id} onChange={() => setCycle(id)} />{label}</label>
        ))}
      </fieldset>
      <label className={`ledger-slider${on ? "" : " is-disabled"}`}>
        <span className="ledger-between"><span>{t("예산 임계값", "Budget threshold")}</span><strong>{limit}%</strong></span>
        <input type="range" min={50} max={100} step={5} disabled={!on} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
      </label>
      <label className="ledger-field">{t("알림 시간", "Alert time")}
        <input type="time" value={time} disabled={!on || cycle === "now"} onChange={(e) => setTime(e.target.value)} />
      </label>
      <div className="ledger-accs">
        {rules.map(([id, title, tone, body]) => (
          <div key={id} className={`ledger-acc ledger-${tone}`}>
            <button type="button" aria-expanded={open === id} onClick={() => setOpen(open === id ? "" : id)}>
              <span>{title}</span>
              <ChevronDown size={16} />
            </button>
            {open === id && <p>{body}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

type Account = { id: string; name: [string, string]; bank: [string, string]; amount: number; linked: boolean };
const ACCOUNTS: Account[] = [
  { id: "daily", name: ["생활 입출금", "Everyday account"], bank: ["모아은행", "Moa Bank"], amount: 842000, linked: true },
  { id: "card", name: ["생활비 카드", "Living card"], bank: ["잎새카드", "Leaf Card"], amount: 126400, linked: true },
  { id: "rainy", name: ["비상금 통장", "Rainy-day fund"], bank: ["둥지은행", "Nest Bank"], amount: 2100000, linked: false },
];

export function AccountsView({ onNotice }: { onNotice: Notify }) {
  const { t, money } = useLedgerText();
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [main, setMain] = useState("daily");
  const [hide, setHide] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [cut, setCut] = useState<Account | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const label = (pair: [string, string]) => t(pair[0], pair[1]);
  const setLinked = (id: string, linked: boolean) => setAccounts((items) => items.map((item) => (item.id === id ? { ...item, linked } : item)));
  function relink(item: Account) {
    setSyncing(item.id);
    window.setTimeout(() => { setSyncing(null); setLinked(item.id, true); onNotice(t(`${label(item.name)}을(를) 다시 연결했어요.`, `${label(item.name)} is connected again.`)); }, 700);
  }
  return (
    <div className="ledger-account-grid">
      {accounts.map((item) => (
        <section className={`ledger-card ledger-account${item.linked ? "" : " is-unlinked"}`} key={item.id}>
          <div className="ledger-between">
            <span className={`ledger-status ledger-${item.linked ? "success" : "danger"}`}>{item.linked ? t("연결됨", "Connected") : t("연결 끊김", "Disconnected")}</span>
            <button className="ledger-icon-btn" type="button" aria-label={t(`${label(item.name)} 더보기`, `More for ${label(item.name)}`)} aria-expanded={menu === item.id} onClick={() => setMenu(menu === item.id ? null : item.id)}>
              <MoreHorizontal size={16} />
            </button>
          </div>
          {menu === item.id && (
            <div className="ledger-menu">
              <button type="button" onClick={() => { setMenu(null); onNotice(t("계좌 별칭을 바꿀 수 있어요.", "You can rename this account.")); }}>{t("별칭 수정", "Rename")}</button>
              {item.linked && <button type="button" className="is-danger" onClick={() => { setMenu(null); setCut(item); }}>{t("연결 해제", "Disconnect")}</button>}
            </div>
          )}
          <h2>{label(item.name)}</h2>
          <p>{label(item.bank)}</p>
          <strong className={hide ? "ledger-inverse-mask" : undefined}>{hide ? "••••••" : money(item.amount)}</strong>
          {item.linked ? (
            <label className="ledger-radio-row">
              <input type="radio" name="main-account" checked={main === item.id} onChange={() => setMain(item.id)} />
              {t("기본 계좌", "Primary")}
            </label>
          ) : (
            <button className="ledger-btn ledger-secondary ledger-relink" type="button" disabled={syncing === item.id} onClick={() => relink(item)}>
              <RefreshCw size={14} className={syncing === item.id ? "ledger-spin" : undefined} />{syncing === item.id ? t("연결 중", "Connecting") : t("다시 연결", "Reconnect")}
            </button>
          )}
        </section>
      ))}
      <section className="ledger-card ledger-account-tools">
        <label className="ledger-inline ledger-switch-row">
          {t("잔액 숨기기", "Hide balances")}
          <Switch checked={hide} onChange={setHide} label={t("잔액 숨기기", "Hide balances")} />
        </label>
        <p className="ledger-muted">{t("카드와 계좌 잔액을 가림 값으로 보여줘요.", "Shows masked values instead of balances.")}</p>
      </section>
      {cut && (
        <LedgerSheet title={t("연결을 해제할까요?", "Disconnect this account?")} onClose={() => setCut(null)}>
          <p className="ledger-form-hint">{t("이 계좌의 거래는 더 이상 자동으로 들어오지 않아요.", "New transactions from this account will stop syncing.")}</p>
          <div className="ledger-dialog-actions">
            <button className="ledger-btn ledger-neutral" type="button" onClick={() => setCut(null)}>{t("취소", "Cancel")}</button>
            <button className="ledger-btn ledger-danger-button" type="button" onClick={() => { setLinked(cut.id, false); if (main === cut.id) setMain(accounts.find((item) => item.linked && item.id !== cut.id)?.id ?? ""); setCut(null); onNotice(t("계좌 연결을 해제했어요.", "Account disconnected.")); }}>{t("연결 해제", "Disconnect")}</button>
          </div>
        </LedgerSheet>
      )}
    </div>
  );
}

const PERIODS = { week: { ko: "1주", en: "1 week", scale: 0.25 }, month: { ko: "1달", en: "1 month", scale: 1 }, quarter: { ko: "3달", en: "3 months", scale: 3 } } as const;

export function AnalysisView() {
  const { t, money, compact, cat, isKo } = useLedgerText();
  const [period, setPeriod] = useState<keyof typeof PERIODS>("month");
  const [chart, setChart] = useState<"donut" | "bar">("donut");
  const [legend, setLegend] = useState<Record<Category, boolean>>({ 식비: true, 쇼핑: true, 교통: true, 생활: true });
  const [tip, setTip] = useState<Category | null>("식비");
  // The sample month scales with the period so switching it visibly changes the numbers.
  const base: Record<Category, number> = { 식비: 259800, 쇼핑: 194400, 교통: 50000, 생활: 742600 };
  const before: Record<Category, number> = { 식비: 210000, 쇼핑: 160000, 교통: 48000, 생활: 700000 };
  const scale = PERIODS[period].scale;
  const values = Object.fromEntries(CATEGORIES.map((item) => [item, Math.round(base[item] * scale)])) as Record<Category, number>;
  const last = Object.fromEntries(CATEGORIES.map((item) => [item, Math.round(before[item] * scale)])) as Record<Category, number>;
  const visible = CATEGORIES.filter((item) => legend[item]);
  const total = visible.reduce((sum, item) => sum + values[item], 0);
  const peak = Math.max(...CATEGORIES.map((item) => Math.max(values[item], last[item])));
  const periodLabel = isKo ? PERIODS[period].ko : PERIODS[period].en;
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">SEE THE MIX</span>
          <h2>{t("지출 분석", "Spending analysis")}</h2>
        </div>
        <div className="ledger-seg" role="radiogroup" aria-label={t("기간", "Period")}>
          {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((item) => (
            <button key={item} type="button" role="radio" aria-checked={period === item} onClick={() => setPeriod(item)}>{isKo ? PERIODS[item].ko : PERIODS[item].en}</button>
          ))}
        </div>
      </div>
      <div className="ledger-seg ledger-seg-ghost" role="radiogroup" aria-label={t("차트 종류", "Chart type")}>
        {([["donut", t("도넛", "Donut")], ["bar", t("막대", "Bars")]] as const).map(([id, label]) => (
          <button key={id} type="button" role="radio" aria-checked={chart === id} onClick={() => setChart(id)}>{label}</button>
        ))}
      </div>
      <div className="ledger-chart-content">
        {chart === "donut" ? (
          <div className="ledger-donut" role="img" aria-label={visible.map((item) => `${cat(item)} ${money(values[item])}`).join(", ")} style={{ background: `conic-gradient(${categoryDonutGradient(CATEGORIES.map((item) => (legend[item] ? values[item] / Math.max(total, 1) * 100 : 0)))})` }}>
            <div><small>{t("총 지출", "Total")}</small><strong>{isKo ? <>{Math.round(total / 10000)}<small>만원</small></> : compact(total)}</strong></div>
          </div>
        ) : (
          <div className="ledger-bars" role="img" aria-label={visible.map((item) => `${cat(item)} ${money(values[item])}`).join(", ")}>
            {CATEGORIES.map((item, index) => (
              <span key={item} className={`ledger-category-${index}`} style={{ height: `${legend[item] ? Math.max(12, values[item] / peak * 120) : 6}px`, opacity: legend[item] ? 1 : 0.28 }} />
            ))}
          </div>
        )}
        <div className="ledger-legend">
          {CATEGORIES.map((item, index) => (
            <label key={item}>
              <input type="checkbox" checked={legend[item]} onChange={() => setLegend((value) => ({ ...value, [item]: !value[item] }))} aria-label={t(`${cat(item)} 표시`, `Show ${cat(item)}`)} />
              <i className={`ledger-category-${index}`} />
              <button type="button" aria-pressed={tip === item} onClick={() => setTip(item)}>{cat(item)}</button>
              <strong>{legend[item] ? `${Math.round(values[item] / Math.max(total, 1) * 100)}%` : "—"}</strong>
            </label>
          ))}
        </div>
      </div>
      {tip && (
        <div className="ledger-tooltip" role="status">
          <span>{cat(tip)}</span>
          <strong>{money(values[tip])}</strong>
          <small>{t(`${periodLabel} 기준 · 지난 기간 대비 `, `${periodLabel} · vs previous `)}<b className={values[tip] > last[tip] ? "is-up" : "is-down"}>{values[tip] > last[tip] ? "+" : "−"}{money(Math.abs(values[tip] - last[tip]))}</b></small>
        </div>
      )}
      <table className="ledger-table ledger-compare">
        <thead><tr><th>{t("항목", "Category")}</th><th>{t("이번", "Now")}</th><th>{t("지난", "Before")}</th><th>{t("비교", "Compare")}</th></tr></thead>
        <tbody>
          {CATEGORIES.map((item) => (
            <tr key={item}>
              <td>{cat(item)}</td>
              <td>{money(values[item])}</td>
              <td>{money(last[item])}</td>
              <td>
                <div className="ledger-progress" role="progressbar" aria-label={t(`${cat(item)} 이번 기간`, `${cat(item)} this period`)} aria-valuenow={Math.round(values[item] / peak * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${values[item] / peak * 100}%` }} />
                </div>
                <div className="ledger-progress ledger-progress-secondary" role="progressbar" aria-label={t(`${cat(item)} 지난 기간`, `${cat(item)} previous period`)} aria-valuenow={Math.round(last[item] / peak * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${last[item] / peak * 100}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function ExportView({ onNotice }: { onNotice: Notify }) {
  const { t } = useLedgerText();
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-22");
  const [format, setFormat] = useState("CSV");
  const [include, setInclude] = useState({ memo: true, category: true, account: false });
  const [privacy, setPrivacy] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);
  // The PDF option fails on purpose so the error state can be seen with the palette.
  function run() {
    setFailed(false);
    setProgress(0);
    let step = 0;
    timer.current = window.setInterval(() => {
      step += 25;
      if (step < 100) { setProgress(step); return; }
      if (timer.current) window.clearInterval(timer.current);
      setProgress(null);
      if (format === "PDF") { setFailed(true); onNotice(t("PDF 내보내기에 실패했어요. 다시 시도해 주세요.", "PDF export failed. Please try again."), "danger"); }
      else onNotice(t(`${format} 파일을 만들었어요.`, `${format} file is ready.`));
    }, 220);
  }
  const busy = progress !== null;
  const nothing = !include.memo && !include.category && !include.account;
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">TAKE IT OUT</span>
          <h2>{t("내보내기", "Export")}</h2>
        </div>
        <Download size={18} />
      </div>
      <div className="ledger-tools">
        <label className="ledger-mini">{t("시작", "From")}<input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="ledger-mini">{t("끝", "To")}<input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></label>
      </div>
      <fieldset className="ledger-radios" disabled={busy}>
        <legend>{t("파일 형식", "Format")}</legend>
        {["CSV", "Excel", "PDF"].map((item) => (
          <label key={item}><input type="radio" name="format" checked={format === item} onChange={() => { setFormat(item); setFailed(false); }} />{item}</label>
        ))}
      </fieldset>
      <fieldset className="ledger-checks" disabled={busy}>
        <legend>{t("포함할 항목", "Include")}</legend>
        <label><input type="checkbox" checked={include.memo} onChange={() => setInclude((value) => ({ ...value, memo: !value.memo }))} />{t("메모", "Memo")}</label>
        <label><input type="checkbox" checked={include.category} onChange={() => setInclude((value) => ({ ...value, category: !value.category }))} />{t("카테고리", "Category")}</label>
        <label><input type="checkbox" checked={include.account} disabled={privacy} onChange={() => setInclude((value) => ({ ...value, account: !value.account }))} />{t("계좌 정보", "Account details")}</label>
      </fieldset>
      <label className="ledger-inline ledger-switch-row">
        {t("개인정보 제외", "Exclude personal info")}
        <Switch checked={privacy} onChange={(value) => { setPrivacy(value); if (value) setInclude((items) => ({ ...items, account: false })); }} label={t("개인정보 제외", "Exclude personal info")} />
      </label>
      {busy && <div className="ledger-progress ledger-progress-lg" role="progressbar" aria-label={t("내보내는 중", "Exporting")} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>}
      {failed && <p className="ledger-notification ledger-danger" role="alert">{t("PDF를 만들지 못했어요. CSV나 Excel로 내보내 보세요.", "Couldn't create the PDF. Try CSV or Excel instead.")}</p>}
      {nothing && <p className="ledger-form-error" role="alert">{t("포함할 항목을 하나 이상 골라 주세요.", "Pick at least one field to include.")}</p>}
      <div className="ledger-dialog-actions">
        <button className="ledger-btn ledger-neutral" type="button" disabled title={t("곧 제공돼요", "Coming soon")}>{t("예약 보내기", "Schedule")}</button>
        <button className="ledger-btn ledger-primary" type="button" disabled={busy || nothing} onClick={run}>{busy ? t("내보내는 중", "Exporting") : failed ? t("다시 시도", "Try again") : t("지금 내보내기", "Export now")}</button>
      </div>
    </section>
  );
}

export function MoreSheet({ onPick, onClose }: { onPick: (view: "alerts" | "accounts" | "export") => void; onClose: () => void }) {
  const { t } = useLedgerText();
  return (
    <LedgerSheet title={t("더보기", "More")} onClose={onClose}>
      <div className="ledger-more-list">
        <button type="button" onClick={() => onPick("alerts")}><Bell size={16} />{t("알림 · 자동화", "Alerts & automation")}</button>
        <button type="button" onClick={() => onPick("accounts")}><CreditCard size={16} />{t("계좌 · 카드", "Accounts & cards")}</button>
        <button type="button" onClick={() => onPick("export")}><Download size={16} />{t("내보내기", "Export")}</button>
      </div>
    </LedgerSheet>
  );
}
