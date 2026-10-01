"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Download,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

export type Category = "식비" | "쇼핑" | "교통" | "생활";
export type Entry = { id: number; name: string; amount: number; category: Category; date: string; memo: string };

const CATEGORIES: Category[] = ["식비", "쇼핑", "교통", "생활"];
const SHARES: Record<Category, number> = { 식비: 0.18, 쇼핑: 0.1, 교통: 0.08, 생활: 0.64 };
const LAST: Record<Category, number> = { 식비: 0.22, 쇼핑: 0.14, 교통: 0.07, 생활: 0.57 };
const money = (amount: number) => `${Math.round(amount).toLocaleString("ko-KR")}원`;

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

function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="ledger-switch"
      onClick={() => onChange(!checked)}
    >
      <i />
    </button>
  );
}

export function TidyView({
  mobile,
  entries,
  onOpen,
  onNotice,
}: {
  mobile: boolean;
  entries: Entry[];
  onOpen: (entry: Entry) => void;
  onNotice: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-22");
  const [filter, setFilter] = useState("전체");
  const [sort, setSort] = useState("최신순");
  const [picked, setPicked] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [shown, setShown] = useState(4);
  const [sheet, setSheet] = useState<"filter" | "export" | null>(null);
  const filtered = useMemo(() => {
    const next = entries.filter(
      (entry) => (filter === "전체" || entry.category === filter) && `${entry.name} ${entry.memo}`.includes(query.trim()),
    );
    if (sort === "금액 높은순") return [...next].sort((a, b) => b.amount - a.amount);
    if (sort === "이름순") return [...next].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    return next;
  }, [entries, filter, query, sort]);
  const size = 5;
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const rows = mobile ? filtered.slice(0, shown) : filtered.slice((page - 1) * size, page * size);
  const allOnPage = rows.length > 0 && rows.every((row) => picked.includes(row.id));
  function toggle(id: number) {
    setPicked((value) => (value.includes(id) ? value.filter((item) => item !== id) : [...value, id]));
  }
  function toggleAll() {
    const ids = rows.map((row) => row.id);
    setPicked((value) => (allOnPage ? value.filter((id) => !ids.includes(id)) : [...new Set([...value, ...ids])]));
  }

  const tools = (
    <div className="ledger-tools">
      <label className="ledger-search">
        <Search size={16} />
        <input aria-label="거래 검색" placeholder="거래 이름이나 메모 검색" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
      </label>
      {mobile ? (
        <button className="ledger-btn ledger-neutral" type="button" onClick={() => setSheet("filter")}>
          <SlidersHorizontal size={15} />필터
        </button>
      ) : (
        <>
          <label className="ledger-mini">
            시작
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="ledger-mini">
            끝
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="ledger-mini">
            카테고리
            <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
              {["전체", ...CATEGORIES].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="ledger-mini">
            정렬
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>최신순</option>
              <option>금액 높은순</option>
              <option>이름순</option>
            </select>
          </label>
        </>
      )}
    </div>
  );

  const bulk = (
    <div className={mobile ? "ledger-bulkbar" : "ledger-toolbar"} data-active={picked.length > 0}>
      <span>{picked.length}건 선택</span>
      <button className="ledger-btn ledger-neutral" type="button" disabled={picked.length === 0} onClick={() => onNotice("선택한 거래의 카테고리를 바꿨어요.")}>카테고리 변경</button>
      <button className="ledger-btn ledger-danger-button" type="button" disabled={picked.length === 0} onClick={() => { setPicked([]); onNotice("선택한 거래를 삭제 대기했어요."); }}>
        <Trash2 size={14} />삭제
      </button>
      {mobile && <button className="ledger-btn ledger-neutral" type="button" onClick={() => setSheet("export")}>내보내기</button>}
    </div>
  );

  const sheetBody = sheet === "filter" ? (
    <div className="ledger-sheet-form">
      <label className="ledger-field">시작<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
      <label className="ledger-field">끝<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      <label className="ledger-field">카테고리<select value={filter} onChange={(e) => setFilter(e.target.value)}>{["전체", ...CATEGORIES].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="ledger-field">정렬<select value={sort} onChange={(e) => setSort(e.target.value)}><option>최신순</option><option>금액 높은순</option><option>이름순</option></select></label>
      <button className="ledger-btn ledger-primary" type="button" onClick={() => setSheet(null)}>적용</button>
    </div>
  ) : (
    <div className="ledger-sheet-form">
      <p className="ledger-form-hint">선택한 기간의 거래를 CSV로 내려받아요.</p>
      <button className="ledger-btn ledger-primary" type="button" onClick={() => { setSheet(null); onNotice("거래 정리 파일을 준비했어요."); }}>내보내기</button>
    </div>
  );

  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">CLEAN UP</span>
          <h2>거래 정리</h2>
        </div>
        <span className="ledger-muted">{filtered.length}건</span>
      </div>
      {tools}
      {!mobile && bulk}
      {mobile ? (
        <div className="ledger-entry-list">
          {rows.map((entry) => (
            <div className={`ledger-entry ledger-pick${picked.includes(entry.id) ? " is-picked" : ""}`} key={entry.id}>
              <input type="checkbox" aria-label={`${entry.name} 선택`} checked={picked.includes(entry.id)} onChange={() => toggle(entry.id)} />
              <button type="button" onClick={() => onOpen(entry)}>
                <span className="ledger-entry-copy">
                  <strong>{entry.name}</strong>
                  <small>{entry.category} · {entry.date}</small>
                </span>
                <strong className="ledger-amount">−{money(entry.amount)}</strong>
              </button>
            </div>
          ))}
          {shown < filtered.length && <button className="ledger-btn ledger-neutral ledger-more" type="button" onClick={() => setShown((value) => value + 4)}>더 보기</button>}
        </div>
      ) : (
        <div className="ledger-table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="현재 페이지 전체 선택" checked={allOnPage} onChange={toggleAll} /></th>
                <th>사용처</th>
                <th>카테고리</th>
                <th>날짜</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className={picked.includes(entry.id) ? "is-picked" : undefined} onClick={() => onOpen(entry)}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`${entry.name} 선택`} checked={picked.includes(entry.id)} onChange={() => toggle(entry.id)} /></td>
                  <td>{entry.name}</td>
                  <td>{entry.category}</td>
                  <td>{entry.date}</td>
                  <td>−{money(entry.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!mobile && (
        <nav className="ledger-pager" aria-label="거래 페이지">
          <button className="ledger-btn ledger-neutral" type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>이전</button>
          {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
            <button key={item} type="button" className="ledger-page" aria-current={item === page ? "page" : undefined} onClick={() => setPage(item)}>{item}</button>
          ))}
          <button className="ledger-btn ledger-neutral" type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>다음</button>
        </nav>
      )}
      {mobile && picked.length > 0 && bulk}
      {mobile && sheet && (
        <div className="ledger-scrim" onClick={() => setSheet(null)}>
          <div className="ledger-dialog" role="dialog" aria-modal="true" aria-label={sheet === "filter" ? "필터" : "내보내기"} onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>{sheet === "filter" ? "필터" : "내보내기"}</h2>
              <button className="ledger-icon-btn" type="button" onClick={() => setSheet(null)} aria-label="닫기">닫기</button>
            </header>
            {sheetBody}
          </div>
        </div>
      )}
    </section>
  );
}

export function SetupView({
  budget,
  onSave,
}: {
  budget: number;
  onSave: (value: number, message: string) => void;
}) {
  const [amount, setAmount] = useState(String(budget));
  const [auto, setAuto] = useState(true);
  const [mode, setMode] = useState<"ratio" | "last" | "manual">("ratio");
  const [caps, setCaps] = useState<Record<Category, number>>({
    식비: Math.round(budget * SHARES.식비),
    쇼핑: Math.round(budget * SHARES.쇼핑),
    교통: Math.round(budget * SHARES.교통),
    생활: Math.round(budget * SHARES.생활),
  });
  const total = Number(amount);
  const valid = total >= 10000 && total <= 100000000 && Number.isInteger(total);
  const locked = auto && mode !== "manual";
  function apply(next: number, share: Record<Category, number>) {
    setCaps({
      식비: Math.round(next * share.식비),
      쇼핑: Math.round(next * share.쇼핑),
      교통: Math.round(next * share.교통),
      생활: Math.round(next * share.생활),
    });
  }
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">SET THE RULES</span>
          <h2>예산 설정</h2>
        </div>
        <label className="ledger-inline ledger-switch-row">
          자동 배분
          <Switch checked={auto} onChange={(value) => { setAuto(value); if (value && valid) apply(total, mode === "last" ? LAST : SHARES); }} label="자동 배분" />
        </label>
      </div>
      <label className="ledger-field">한 달 예산
        <span className="ledger-input-wrap">
          <input aria-label="한 달 예산" type="number" min={10000} max={100000000} step={1} value={amount} onChange={(e) => { setAmount(e.target.value); const next = Number(e.target.value); if (next >= 10000 && auto) apply(next, mode === "last" ? LAST : SHARES); }} aria-invalid={!!amount && !valid} />
          <span>원</span>
        </span>
      </label>
      {amount && !valid && <p className="ledger-form-error" role="alert">10,000원부터 1억원까지 정수로 입력해 주세요.</p>}
      <fieldset className="ledger-radios">
        <legend>배분 방식</legend>
        {([["ratio", "고정 비율"], ["last", "지난달 기준"], ["manual", "직접 입력"]] as const).map(([id, label]) => (
          <label key={id}>
            <input type="radio" name="split" checked={mode === id} disabled={!auto && id !== "manual"} onChange={() => { setMode(id); if (valid) apply(total, id === "last" ? LAST : SHARES); }} />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="ledger-sliders">
        {CATEGORIES.map((item) => (
          <label key={item} className="ledger-slider">
            <span className="ledger-between"><span>{item}</span><strong>{money(caps[item])}</strong></span>
            <input type="range" min={0} max={valid ? total : budget} step={10000} disabled={locked} value={caps[item]} onChange={(e) => setCaps((value) => ({ ...value, [item]: Number(e.target.value) }))} />
          </label>
        ))}
      </div>
      <div className="ledger-dialog-actions">
        <button className="ledger-btn ledger-secondary" type="button" onClick={() => { setAmount(String(budget)); setAuto(true); setMode("ratio"); apply(budget, SHARES); }}>초기화</button>
        <button className="ledger-btn ledger-primary" type="button" disabled={!valid} onClick={() => onSave(total, "예산 기준을 저장했어요.")}>저장</button>
      </div>
    </section>
  );
}

export function AlertsView() {
  const [on, setOn] = useState(true);
  const [channels, setChannels] = useState({ push: true, email: true, sms: false });
  const [cycle, setCycle] = useState("매일");
  const [limit, setLimit] = useState(80);
  const [time, setTime] = useState("21:00");
  const [open, setOpen] = useState("budget");
  function toggle(key: keyof typeof channels) {
    setChannels((value) => ({ ...value, [key]: !value[key] }));
  }
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">STAY AHEAD</span>
          <h2>알림 · 자동화</h2>
        </div>
        <label className="ledger-inline ledger-switch-row">
          알림 받기
          <Switch checked={on} onChange={setOn} label="알림 받기" />
        </label>
      </div>
      <fieldset className="ledger-checks" disabled={!on}>
        <legend>알림 채널</legend>
        <label><input type="checkbox" checked={channels.push} onChange={() => toggle("push")} />앱 푸시</label>
        <label><input type="checkbox" checked={channels.email} onChange={() => toggle("email")} />이메일</label>
        <label className="is-disabled"><input type="checkbox" checked={channels.sms} disabled />SMS · 준비 중</label>
      </fieldset>
      <fieldset className="ledger-radios" disabled={!on}>
        <legend>알림 주기</legend>
        {["즉시", "매일", "매주"].map((item) => (
          <label key={item}><input type="radio" name="cycle" checked={cycle === item} onChange={() => setCycle(item)} />{item}</label>
        ))}
      </fieldset>
      <label className={`ledger-slider${on ? "" : " is-disabled"}`}>
        <span className="ledger-between"><span>예산 임계값</span><strong>{limit}%</strong></span>
        <input type="range" min={50} max={100} step={5} disabled={!on} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
      </label>
      <label className="ledger-field">알림 시간
        <input type="time" value={time} disabled={!on} onChange={(e) => setTime(e.target.value)} />
      </label>
      <div className="ledger-accs">
        {([["budget", "예산 초과", "warning", "한도에 80%가 되면 알려요."], ["repeat", "반복 결제", "info", "정기 결제 3일 전에 미리 알려요."], ["goal", "목표 달성", "success", "저축 목표에 도달하면 축하 알림을 보내요."]] as const).map(([id, title, tone, body]) => (
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

export function AccountsView({ onNotice }: { onNotice: (message: string) => void }) {
  const [main, setMain] = useState("hana");
  const [hide, setHide] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [cut, setCut] = useState<string | null>(null);
  const accounts = [
    { id: "hana", name: "하나 입출금", bank: "하나은행", amount: 842000, tone: "success" as const, status: "연결됨" },
    { id: "card", name: "생활비 카드", bank: "신한카드", amount: 126400, tone: "success" as const, status: "연결됨" },
    { id: "kb", name: "비상금 통장", bank: "국민은행", amount: 2100000, tone: "danger" as const, status: "끊김" },
  ];
  return (
    <div className="ledger-account-grid">
      {accounts.map((item) => (
        <section className="ledger-card ledger-account" key={item.id}>
          <div className="ledger-between">
            <span className={`ledger-status ledger-${item.tone}`}>{item.status}</span>
            <button className="ledger-icon-btn" type="button" aria-label={`${item.name} 더보기`} onClick={() => setMenu(menu === item.id ? null : item.id)}>
              <MoreHorizontal size={16} />
            </button>
          </div>
          {menu === item.id && (
            <div className="ledger-menu">
              <button type="button" onClick={() => { setMenu(null); onNotice("계좌 별칭을 바꿀 수 있어요."); }}>별칭 수정</button>
              <button type="button" className="is-danger" onClick={() => { setMenu(null); setCut(item.id); }}>연결 해제</button>
            </div>
          )}
          <h2>{item.name}</h2>
          <p>{item.bank}</p>
          <strong className={hide ? "ledger-inverse-mask" : undefined}>{hide ? "••••••" : money(item.amount)}</strong>
          <label className="ledger-radio-row">
            <input type="radio" name="main-account" checked={main === item.id} onChange={() => setMain(item.id)} />
            기본 계좌
          </label>
        </section>
      ))}
      <section className="ledger-card ledger-account-tools">
        <label className="ledger-inline ledger-switch-row">
          잔액 숨기기
          <Switch checked={hide} onChange={setHide} label="잔액 숨기기" />
        </label>
        <p className="ledger-muted">카드와 계좌 잔액을 Inverse 처리된 가림 값으로 보여줘요.</p>
      </section>
      {cut && (
        <div className="ledger-scrim" onClick={() => setCut(null)}>
          <div className="ledger-dialog" role="dialog" aria-modal="true" aria-label="연결 해제" onClick={(e) => e.stopPropagation()}>
            <header><h2>연결을 해제할까요?</h2></header>
            <p className="ledger-form-hint">이 계좌의 거래는 더 이상 자동으로 들어오지 않아요.</p>
            <div className="ledger-dialog-actions">
              <button className="ledger-btn ledger-neutral" type="button" onClick={() => setCut(null)}>취소</button>
              <button className="ledger-btn ledger-danger-button" type="button" onClick={() => { setCut(null); onNotice("계좌 연결을 해제했어요."); }}>연결 해제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalysisView() {
  const [period, setPeriod] = useState("1달");
  const [chart, setChart] = useState("도넛");
  const [legend, setLegend] = useState<Record<Category, boolean>>({ 식비: true, 쇼핑: true, 교통: true, 생활: true });
  const [tip, setTip] = useState<Category | null>("식비");
  const values: Record<Category, number> = { 식비: 259800, 쇼핑: 194400, 교통: 50000, 생활: 742600 };
  const last: Record<Category, number> = { 식비: 210000, 쇼핑: 160000, 교통: 48000, 생활: 700000 };
  const visible = CATEGORIES.filter((item) => legend[item]);
  const total = visible.reduce((sum, item) => sum + values[item], 0);
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">SEE THE MIX</span>
          <h2>지출 분석</h2>
        </div>
        <div className="ledger-seg" role="tablist" aria-label="기간">
          {["1주", "1달", "3달"].map((item) => (
            <button key={item} type="button" role="tab" aria-selected={period === item} onClick={() => setPeriod(item)}>{item}</button>
          ))}
        </div>
      </div>
      <div className="ledger-seg ledger-seg-ghost" role="tablist" aria-label="차트 종류">
        {["도넛", "막대"].map((item) => (
          <button key={item} type="button" role="tab" aria-selected={chart === item} onClick={() => setChart(item)}>{item}</button>
        ))}
      </div>
      <div className="ledger-chart-content">
        {chart === "도넛" ? (
          <div className="ledger-donut" role="img" aria-label="카테고리 지출" style={{ background: `conic-gradient(${categoryDonutGradient(CATEGORIES.map(item => values[item] / Math.max(total, 1) * 100))})` }}>
            <div><small>총 지출</small><strong>{Math.round(total / 10000)}<small>만원</small></strong></div>
          </div>
        ) : (
          <div className="ledger-bars" aria-hidden>
            {CATEGORIES.map((item, index) => (
              <span key={item} className={`ledger-category-${index}`} style={{ height: `${legend[item] ? Math.max(18, values[item] / 8000) : 8}px`, opacity: legend[item] ? 1 : 0.28 }} />
            ))}
          </div>
        )}
        <div className="ledger-legend">
          {CATEGORIES.map((item, index) => (
            <label key={item}>
              <input type="checkbox" checked={legend[item]} onChange={() => setLegend((value) => ({ ...value, [item]: !value[item] }))} />
              <i className={`ledger-category-${index}`} />
              <button type="button" onClick={() => setTip(item)}>{item}</button>
              <strong>{Math.round(values[item] / Math.max(total, 1) * 100)}%</strong>
            </label>
          ))}
        </div>
      </div>
      {tip && (
        <div className="ledger-tooltip" role="status">
          <span>{tip}</span>
          <strong>{money(values[tip])}</strong>
          <small>{period} 기준 · 지난 기간 대비 {values[tip] > last[tip] ? "+" : ""}{money(values[tip] - last[tip])}</small>
        </div>
      )}
      <table className="ledger-table ledger-compare">
        <thead><tr><th>항목</th><th>이번</th><th>지난</th><th>진행</th></tr></thead>
        <tbody>
          {CATEGORIES.map((item) => (
            <tr key={item}>
              <td>{item}</td>
              <td>{money(values[item])}</td>
              <td>{money(last[item])}</td>
              <td>
                <div className="ledger-progress" role="progressbar" aria-label={`${item} 이번 기간`} aria-valuenow={Math.round(values[item] / 800000 * 100)}>
                  <span style={{ width: `${Math.min(100, values[item] / 8000)}%` }} />
                </div>
                <div className="ledger-progress ledger-progress-secondary" role="progressbar" aria-label={`${item} 지난 기간`} aria-valuenow={Math.round(last[item] / 800000 * 100)}>
                  <span style={{ width: `${Math.min(100, last[item] / 8000)}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function ExportView({ onNotice }: { onNotice: (message: string) => void }) {
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-22");
  const [format, setFormat] = useState("CSV");
  const [include, setInclude] = useState({ memo: true, category: true, account: false });
  const [privacy, setPrivacy] = useState(true);
  const [busy, setBusy] = useState(false);
  function run() {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onNotice(format === "PDF" ? "PDF 내보내기에 실패했어요. 다시 시도해 주세요." : "내보내기가 완료되었어요.");
    }, 900);
  }
  return (
    <section className="ledger-card ledger-view">
      <div className="ledger-section-head">
        <div>
          <span className="ledger-eyebrow">TAKE IT OUT</span>
          <h2>내보내기</h2>
        </div>
        <Download size={18} />
      </div>
      <div className="ledger-tools">
        <label className="ledger-mini">시작<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="ledger-mini">끝<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      </div>
      <fieldset className="ledger-radios">
        <legend>파일 형식</legend>
        {["CSV", "Excel", "PDF"].map((item) => (
          <label key={item}><input type="radio" name="format" checked={format === item} onChange={() => setFormat(item)} />{item}</label>
        ))}
      </fieldset>
      <fieldset className="ledger-checks">
        <legend>포함할 항목</legend>
        <label><input type="checkbox" checked={include.memo} onChange={() => setInclude((value) => ({ ...value, memo: !value.memo }))} />메모</label>
        <label><input type="checkbox" checked={include.category} onChange={() => setInclude((value) => ({ ...value, category: !value.category }))} />카테고리</label>
        <label><input type="checkbox" checked={include.account} onChange={() => setInclude((value) => ({ ...value, account: !value.account }))} />계좌 정보</label>
      </fieldset>
      <label className="ledger-inline ledger-switch-row">
        개인정보 제외
        <Switch checked={privacy} onChange={setPrivacy} label="개인정보 제외" />
      </label>
      {busy && <div className="ledger-progress ledger-progress-lg" role="progressbar" aria-label="내보내는 중" aria-valuenow={70}><span style={{ width: "70%" }} /></div>}
      <div className="ledger-dialog-actions">
        <button className="ledger-btn ledger-neutral" type="button" disabled>예약 보내기</button>
        <button className="ledger-btn ledger-primary" type="button" disabled={busy} onClick={run}>{busy ? "내보내는 중" : "지금 내보내기"}</button>
      </div>
    </section>
  );
}

export function MoreSheet({
  onPick,
  onClose,
}: {
  onPick: (view: "alerts" | "accounts" | "export") => void;
  onClose: () => void;
}) {
  return (
    <div className="ledger-scrim" onClick={onClose}>
      <div className="ledger-dialog" role="dialog" aria-modal="true" aria-label="더보기" onClick={(e) => e.stopPropagation()}>
        <header><h2>더보기</h2></header>
        <div className="ledger-more-list">
          <button type="button" onClick={() => onPick("alerts")}><Bell size={16} />알림 · 자동화</button>
          <button type="button" onClick={() => onPick("accounts")}><CreditCard size={16} />계좌 · 카드</button>
          <button type="button" onClick={() => onPick("export")}><Download size={16} />내보내기</button>
        </div>
      </div>
    </div>
  );
}
