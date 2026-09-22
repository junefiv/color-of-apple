"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Bell, Check, ChevronRight, Coffee, CreditCard, Download, Ellipsis, Home, LayoutGrid, PieChart, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, Target, TrainFront, Utensils, Wallet, X } from "lucide-react";
import { IntroPhone, IntroViewport } from "./kinds/shared";
import { AccountsView, AlertsView, AnalysisView, ExportView, MoreSheet, SetupView, TidyView } from "./budget-views";
import "./budget-preview.css";

type Category = "식비" | "쇼핑" | "교통" | "생활";
type Entry = { id: number; name: string; amount: number; category: Category; date: string; memo: string };
type View = "overview" | "tidy" | "setup" | "alerts" | "accounts" | "analysis" | "export";
type Panel = "add" | "budget" | "notifications" | Entry | null;
const INITIAL: Entry[] = [
  { id: 1, name: "브루잉 커피", amount: 5800, category: "식비", date: "9월 22일", memo: "오후의 작은 여유" },
  { id: 2, name: "동네 식료품점", amount: 42600, category: "생활", date: "9월 22일", memo: "이번 주 장보기" },
  { id: 3, name: "가을 운동화", amount: 128000, category: "쇼핑", date: "9월 21일", memo: "오래 걷기 좋은 신발" },
  { id: 4, name: "마을 식당", amount: 32000, category: "식비", date: "9월 21일", memo: "친구와 저녁" },
  { id: 5, name: "교통카드 충전", amount: 50000, category: "교통", date: "9월 20일", memo: "대중교통" },
  { id: 6, name: "이번 달 월세", amount: 700000, category: "생활", date: "9월 19일", memo: "보금자리" },
  { id: 7, name: "주말 식사", amount: 222000, category: "식비", date: "9월 18일", memo: "가족 모임" },
  { id: 8, name: "생활 소품", amount: 66400, category: "쇼핑", date: "9월 17일", memo: "방에 필요한 것들" },
];
const CATEGORIES: Category[] = ["식비", "쇼핑", "교통", "생활"];
const SHARES: Record<Category, number> = { 식비: 0.18, 쇼핑: 0.1, 교통: 0.08, 생활: 0.64 };
const ICONS = { 식비: Utensils, 쇼핑: ShoppingBag, 교통: TrainFront, 생활: Home };
const WEB_NAV = [
  { id: "overview", title: "한눈에", icon: LayoutGrid },
  { id: "tidy", title: "거래 정리", icon: Wallet },
  { id: "setup", title: "예산 설정", icon: Target },
  { id: "alerts", title: "알림 · 자동화", icon: Bell },
  { id: "accounts", title: "계좌 · 카드", icon: CreditCard },
  { id: "analysis", title: "지출 분석", icon: PieChart },
  { id: "export", title: "내보내기", icon: Download },
] as const;
const APP_NAV = [
  { id: "overview", title: "한눈에", icon: LayoutGrid },
  { id: "tidy", title: "거래", icon: Wallet },
  { id: "setup", title: "예산", icon: Target },
  { id: "analysis", title: "분석", icon: PieChart },
] as const;
const COPY: Record<View, { title: string; body: string }> = {
  overview: { title: "작은 기록, 더 나은 내일", body: "지금의 소비를 살피고, 다음을 가볍게 준비해요." },
  tidy: { title: "필요한 기록만 골라 정리해요", body: "검색·선택·일괄 작업으로 거래를 다듬어요." },
  setup: { title: "예산의 기준을 정해요", body: "금액, 배분 방식, 카테고리 한도를 한곳에서 맞춰요." },
  alerts: { title: "놓치지 않을 소비 신호", body: "채널, 주기, 임계값으로 알림을 세밀하게 켜요." },
  accounts: { title: "연결된 돈의 경로", body: "기본 계좌, 잔액 표시, 연결 상태를 관리해요." },
  analysis: { title: "어디에 얼마나 썼을까요", body: "기간과 차트 종류를 바꿔 가며 조합을 봐요." },
  export: { title: "기록을 밖으로 옮겨요", body: "형식과 포함 항목을 고른 뒤 파일을 만들어요." },
};
const money = (amount: number) => `${Math.round(amount).toLocaleString("ko-KR")}원`;

function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
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
        <button className="ledger-icon-btn" onClick={close} aria-label="닫기">
          <X size={18} />
        </button>
      </header>{children}
    </div>
  </div>;
}

function BudgetPreview({ mobile = false }: { mobile?: boolean }) {
  const [view, setView] = useState<View>("overview");
  const [entries, setEntries] = useState(INITIAL);
  const [budget, setBudget] = useState(1800000);
  const [saved, setSaved] = useState(650000);
  const [filter, setFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const opener = useRef<HTMLElement | null>(null);
  function showPanel(next: Panel) { opener.current = document.activeElement as HTMLElement | null; setPanel(next); }
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("식비");
  const [memo, setMemo] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navItems = mobile ? APP_NAV : WEB_NAV;
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const remaining = budget - total;
  const visible = entries.filter(entry => (filter === "전체" || entry.category === filter) && `${entry.name} ${entry.memo}`.includes(query.trim()));
  const categoryTotal = (item: Category) => entries.filter(entry => entry.category === item).reduce((sum, entry) => sum + entry.amount, 0);
  const minimumAmount = panel === "budget" ? 10000 : 1;
  const validAmount = Number(amount) >= minimumAmount && Number(amount) <= 100000000 && Number.isInteger(Number(amount));
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(timer); }, [notice]);
  function openAdd() { setAmount(""); setName(""); setMemo(""); setCategory("식비"); showPanel("add"); }
  function openBudget() { setAmount(String(budget)); showPanel("budget"); }
  function close() { setPanel(null); setConfirmDelete(false); requestAnimationFrame(() => opener.current?.focus()); }
  const navigation = <nav className="ledger-nav" aria-label="가계부 메뉴">{navItems.map(({ id, title, icon: Icon }) => <button key={id} aria-current={view === id ? "page" : undefined} onClick={() => setView(id)}>
    <Icon size={19} />
    <span>{title}</span>{!mobile && view === id && <span className="ledger-nav-dot" />}</button>)}{mobile && <button aria-current={view === "alerts" || view === "accounts" || view === "export" ? "page" : undefined} onClick={() => setMoreOpen(true)}>
    <Ellipsis size={19} />
    <span>더보기</span>
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
          <Icon size={16} />{item}</span>
        <span className={`ledger-status ledger-${tone}`}>{ratio > 1 ? "예산 초과" : ratio >= 0.8 ? "한도 임박" : "여유 있어요"}</span>
      </div>
      <div className="ledger-budget-values">
        <strong>{money(spent)}</strong>
        <small>/ {money(limit)}</small>
      </div>
      <div className="ledger-progress" role="progressbar" aria-label={`${item} 예산 사용률`} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={Math.max(100, Math.round(ratio * 100))}>
        <span style={{ width: `${Math.min(100, ratio * 100)}%`, background: `var(--color-${tone})` }} />
      </div>
    </div>;
  })}</div>;
  const transactions = <section className="ledger-card ledger-transactions">
    <div className="ledger-section-head">
      <div>
        <span className="ledger-eyebrow">YOUR ACTIVITY</span>
        <h2>최근 거래</h2>
      </div><button className="ledger-link" onClick={() => setView("tidy")}>전체 보기 <ChevronRight size={14} />
      </button></div>
    <label className="ledger-search">
      <Search size={16} />
      <input aria-label="거래 검색" placeholder="거래 이름이나 메모 검색" value={query} onChange={e => setQuery(e.target.value)} />
    </label>
    <div className="ledger-filters" aria-label="거래 카테고리">{["전체", ...CATEGORIES].map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="ledger-entry-list">{visible.slice(0, 4).map(entry => {
      const Icon = entry.name.includes("커피") ? Coffee : ICONS[entry.category];
      return <button className="ledger-entry" key={entry.id} onClick={() => { setConfirmDelete(false); showPanel(entry); }}>
        <span className={`ledger-entry-icon ledger-category-${CATEGORIES.indexOf(entry.category)}`}>
          <Icon size={19} />
        </span>
        <span className="ledger-entry-copy">
          <strong>{entry.name}</strong>
          <small>{entry.category} · {entry.date}</small>
        </span>
        <strong className="ledger-amount">−{money(entry.amount)}</strong>
        <ChevronRight size={14} className="ledger-entry-arrow" />
      </button>;
    })}{visible.length === 0 && <div className="ledger-empty">
      <Search size={24} />
      <p>일치하는 거래가 없어요.</p>
      <button className="ledger-link" onClick={() => { setQuery(""); setFilter("전체"); }}>필터 초기화</button>
    </div>}</div>
  </section>;
  const content = <div className="ledger-content" inert={panel !== null}>
    <header className="ledger-topbar">
      <div>{mobile ? <span className="ledger-brand">
        <span>
          <Wallet size={17} />
        </span>pocket<span className="ledger-brand-dot">.</span>
      </span> : <span className="ledger-breadcrumb">내 가계부 <ChevronRight size={13} /> {WEB_NAV.find(item => item.id === view)?.title}</span>}</div>
      <div className="ledger-inline">
        <span className="ledger-month">2026년 9월</span>
        <button className="ledger-icon-btn ledger-bell" aria-label="알림 보기" onClick={() => showPanel("notifications")}>
          <Bell size={19} />
          <i />
        </button>
        <span className="ledger-avatar">J</span>
      </div>
    </header>
    <main className="ledger-main">
      <div className="ledger-heading">
        <div>
          <span className="ledger-eyebrow">MY MONEY, MY PACE</span>
          <h1>{COPY[view].title}</h1>
          <p>{COPY[view].body}</p>
        </div>{!mobile && <button className="ledger-btn ledger-primary" onClick={openAdd}>
          <Plus size={17} />지출 기록</button>}</div>
      {view === "overview" && <>
        <div className="ledger-summary-grid">
          <section className="ledger-balance">
            <div className="ledger-between">
              <span>이번 달 남은 예산</span>
              <Wallet size={20} />
            </div>
            <strong>{money(remaining)}</strong>
            <div className="ledger-balance-bottom">
              <span>
                <span className="ledger-balance-dot" />{Math.round(total / budget * 100)}% 사용했어요</span>
              <button onClick={openBudget} aria-label="전체 예산 수정">
                <SlidersHorizontal size={16} />
              </button>
            </div>
            <div className="ledger-balance-track">
              <i style={{ width: `${Math.min(100, total / budget * 100)}%` }} />
            </div>
          </section>
          <section className="ledger-card ledger-stat">
            <span className="ledger-stat-icon">
              <ArrowUpRight size={20} />
            </span>
            <span className="ledger-muted">이번 달 지출</span>
            <strong>{money(total)}</strong>
            <small>총 {entries.length}건의 소중한 기록</small>
          </section>
          <section className="ledger-card ledger-stat">
            <span className="ledger-stat-icon secondary">
              <ArrowDownLeft size={20} />
            </span>
            <span className="ledger-muted">이번 달 수입</span>
            <strong>3,200,000원</strong>
            <small>9월 급여 · 입금 완료</small>
          </section>
        </div>
        <div className="ledger-middle-grid">
          <section className="ledger-card ledger-chart-card">
            <div className="ledger-section-head">
              <div>
                <span className="ledger-eyebrow">SPENDING MIX</span>
                <h2>어디에 썼을까요?</h2>
              </div>
              <span className="ledger-chip">이번 달</span>
            </div>
            <div className="ledger-chart-content">
              <div className="ledger-donut" role="img" aria-label={CATEGORIES.map(item => `${item} ${money(categoryTotal(item))}`).join(", ")} style={{ background: `conic-gradient(var(--color-primary-default) 0% ${categoryTotal("식비") / Math.max(total, 1) * 100}%, var(--color-secondary-default) ${categoryTotal("식비") / Math.max(total, 1) * 100}% ${(categoryTotal("식비") + categoryTotal("쇼핑")) / Math.max(total, 1) * 100}%, var(--color-accent-default) ${(categoryTotal("식비") + categoryTotal("쇼핑")) / Math.max(total, 1) * 100}% ${(total - categoryTotal("생활")) / Math.max(total, 1) * 100}%, var(--color-border-default) ${(total - categoryTotal("생활")) / Math.max(total, 1) * 100}% 100%)` }}>
                <div>
                  <small>총 지출</small>
                  <strong>{Math.round(total / 10000)}<small>만원</small>
                  </strong>
                </div>
              </div>
              <div className="ledger-legend">{CATEGORIES.map((item, index) => <div key={item}>
                <i className={`ledger-category-${index}`} />
                <span>{item}</span>
                <strong>{Math.round(categoryTotal(item) / Math.max(total, 1) * 100)}%</strong>
              </div>)}</div>
            </div>
          </section>
          <section className="ledger-goal">
            <div className="ledger-between">
              <span className="ledger-goal-icon">
                <Sparkles size={20} />
              </span>
              <span className="ledger-accent-tag">차곡차곡</span>
            </div>
            <h2>다음 여행을 위한<br /> 작은 준비</h2>
            <p>나를 위한 여행 적금</p>
            <div className="ledger-goal-total">
              <strong>{money(saved)}</strong>
              <small>/ 1,000,000원</small>
            </div>
            <div className="ledger-progress">
              <span style={{ width: `${Math.min(saved / 1000000 * 100, 100)}%` }} />
            </div>
            <button className="ledger-btn ledger-secondary" disabled={saved >= 1000000} onClick={() => { setSaved(value => Math.min(1000000, value + 50000)); setNotice("여행 목표에 50,000원을 더했어요."); }}>
              <Plus size={15} />{saved >= 1000000 ? "목표를 달성했어요" : "5만원 저축하기"}</button>
          </section>
        </div>
      </>}
      {view === "overview" && <div className="ledger-bottom-grid">{transactions}<section className="ledger-card">
        <div className="ledger-section-head">
          <div>
            <span className="ledger-eyebrow">STAY ON TRACK</span>
            <h2>카테고리 예산</h2>
          </div>
          <button className="ledger-icon-btn" onClick={() => setView("setup")} aria-label="카테고리 예산 설정">
            <SlidersHorizontal size={17} />
          </button>
        </div>{categoryCards}<div className="ledger-info-note">
          <Bell size={15} />
          <span>정기 구독 14,900원 결제가 3일 남았어요.</span>
        </div>
      </section></div>}
      {view === "tidy" && <TidyView mobile={mobile} entries={entries} onOpen={(entry) => { setConfirmDelete(false); showPanel(entry); }} onNotice={setNotice} />}
      {view === "setup" && <SetupView budget={budget} onSave={(value, message) => { setBudget(value); setNotice(message); }} />}
      {view === "alerts" && <AlertsView />}
      {view === "accounts" && <AccountsView onNotice={setNotice} />}
      {view === "analysis" && <AnalysisView />}
      {view === "export" && <ExportView onNotice={setNotice} />}
      <footer className="ledger-footer">
        <span>
          <Check size={13} />기록은 이 프리뷰 안에서만 저장돼요</span>
        <span>작은 습관이 만드는 변화</span>
      </footer>
    </main>
  </div>;
  const overlay = <>{notice && <div className="ledger-toast" role="status">
    <Check size={17} />{notice}</div>}{panel !== null && <Modal title={panel === "add" ? "지출 기록하기" : panel === "budget" ? "이번 달 예산" : panel === "notifications" ? "내 소비 알림" : "거래 상세"} close={close}>
      {(panel === "add" || panel === "budget") ? <form onSubmit={e => { e.preventDefault(); if (!validAmount || (panel === "add" && !name.trim())) return; if (panel === "budget") { setBudget(Number(amount)); setNotice("이번 달 예산을 변경했어요."); } else { setEntries(items => [{ id: Math.max(0, ...items.map(item => item.id)) + 1, name: name.trim(), amount: Number(amount), category, date: "9월 22일", memo: memo.trim() }, ...items]); setNotice("지출을 기록했어요."); } close(); }}>
        <p className="ledger-form-hint">{panel === "add" ? "오늘의 작은 소비를 남겨보세요." : "설정한 예산은 식비 18%, 쇼핑 10%, 교통 8%, 생활 64%로 나눠요."}</p>
        <label className="ledger-field">{panel === "budget" ? "한 달 예산" : "금액"}<span className="ledger-input-wrap">
          <input aria-label="금액" type="number" min={minimumAmount} max="100000000" step="1" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} aria-invalid={!!amount && !validAmount} required />
          <span>원</span>
        </span>
        </label>
        {amount && !validAmount && <p className="ledger-form-error" role="alert">{money(minimumAmount)}부터 1억원까지 정수로 입력해 주세요.</p>}
        {panel === "add" && <>
          <label className="ledger-field">사용처<input placeholder="어디에서 사용했나요?" maxLength={40} value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label className="ledger-field">카테고리<select value={category} onChange={e => setCategory(e.target.value as Category)}>{CATEGORIES.map(item => <option key={item}>{item}</option>)}</select>
          </label>
          <label className="ledger-field">메모 <span className="ledger-muted">선택</span>
            <textarea placeholder="기억하고 싶은 내용을 남겨요" value={memo} onChange={e => setMemo(e.target.value)} maxLength={160} rows={2} />
          </label>
        </>}
        <div className="ledger-dialog-actions">
          <button type="button" className="ledger-btn ledger-neutral" onClick={close}>취소</button>
          <button className="ledger-btn ledger-primary" type="submit" disabled={!validAmount || (panel === "add" && !name.trim())}>저장하기</button>
        </div>
      </form> : panel === "notifications" ? <div className="ledger-notifications">
        <div className="ledger-notification ledger-success">
          <Check size={18} />
          <div>
            <strong>이번 달 기록이 잘 쌓이고 있어요</strong>
            <p>총 {entries.length}건의 지출을 기록했어요.</p>
          </div>
        </div>
        <div className="ledger-notification ledger-info">
          <Bell size={18} />
          <div>
            <strong>정기 결제 예정</strong>
            <p>9월 25일 · 정기 구독 14,900원</p>
          </div>
        </div>{CATEGORIES.filter(item => categoryTotal(item) / (budget * SHARES[item]) >= 0.8).map(item => <div key={item} className={`ledger-notification ledger-${categoryTotal(item) > budget * SHARES[item] ? "danger" : "warning"}`}>
          <Target size={18} />
          <div>
            <strong>{item} 예산을 확인해 보세요</strong>
            <p>현재 {money(categoryTotal(item))} 사용했어요.</p>
          </div>
        </div>)}</div> : <div className="ledger-detail">
        <span className="ledger-chip">{panel.category}</span>
        <h3>{panel.name}</h3>
        <strong className="ledger-detail-amount">−{money(panel.amount)}</strong>
        <dl>
          <div>
            <dt>날짜</dt>
            <dd>2026년 {panel.date}</dd>
          </div>
          <div>
            <dt>결제 수단</dt>
            <dd>
              <CreditCard size={15} />생활비 카드</dd>
          </div>
          <div>
            <dt>메모</dt>
            <dd>{panel.memo || "메모가 없어요"}</dd>
          </div>
        </dl>{confirmDelete && <p className="ledger-notification ledger-danger" role="alert">이 기록을 삭제할까요? 지출 합계에도 반영됩니다.</p>}<div className="ledger-dialog-actions">
          <button className="ledger-btn ledger-danger-button" onClick={() => { if (!confirmDelete) { setConfirmDelete(true); return; } setEntries(items => items.filter(item => item.id !== panel.id)); close(); setNotice("거래 기록을 삭제했어요."); }}>{confirmDelete ? "삭제 확인" : "기록 삭제"}</button>
          <button className="ledger-btn ledger-neutral" onClick={close}>닫기</button>
        </div>
      </div>}
    </Modal>}{mobile && moreOpen && <MoreSheet onClose={() => setMoreOpen(false)} onPick={(next) => { setView(next); setMoreOpen(false); }} />}</>;
  if (mobile) return <div className="ledger ledger-app">
    <IntroPhone nav={<div className="ledger-mobile-nav is-dense" inert={panel !== null}>{navigation}<button className="ledger-mobile-add" aria-label="지출 기록" onClick={openAdd}>
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
          <p className="ledger-sidebar-label"></p>{navigation}<div className="ledger-sidebar-bottom">
            
            <div className="ledger-profile">
              <span className="ledger-avatar">J</span>
              <div>
                <strong>지우의 가계부</strong>
          
              </div>
            </div>
          </div>
        </aside>{content}{overlay}</div>
    </IntroViewport>
  </div>;
}
export function BudgetWeb() { return <BudgetPreview />; }
export function BudgetApp() { return <BudgetPreview mobile />; }
