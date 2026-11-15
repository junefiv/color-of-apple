"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Bell, Check, ChevronRight, Coffee, CreditCard, Download, Ellipsis, Home, LayoutGrid, PieChart, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, Target, TrainFront, Utensils, Wallet, X } from "lucide-react";
import { IntroPhone, IntroViewport } from "./kinds/shared";
import { AccountsView, AlertsView, AnalysisView, CATEGORIES, ExportView, MoreSheet, SetupView, SHARES, TidyView, useLedgerText, type Category, type Entry, type NoticeTone } from "./budget-views";
import "./budget-preview.css";

type View = "overview" | "tidy" | "setup" | "alerts" | "accounts" | "analysis" | "export";
type Panel = "add" | "budget" | "notifications" | Entry | null;
const INITIAL: Entry[] = [
  { id: 1, name: "브루잉 커피", nameEn: "Brew coffee", amount: 5800, category: "식비", date: "9월 22일", memo: "오후의 작은 여유", memoEn: "A small afternoon break" },
  { id: 2, name: "동네 식료품점", nameEn: "Corner grocer", amount: 42600, category: "생활", date: "9월 22일", memo: "이번 주 장보기", memoEn: "This week's groceries" },
  { id: 3, name: "가을 운동화", nameEn: "Autumn sneakers", amount: 128000, category: "쇼핑", date: "9월 21일", memo: "오래 걷기 좋은 신발", memoEn: "Good for long walks" },
  { id: 4, name: "마을 식당", nameEn: "Village diner", amount: 32000, category: "식비", date: "9월 21일", memo: "친구와 저녁", memoEn: "Dinner with a friend" },
  { id: 5, name: "교통카드 충전", nameEn: "Transit card top-up", amount: 50000, category: "교통", date: "9월 20일", memo: "대중교통", memoEn: "Public transport" },
  { id: 6, name: "이번 달 월세", nameEn: "Monthly rent", amount: 700000, category: "생활", date: "9월 19일", memo: "보금자리", memoEn: "Home sweet home" },
  { id: 7, name: "주말 식사", nameEn: "Weekend meal", amount: 222000, category: "식비", date: "9월 18일", memo: "가족 모임", memoEn: "Family get-together" },
  { id: 8, name: "생활 소품", nameEn: "Home goods", amount: 66400, category: "쇼핑", date: "9월 17일", memo: "방에 필요한 것들", memoEn: "Things for my room" },
];
const ICONS = { 식비: Utensils, 쇼핑: ShoppingBag, 교통: TrainFront, 생활: Home };
const GOAL = 1000000;
const INCOME = 3200000;
const NAV: { id: View; ko: string; en: string; app?: [string, string]; icon: typeof LayoutGrid }[] = [
  { id: "overview", ko: "한눈에", en: "Overview", app: ["한눈에", "Home"], icon: LayoutGrid },
  { id: "tidy", ko: "거래 정리", en: "Transactions", app: ["거래", "Activity"], icon: Wallet },
  { id: "setup", ko: "예산 설정", en: "Budget", app: ["예산", "Budget"], icon: Target },
  { id: "alerts", ko: "알림 · 자동화", en: "Alerts", icon: Bell },
  { id: "accounts", ko: "계좌 · 카드", en: "Accounts", icon: CreditCard },
  { id: "analysis", ko: "지출 분석", en: "Analysis", app: ["분석", "Insights"], icon: PieChart },
  { id: "export", ko: "내보내기", en: "Export", icon: Download },
];
const COPY: Record<View, [string, string, string, string]> = {
  overview: ["작은 기록, 더 나은 내일", "지금의 소비를 살피고, 다음을 가볍게 준비해요.", "Small records, a better tomorrow", "See where your money goes and prepare for what comes next."],
  tidy: ["필요한 기록만 골라 정리해요", "검색·선택·일괄 작업으로 거래를 다듬어요.", "Keep only the records you need", "Search, select, and organize transactions in bulk."],
  setup: ["예산의 기준을 정해요", "금액, 배분 방식, 카테고리 한도를 한곳에서 맞춰요.", "Set your budget rules", "Manage totals, allocation, and category limits in one place."],
  alerts: ["놓치지 않을 소비 신호", "채널, 주기, 임계값으로 알림을 세밀하게 켜요.", "Never miss a spending signal", "Fine-tune alerts by channel, schedule, and threshold."],
  accounts: ["연결된 돈의 경로", "기본 계좌, 잔액 표시, 연결 상태를 관리해요.", "Your connected money routes", "Manage primary accounts, balances, and connection status."],
  analysis: ["어디에 얼마나 썼을까요", "기간과 차트 종류를 바꿔 가며 조합을 봐요.", "Where did your money go?", "Change the period and chart to explore your spending mix."],
  export: ["기록을 밖으로 옮겨요", "형식과 포함 항목을 고른 뒤 파일을 만들어요.", "Take your records with you", "Choose a format and the fields to include."],
};

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

function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const { t } = useLedgerText();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  useEffect(() => { closeRef.current = close; }, [close]);
  useEffect(() => {
    const root = ref.current!;
    (root.querySelector<HTMLElement>("input") ?? root.querySelector<HTMLElement>("button"))?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const items = Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, [tabindex="0"]'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    root.addEventListener("keydown", key);
    return () => { root.removeEventListener("keydown", key); };
  }, []);
  return <div className="ledger-scrim" onClick={close}>
    <div className="ledger-dialog" role="dialog" aria-modal="true" aria-label={title} ref={ref} onClick={e => e.stopPropagation()}>
      <header>
        <div>
          <span className="ledger-eyebrow">POCKET</span>
          <h2>{title}</h2>
        </div>
        <button className="ledger-icon-btn" onClick={close} aria-label={t("닫기", "Close")}>
          <X size={18} />
        </button>
      </header>{children}
    </div>
  </div>;
}

function BudgetPreview({ mobile = false }: { mobile?: boolean }) {
  const { isKo, t, money, compact, cat, day, name, memo } = useLedgerText();
  const [view, setView] = useState<View>("overview");
  const [entries, setEntries] = useState(INITIAL);
  const [budget, setBudget] = useState(1800000);
  const [saved, setSaved] = useState(650000);
  const [filter, setFilter] = useState<Category | "전체">("전체");
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const opener = useRef<HTMLElement | null>(null);
  function showPanel(next: Panel) { opener.current = document.activeElement as HTMLElement | null; setPanel(next); }
  const [amount, setAmount] = useState("");
  const [shop, setShop] = useState("");
  const [category, setCategory] = useState<Category>("식비");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState<{ text: string; tone: NoticeTone } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const notify = (text: string, tone: NoticeTone = "success") => setNotice({ text, tone });
  const navItems = NAV.filter((item) => !mobile || item.app).map((item) => ({ ...item, title: mobile && item.app ? t(item.app[0], item.app[1]) : t(item.ko, item.en) }));
  const viewTitle = (id: View) => { const item = NAV.find((nav) => nav.id === id)!; return t(item.ko, item.en); };
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const remaining = budget - total;
  const used = Math.round(total / budget * 100);
  const needle = query.trim().toLowerCase();
  const visible = entries.filter(entry => (filter === "전체" || entry.category === filter) && `${entry.name} ${entry.memo} ${entry.nameEn} ${entry.memoEn}`.toLowerCase().includes(needle));
  const categoryTotal = (item: Category) => entries.filter(entry => entry.category === item).reduce((sum, entry) => sum + entry.amount, 0);
  const minimumAmount = panel === "budget" ? 10000 : 1;
  const validAmount = Number(amount) >= minimumAmount && Number(amount) <= 100000000 && Number.isInteger(Number(amount));
  const watch = CATEGORIES.filter(item => categoryTotal(item) / (budget * SHARES[item]) >= 0.8);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 3500); return () => clearTimeout(timer); }, [notice]);
  function openAdd() { setAmount(""); setShop(""); setNote(""); setCategory("식비"); showPanel("add"); }
  function openBudget() { setAmount(String(budget)); showPanel("budget"); }
  function close() { setPanel(null); setConfirmDelete(false); requestAnimationFrame(() => opener.current?.focus()); }
  const [copyTitle, copyBody, copyTitleEn, copyBodyEn] = COPY[view];
  const navigation = <nav className="ledger-nav" aria-label={t("가계부 메뉴", "Budget menu")}>{navItems.map(({ id, title, icon: Icon }) => <button key={id} aria-current={view === id ? "page" : undefined} onClick={() => setView(id)}>
    <Icon size={19} />
    <span>{title}</span>{!mobile && view === id && <span className="ledger-nav-dot" />}</button>)}{mobile && <button aria-current={view === "alerts" || view === "accounts" || view === "export" ? "page" : undefined} onClick={() => setMoreOpen(true)}>
    <Ellipsis size={19} />
    <span>{t("더보기", "More")}</span>
  </button>}</nav>;
  const categoryCards = <div className="ledger-budgets">{CATEGORIES.map((item) => {
    const spent = categoryTotal(item);
    const limit = Math.round(budget * SHARES[item]);
    const ratio = spent / limit;
    const tone = ratio > 1 ? "danger" : ratio >= 0.8 ? "warning" : "success";
    const Icon = ICONS[item];
    return <div className="ledger-budget-item" key={item}>
      <div className="ledger-between">
        <span className="ledger-inline">
          <Icon size={16} />{cat(item)}</span>
        <span className={`ledger-status ledger-${tone}`}>{ratio > 1 ? t("예산 초과", "Over budget") : ratio >= 0.8 ? t("한도 임박", "Near limit") : t("여유 있어요", "On track")}</span>
      </div>
      <div className="ledger-budget-values">
        <strong>{money(spent)}</strong>
        <small>/ {money(limit)}</small>
      </div>
      <div className="ledger-progress" role="progressbar" aria-label={t(`${cat(item)} 예산 사용률`, `${cat(item)} budget used`)} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={Math.max(100, Math.round(ratio * 100))}>
        <span style={{ width: `${Math.min(100, ratio * 100)}%`, background: `var(--color-${tone})` }} />
      </div>
    </div>;
  })}</div>;
  const transactions = <section className="ledger-card ledger-transactions">
    <div className="ledger-section-head">
      <div>
        <span className="ledger-eyebrow">YOUR ACTIVITY</span>
        <h2>{t("최근 거래", "Recent transactions")}</h2>
      </div><button className="ledger-link" onClick={() => setView("tidy")}>{t("전체 보기", "View all")} <ChevronRight size={14} />
      </button></div>
    <label className="ledger-search">
      <Search size={16} />
      <input aria-label={t("거래 검색", "Search transactions")} placeholder={t("거래 이름이나 메모 검색", "Search by name or memo")} value={query} onChange={e => setQuery(e.target.value)} />
    </label>
    <div className="ledger-filters" role="group" aria-label={t("거래 카테고리", "Transaction category")}>{(["전체", ...CATEGORIES] as const).map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{cat(item)}</button>)}</div>
    <div className="ledger-entry-list">{visible.slice(0, 4).map(entry => {
      const Icon = entry.id === 1 ? Coffee : ICONS[entry.category];
      return <button className="ledger-entry" key={entry.id} onClick={() => { setConfirmDelete(false); showPanel(entry); }}>
        <span className={`ledger-entry-icon ledger-category-${CATEGORIES.indexOf(entry.category)}`}>
          <Icon size={19} />
        </span>
        <span className="ledger-entry-copy">
          <strong>{name(entry)}</strong>
          <small>{cat(entry.category)} · {day(entry.date)}</small>
        </span>
        <strong className="ledger-amount">−{money(entry.amount)}</strong>
        <ChevronRight size={14} className="ledger-entry-arrow" />
      </button>;
    })}{visible.length === 0 && <div className="ledger-empty">
      <Search size={24} />
      <p>{t("일치하는 거래가 없어요.", "No matching transactions.")}</p>
      <button className="ledger-link" onClick={() => { setQuery(""); setFilter("전체"); }}>{t("필터 초기화", "Reset filters")}</button>
    </div>}</div>
  </section>;
  const content = <div className="ledger-content" inert={panel !== null}>
    <header className="ledger-topbar">
      <div>{mobile ? <span className="ledger-brand">
        <span>
          <Wallet size={17} />
        </span>pocket<span className="ledger-brand-dot">.</span>
      </span> : <span className="ledger-breadcrumb">{t("내 가계부", "My budget")} <ChevronRight size={13} /> <b>{viewTitle(view)}</b></span>}</div>
      <div className="ledger-inline">
        <span className="ledger-month">{t("2026년 9월", "September 2026")}</span>
        <button className="ledger-icon-btn ledger-bell" aria-label={t(`알림 보기 · 새 알림 ${watch.length + 1}개`, `View alerts · ${watch.length + 1} new`)} onClick={() => showPanel("notifications")}>
          <Bell size={19} />
          <i />
        </button>
        <span className="ledger-avatar" aria-hidden>J</span>
      </div>
    </header>
    <main className="ledger-main">
      <div className="ledger-heading">
        <div>
          <span className="ledger-eyebrow">MY MONEY, MY PACE</span>
          <h1>{isKo ? copyTitle : copyTitleEn}</h1>
          <p>{isKo ? copyBody : copyBodyEn}</p>
        </div>{!mobile && <button className="ledger-btn ledger-primary" onClick={openAdd}>
          <Plus size={17} />{t("지출 기록", "Add expense")}</button>}</div>
      {view === "overview" && <>
        <div className="ledger-summary-grid">
          <section className={`ledger-balance${remaining < 0 ? " is-over" : ""}`}>
            <div className="ledger-between">
              <span>{remaining < 0 ? t("이번 달 예산 초과", "Over budget this month") : t("이번 달 남은 예산", "Remaining this month")}</span>
              <Wallet size={20} />
            </div>
            <strong>{remaining < 0 ? "−" : ""}{money(Math.abs(remaining))}</strong>
            <div className="ledger-balance-bottom">
              <span>
                <span className="ledger-balance-dot" />{t(`예산의 ${used}% 사용`, `${used}% of budget used`)} · {t("8일 남음", "8 days left")}</span>
              <button onClick={openBudget} aria-label={t("전체 예산 수정", "Edit total budget")}>
                <SlidersHorizontal size={16} />
              </button>
            </div>
            <div className="ledger-balance-track">
              <i style={{ width: `${Math.min(100, used)}%` }} />
            </div>
          </section>
          <section className="ledger-card ledger-stat">
            <span className="ledger-stat-icon">
              <ArrowUpRight size={20} />
            </span>
            <span className="ledger-muted">{t("이번 달 지출", "Spent this month")}</span>
            <strong>{money(total)}</strong>
            <small>{t(`총 ${entries.length}건의 기록`, `${entries.length} recorded transactions`)}</small>
          </section>
          <section className="ledger-card ledger-stat">
            <span className="ledger-stat-icon secondary">
              <ArrowDownLeft size={20} />
            </span>
            <span className="ledger-muted">{t("이번 달 수입", "Income this month")}</span>
            <strong>{money(INCOME)}</strong>
            <small>{t("9월 급여 · 입금 완료", "September salary · Deposited")}</small>
          </section>
        </div>
        <div className="ledger-middle-grid">
          <section className="ledger-card ledger-chart-card">
            <div className="ledger-section-head">
              <div>
                <span className="ledger-eyebrow">SPENDING MIX</span>
                <h2>{t("어디에 썼을까요?", "Where did it go?")}</h2>
              </div>
              <button className="ledger-chip ledger-chip-secondary" onClick={() => setView("analysis")}>{t("자세히", "Details")} <ChevronRight size={12} /></button>
            </div>
            <div className="ledger-chart-content">
              <div className="ledger-donut" role="img" aria-label={CATEGORIES.map(item => `${cat(item)} ${money(categoryTotal(item))}`).join(", ")} style={{ background: `conic-gradient(${categoryDonutGradient(CATEGORIES.map(item => categoryTotal(item) / Math.max(total, 1) * 100))})` }}>
                <div>
                  <small>{t("총 지출", "Total spent")}</small>
                  <strong>{isKo ? <>{Math.round(total / 10000)}<small>만원</small></> : compact(total)}</strong>
                </div>
              </div>
              <div className="ledger-legend">{CATEGORIES.map((item, index) => <div key={item}>
                <i className={`ledger-category-${index}`} />
                <span>{cat(item)}</span>
                <strong>{Math.round(categoryTotal(item) / Math.max(total, 1) * 100)}%</strong>
              </div>)}</div>
            </div>
          </section>
          <section className="ledger-goal">
            <div className="ledger-between">
              <span className="ledger-goal-icon">
                <Sparkles size={20} />
              </span>
              <span className="ledger-accent-tag">{t(`${Math.round(saved / GOAL * 100)}% 모았어요`, `${Math.round(saved / GOAL * 100)}% saved`)}</span>
            </div>
            <h2>{t("다음 여행을 위한 작은 준비", "A little fund for your next trip")}</h2>
            <p>{t("나를 위한 여행 적금", "My travel savings")}</p>
            <div className="ledger-goal-total">
              <strong>{money(saved)}</strong>
              <small>/ {money(GOAL)}</small>
            </div>
            <div className="ledger-progress" role="progressbar" aria-label={t("여행 적금 진행률", "Travel savings progress")} aria-valuenow={Math.round(saved / GOAL * 100)} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${Math.min(saved / GOAL * 100, 100)}%` }} />
            </div>
            <button className="ledger-btn ledger-secondary" disabled={saved >= GOAL} onClick={() => { const next = Math.min(GOAL, saved + 50000); setSaved(next); notify(next >= GOAL ? t("여행 목표를 달성했어요!", "You reached your travel goal!") : t(`여행 목표에 ${money(50000)}을 더했어요.`, `Added ${money(50000)} to your travel goal.`)); }}>
              {saved >= GOAL ? <Check size={15} /> : <Plus size={15} />}{saved >= GOAL ? t("목표를 달성했어요", "Goal reached") : t(`${money(50000)} 저축하기`, `Save ${money(50000)}`)}</button>
          </section>
        </div>
      </>}
      {view === "overview" && <div className="ledger-bottom-grid">{transactions}<section className="ledger-card">
        <div className="ledger-section-head">
          <div>
            <span className="ledger-eyebrow">STAY ON TRACK</span>
            <h2>{t("카테고리 예산", "Category budgets")}</h2>
          </div>
          <button className="ledger-icon-btn" onClick={() => setView("setup")} aria-label={t("카테고리 예산 설정", "Category budget settings")}>
            <SlidersHorizontal size={17} />
          </button>
        </div>{categoryCards}<div className="ledger-info-note">
          <Bell size={15} />
          <span>{t(`정기 구독 ${money(14900)} 결제가 3일 남았어요.`, `A ${money(14900)} subscription is due in 3 days.`)}</span>
        </div>
      </section></div>}
      {view === "tidy" && <TidyView mobile={mobile} entries={entries} onOpen={(entry) => { setConfirmDelete(false); showPanel(entry); }} onNotice={notify}
        onRecategorize={(ids, next) => setEntries(items => items.map(item => ids.includes(item.id) ? { ...item, category: next } : item))}
        onDelete={(ids) => setEntries(items => items.filter(item => !ids.includes(item.id)))} />}
      {view === "setup" && <SetupView budget={budget} onSave={(value, message) => { setBudget(value); notify(message); }} />}
      {view === "alerts" && <AlertsView />}
      {view === "accounts" && <AccountsView onNotice={notify} />}
      {view === "analysis" && <AnalysisView />}
      {view === "export" && <ExportView onNotice={notify} />}
      <footer className="ledger-footer">
        <span>
          <Check size={13} />{t("기록은 이 프리뷰 안에서만 저장돼요", "Records stay inside this preview")}</span>
        <span>{t("작은 습관이 만드는 변화", "Small habits make a difference")}</span>
      </footer>
    </main>
  </div>;
  const panelTitle = panel === "add" ? t("지출 기록하기", "Add an expense") : panel === "budget" ? t("이번 달 예산", "This month's budget") : panel === "notifications" ? t("내 소비 알림", "Spending alerts") : t("거래 상세", "Transaction details");
  const overlay = <>{notice && <div className={`ledger-toast ledger-toast-${notice.tone}`} role={notice.tone === "danger" ? "alert" : "status"}>
    {notice.tone === "danger" ? <AlertCircle size={17} /> : <Check size={17} />}{notice.text}</div>}{panel !== null && <Modal title={panelTitle} close={close}>
      {(panel === "add" || panel === "budget") ? <form onSubmit={e => { e.preventDefault(); if (!validAmount || (panel === "add" && !shop.trim())) return; if (panel === "budget") { setBudget(Number(amount)); notify(t("이번 달 예산을 변경했어요.", "Budget updated for this month.")); } else { setEntries(items => [{ id: Math.max(0, ...items.map(item => item.id)) + 1, name: shop.trim(), nameEn: shop.trim(), amount: Number(amount), category, date: "9월 22일", memo: note.trim(), memoEn: note.trim() }, ...items]); notify(t("지출을 기록했어요.", "Expense added.")); } close(); }}>
        <p className="ledger-form-hint">{panel === "add" ? t("오늘의 작은 소비를 남겨보세요.", "Log today's spending.") : t("설정한 예산은 식비 18%, 쇼핑 10%, 교통 8%, 생활 64%로 나눠요.", "Your budget splits into Food 18%, Shopping 10%, Transit 8%, Living 64%.")}</p>
        <label className="ledger-field">{panel === "budget" ? t("한 달 예산", "Monthly budget") : t("금액", "Amount")}<span className="ledger-input-wrap">
          <input aria-label={t("금액", "Amount")} type="number" min={minimumAmount} max="100000000" step="1" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} aria-invalid={!!amount && !validAmount} required />
          <span>{t("원", "KRW")}</span>
        </span>
        </label>
        {amount && !validAmount && <p className="ledger-form-error" role="alert">{t(`${money(minimumAmount)}부터 1억원까지 정수로 입력해 주세요.`, `Enter a whole number from ${money(minimumAmount)} to ${money(100000000)}.`)}</p>}
        {panel === "add" && <>
          <label className="ledger-field">{t("사용처", "Merchant")}<input placeholder={t("어디에서 사용했나요?", "Where did you spend it?")} maxLength={40} value={shop} onChange={e => setShop(e.target.value)} required />
          </label>
          <div className="ledger-field" role="radiogroup" aria-label={t("카테고리", "Category")}>{t("카테고리", "Category")}
            <div className="ledger-filters ledger-category-pick">{CATEGORIES.map((item, index) => { const Icon = ICONS[item]; return <button type="button" key={item} role="radio" aria-checked={category === item} onClick={() => setCategory(item)}><span className={`ledger-category-${index}`}><Icon size={13} /></span>{cat(item)}</button>; })}</div>
          </div>
          <label className="ledger-field">{t("메모", "Memo")} <span className="ledger-muted">{t("선택", "Optional")}</span>
            <textarea placeholder={t("기억하고 싶은 내용을 남겨요", "Anything to remember")} value={note} onChange={e => setNote(e.target.value)} maxLength={160} rows={2} />
          </label>
        </>}
        <div className="ledger-dialog-actions">
          <button type="button" className="ledger-btn ledger-neutral" onClick={close}>{t("취소", "Cancel")}</button>
          <button className="ledger-btn ledger-primary" type="submit" disabled={!validAmount || (panel === "add" && !shop.trim())}>{t("저장하기", "Save")}</button>
        </div>
      </form> : panel === "notifications" ? <div className="ledger-notifications">
        <div className="ledger-notification ledger-success">
          <Check size={18} />
          <div>
            <strong>{t("이번 달 기록이 잘 쌓이고 있어요", "Your records are building up nicely")}</strong>
            <p>{t(`총 ${entries.length}건의 지출을 기록했어요.`, `${entries.length} expenses recorded this month.`)}</p>
          </div>
        </div>
        <div className="ledger-notification ledger-info">
          <Bell size={18} />
          <div>
            <strong>{t("정기 결제 예정", "Upcoming payment")}</strong>
            <p>{t(`9월 25일 · 정기 구독 ${money(14900)}`, `Sep 25 · Subscription ${money(14900)}`)}</p>
          </div>
        </div>{watch.map(item => <div key={item} className={`ledger-notification ledger-${categoryTotal(item) > budget * SHARES[item] ? "danger" : "warning"}`}>
          <Target size={18} />
          <div>
            <strong>{t(`${cat(item)} 예산을 확인해 보세요`, `Check your ${cat(item)} budget`)}</strong>
            <p>{t(`현재 ${money(categoryTotal(item))} 사용했어요.`, `${money(categoryTotal(item))} spent so far.`)}</p>
          </div>
        </div>)}</div> : <div className="ledger-detail">
        <span className="ledger-chip">{cat(panel.category)}</span>
        <h3>{name(panel)}</h3>
        <strong className="ledger-detail-amount">−{money(panel.amount)}</strong>
        <dl>
          <div>
            <dt>{t("날짜", "Date")}</dt>
            <dd>{isKo ? `2026년 ${panel.date}` : `${day(panel.date)}, 2026`}</dd>
          </div>
          <div>
            <dt>{t("결제 수단", "Paid with")}</dt>
            <dd>
              <CreditCard size={15} />{t("생활비 카드", "Living card")}</dd>
          </div>
          <div>
            <dt>{t("메모", "Memo")}</dt>
            <dd>{memo(panel) || t("메모가 없어요", "No memo")}</dd>
          </div>
        </dl>{confirmDelete && <p className="ledger-notification ledger-danger" role="alert">{t("이 기록을 삭제할까요? 지출 합계에도 반영됩니다.", "Delete this record? It will also leave your totals.")}</p>}<div className="ledger-dialog-actions">
          <button className="ledger-btn ledger-danger-button" onClick={() => { if (!confirmDelete) { setConfirmDelete(true); return; } setEntries(items => items.filter(item => item.id !== panel.id)); close(); notify(t("거래 기록을 삭제했어요.", "Transaction deleted.")); }}>{confirmDelete ? t("삭제 확인", "Confirm delete") : t("기록 삭제", "Delete")}</button>
          <button className="ledger-btn ledger-neutral" onClick={close}>{t("닫기", "Close")}</button>
        </div>
      </div>}
    </Modal>}{mobile && moreOpen && <MoreSheet onClose={() => setMoreOpen(false)} onPick={(next) => { setView(next); setMoreOpen(false); }} />}</>;
  if (mobile) return <div className="ledger ledger-app">
    <IntroPhone nav={<div className="ledger-mobile-nav is-dense" inert={panel !== null}>{navigation}<button className="ledger-mobile-add" aria-label={t("지출 기록", "Add expense")} onClick={openAdd}>
      <Plus size={21} />
    </button>
    </div>} overlay={overlay}>{content}</IntroPhone>
  </div>;
  return <div className="ledger ledger-web">
    <IntroViewport>
      <div className="ledger-shell">
        <aside className="ledger-sidebar" inert={panel !== null}>
          <div className="ledger-brand">
            <span>
              <Wallet size={21} />
            </span>pocket<span className="ledger-brand-dot">.</span>
          </div>
          <p className="ledger-sidebar-label">MENU</p>{navigation}<div className="ledger-sidebar-bottom">
            <div className="ledger-sidebar-tip">
              <Sparkles size={16} />
              <p>{t(`이번 달은 지난달보다 식비가 ${money(49800)} 늘었어요.`, `Food spending is up ${money(49800)} from last month.`)}</p>
            </div>
            <div className="ledger-profile">
              <span className="ledger-avatar" aria-hidden>J</span>
              <div>
                <strong>{t("지우의 가계부", "Jiwoo's budget")}</strong>
                <small>{t("2026년 9월 기록 중", "Tracking Sep 2026")}</small>
              </div>
            </div>
          </div>
        </aside>{content}{overlay}</div>
    </IntroViewport>
  </div>;
}
export function BudgetWeb() { return <BudgetPreview />; }
export function BudgetApp() { return <BudgetPreview mobile />; }
