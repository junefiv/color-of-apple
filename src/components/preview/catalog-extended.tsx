"use client";

import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileText,
  Inbox,
  Loader2,
  MoreHorizontal,
  SearchX,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useCopy } from "@/hooks/use-copy";

export function CatalogExtendedShowcase() {
  const c = useCopy().preview.kit.extendedKit;
  const [chips, setChips] = useState(["design"]);
  const [tagVisible, setTagVisible] = useState(true);
  const [tab, setTab] = useState("overview");
  const [segment, setSegment] = useState("monthly");
  const [progress, setProgress] = useState(64);
  const [emptyMode, setEmptyMode] = useState<"empty" | "search" | "error">("empty");
  const [accordion, setAccordion] = useState("tokens");
  const [page, setPage] = useState(2);
  const [dragging, setDragging] = useState(false);
  const [fileState, setFileState] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [member, setMember] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const chipOptions = [c.design, c.development, c.marketing];
  const members = [
    { initials: "MK", name: c.memberOne, role: c.designer, tone: "primary" },
    { initials: "JS", name: c.memberTwo, role: c.developer, tone: "secondary" },
    { initials: "HY", name: c.memberThree, role: c.marketer, tone: "accent" },
  ];
  const accordionItems = [
    ["tokens", c.accordionTokens, c.accordionTokensBody],
    ["components", c.accordionComponents, c.accordionComponentsBody],
    ["accessibility", c.accordionAccessibility, c.accordionAccessibilityBody],
  ];

  function toggleChip(value: string) {
    setChips((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function inspectFile(file?: File) {
    if (!file) return;
    const validType = file.type.startsWith("image/") || file.type === "application/pdf";
    const validSize = file.size <= 2 * 1024 * 1024;
    setFileName(file.name);
    setFileState(validType && validSize ? "success" : "error");
  }

  const EmptyIcon = emptyMode === "empty" ? Inbox : emptyMode === "search" ? SearchX : CircleAlert;
  const emptyTitle = emptyMode === "empty" ? c.emptyTitle : emptyMode === "search" ? c.noResultsTitle : c.errorTitle;
  const emptyBody = emptyMode === "empty" ? c.emptyBody : emptyMode === "search" ? c.noResultsBody : c.errorBody;

  return (
    <div className="kit-extended-grid">
      <article className="kit-demo-card">
        <h3>{c.badges}</h3>
        <div className="kit-badge-row">
          <span data-tone="success">{c.complete}</span>
          <span data-tone="info">{c.inProgress}</span>
          <span data-tone="warning">{c.review}</span>
          <span data-tone="danger">{c.delayed}</span>
        </div>
        <div className="kit-chip-row">
          {chipOptions.map((item) => (
            <button key={item} type="button" data-selected={chips.includes(item) || undefined} onClick={() => toggleChip(item)}>
              {chips.includes(item) ? <Check aria-hidden /> : null}{item}
            </button>
          ))}
        </div>
        {tagVisible ? <span className="kit-removable-tag">{c.tag}<button type="button" aria-label={c.removeTag} onClick={() => setTagVisible(false)}><X aria-hidden /></button></span> : (
          <button type="button" className="kit-restore-tag" onClick={() => setTagVisible(true)}>{c.restoreTag}</button>
        )}
      </article>

      <article className="kit-demo-card">
        <h3>{c.tabsSegments}</h3>
        <div className="kit-tabs" role="tablist">
          {[["overview", c.overview], ["activity", c.activity], ["settings", c.settings]].map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>{label}</button>
          ))}
        </div>
        <div className="kit-tab-panel">{tab === "overview" ? c.overviewBody : tab === "activity" ? c.activityBody : c.settingsBody}</div>
        <div className="kit-segments" role="radiogroup">
          {[["weekly", c.weekly], ["monthly", c.monthly], ["yearly", c.yearly]].map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={segment === value} onClick={() => setSegment(value)}>{label}</button>
          ))}
        </div>
      </article>

      <article className="kit-demo-card">
        <h3>{c.loadingStates}</h3>
        <div className="kit-progress-copy"><span>{c.uploadProgress}</span><strong>{progress}%</strong></div>
        <div className="kit-progress-track"><i style={{ width: `${progress}%` }} /></div>
        <button type="button" className="kit-progress-action" onClick={() => setProgress((value) => value >= 100 ? 24 : Math.min(100, value + 12))}>{c.advance}</button>
        <div className="kit-loading-row"><Loader2 className="kit-demo-spinner" aria-label={c.loading} /><span>{c.loading}</span></div>
        <div className="kit-skeleton" aria-label={c.skeleton}><i /><i /><i /></div>
      </article>

      <article className="kit-demo-card">
        <h3>{c.emptyStates}</h3>
        <div className="kit-state-switcher">
          {(["empty", "search", "error"] as const).map((value) => (
            <button key={value} type="button" aria-pressed={emptyMode === value} onClick={() => setEmptyMode(value)}>
              {value === "empty" ? c.empty : value === "search" ? c.noResults : c.error}
            </button>
          ))}
        </div>
        <div className="kit-empty-state" data-tone={emptyMode === "error" ? "danger" : "neutral"}>
          <EmptyIcon aria-hidden /><strong>{emptyTitle}</strong><p>{emptyBody}</p>
          <button type="button">{emptyMode === "error" ? c.retry : c.addItem}</button>
        </div>
      </article>

      <article className="kit-demo-card">
        <h3>{c.accordion}</h3>
        <div className="kit-accordion">
          {accordionItems.map(([value, title, body]) => {
            const open = accordion === value;
            return <section key={value}>
              <button type="button" aria-expanded={open} onClick={() => setAccordion(open ? "" : value)}><span>{title}</span><ChevronDown aria-hidden /></button>
              {open ? <p>{body}</p> : null}
            </section>;
          })}
        </div>
      </article>

      <article className="kit-demo-card">
        <h3>{c.navigation}</h3>
        <nav className="kit-breadcrumb" aria-label={c.breadcrumb}>
          <button type="button">{c.home}</button><ChevronRight aria-hidden />
          <button type="button">{c.library}</button><ChevronRight aria-hidden />
          <span>{c.current}</span>
        </nav>
        <div className="kit-page-copy">{c.page.replace("{n}", String(page))}</div>
        <nav className="kit-pagination" aria-label={c.pagination}>
          <button type="button" aria-label={c.previous} disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft aria-hidden /></button>
          {[1, 2, 3, 4].map((value) => <button key={value} type="button" aria-current={page === value ? "page" : undefined} onClick={() => setPage(value)}>{value}</button>)}
          <button type="button" aria-label={c.next} disabled={page === 4} onClick={() => setPage((value) => Math.min(4, value + 1))}><ChevronRight aria-hidden /></button>
        </nav>
      </article>

      <article className="kit-demo-card">
        <h3>{c.dateTime}</h3>
        <label className="kit-native-field"><span>{c.date}</span><input type="date" defaultValue="2026-09-27" /></label>
        <label className="kit-native-field"><span>{c.time}</span><input type="time" defaultValue="14:30" /></label>
        <label className="kit-native-field"><span>{c.disabledDate}</span><input type="date" defaultValue="2026-10-01" disabled /></label>
      </article>

      <article className="kit-demo-card">
        <h3>{c.fileUpload}</h3>
        <input ref={fileRef} type="file" accept="image/*,.pdf" hidden onChange={(event) => inspectFile(event.target.files?.[0])} />
        <button
          type="button"
          className="kit-dropzone"
          data-dragging={dragging || undefined}
          data-state={fileState}
          onClick={() => fileRef.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); inspectFile(event.dataTransfer.files[0]); }}
        >
          {fileState === "success" ? <BadgeCheck aria-hidden /> : fileState === "error" ? <CircleAlert aria-hidden /> : <Upload aria-hidden />}
          <strong>{fileState === "success" ? c.uploadComplete : fileState === "error" ? c.uploadError : c.dropFile}</strong>
          <small>{fileName || c.uploadHint}</small>
        </button>
      </article>

      <article className="kit-demo-card">
        <h3>{c.avatarList}</h3>
        <div className="kit-member-list">
          {members.map((item, index) => (
            <button key={item.name} type="button" data-selected={member === index || undefined} onClick={() => setMember(index)}>
              <span className="kit-avatar" data-tone={item.tone}>{item.initials}<i aria-hidden /></span>
              <span><strong>{item.name}</strong><small>{item.role}</small></span>
              {member === index ? <Check aria-hidden /> : null}
            </button>
          ))}
        </div>
      </article>

      <article className="kit-demo-card">
        <h3>{c.menus}</h3>
        <div className="kit-menu-demo" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdownOpen(false); }}>
          <button type="button" className="kit-menu-trigger" aria-expanded={dropdownOpen} onClick={() => setDropdownOpen((value) => !value)}>{c.actions}<ChevronDown aria-hidden /></button>
          {dropdownOpen ? <MenuItems labels={[c.edit, c.duplicate, c.archive]} disabledLast /> : null}
        </div>
        <div className="kit-context-demo" tabIndex={0} onContextMenu={(event) => { event.preventDefault(); setContextOpen(true); }}>
          <FileText aria-hidden /><span>{c.contextTarget}</span><MoreHorizontal aria-hidden />
        </div>
        {contextOpen ? <div className="kit-context-wrap"><MenuItems labels={[c.open, c.rename, c.delete]} /><button type="button" className="kit-context-close" onClick={() => setContextOpen(false)}>{c.close}</button></div> : <small className="kit-context-hint">{c.contextHint}</small>}
      </article>
    </div>
  );
}

function MenuItems({ labels, disabledLast = false }: { labels: string[]; disabledLast?: boolean }) {
  return <div className="kit-menu-options" role="menu">
    {labels.map((label, index) => <button key={label} type="button" role="menuitem" disabled={disabledLast && index === labels.length - 1}>{label}</button>)}
  </div>;
}
