"use client";

import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Inbox,
  Loader2,
  Minus,
  Plus,
  Search,
  SearchX,
  Star,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useCopy } from "@/hooks/use-copy";
import { Slider } from "@/components/ui/slider";

export function CatalogExtendedShowcase() {
  const kit = useCopy().preview.kit;
  const c = kit.extendedKit;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [multiSelectOpen, setMultiSelectOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["design", "development"]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(3);
  const [sliderValue, setSliderValue] = useState(42);
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

  const filteredSearchOptions = kit.searchOptions.filter((option) =>
    option.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
  );
  const multiSelectOptions = [
    { value: "design", label: kit.multiSelectDesign },
    { value: "development", label: kit.multiSelectDevelopment },
    { value: "marketing", label: kit.multiSelectMarketing },
    { value: "research", label: kit.multiSelectResearch },
  ];
  const EmptyIcon = emptyMode === "empty" ? Inbox : emptyMode === "search" ? SearchX : CircleAlert;
  const emptyTitle = emptyMode === "empty" ? c.emptyTitle : emptyMode === "search" ? c.noResultsTitle : c.errorTitle;
  const emptyBody = emptyMode === "empty" ? c.emptyBody : emptyMode === "search" ? c.noResultsBody : c.errorBody;

  return (
    <>
      <article className="kit-demo-card kit-input-set-card kit-span-rows">
        <div className="kit-input-set-body">
          <div className="kit-control-group">
            <span className="kit-control-label">{kit.searchPlaceholder}</span>
            <div
              className="kit-search-combobox"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false);
              }}
            >
              <Search aria-hidden />
              <input
                role="combobox"
                aria-expanded={searchOpen}
                aria-controls="kit-search-options"
                aria-autocomplete="list"
                value={searchQuery}
                placeholder={kit.searchPlaceholder}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
              />
              {searchOpen ? (
                <div id="kit-search-options" className="kit-search-options" role="listbox">
                  {filteredSearchOptions.length > 0 ? filteredSearchOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={searchQuery === option}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSearchQuery(option);
                        setSearchOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  )) : <p>{kit.noSearchResults}</p>}
                </div>
              ) : null}
            </div>
          </div>

          <div className="kit-control-group">
            <span className="kit-control-label">{kit.multiSelect}</span>
            <div
              className="kit-multi-select"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMultiSelectOpen(false);
              }}
            >
              <button
                type="button"
                className="kit-multi-select-trigger"
                aria-expanded={multiSelectOpen}
                aria-controls="kit-multi-select-options"
                onClick={() => setMultiSelectOpen((value) => !value)}
              >
                <span>
                  {selectedCategories.length > 0
                    ? kit.multiSelectCount.replace("{n}", String(selectedCategories.length))
                    : kit.multiSelectPlaceholder}
                </span>
                <ChevronDown aria-hidden />
              </button>
              {multiSelectOpen ? (
                <div id="kit-multi-select-options" className="kit-multi-select-options" role="listbox" aria-multiselectable="true">
                  {multiSelectOptions.map((option) => {
                    const selected = selectedCategories.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => setSelectedCategories((current) => (
                          selected
                            ? current.filter((value) => value !== option.value)
                            : [...current, option.value]
                        ))}
                      >
                        <span className="kit-multi-select-check" data-selected={selected || undefined}>
                          {selected ? <Check aria-hidden /> : null}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="kit-control-group">
            <span className="kit-control-label">{kit.quantity}</span>
            <div className="kit-quantity-control">
              <button
                type="button"
                aria-label={kit.decreaseQuantity}
                disabled={quantity <= 0}
                onClick={() => setQuantity((value) => Math.max(0, value - 1))}
              >
                <Minus aria-hidden />
              </button>
              <input
                type="number"
                min={0}
                value={quantity}
                aria-label={kit.quantity}
                onChange={(event) => setQuantity(Math.max(0, Number(event.target.value) || 0))}
              />
              <button type="button" aria-label={kit.increaseQuantity} onClick={() => setQuantity((value) => value + 1)}>
                <Plus aria-hidden />
              </button>
            </div>
          </div>

          <div className="kit-control-group">
            <span className="kit-control-label">{kit.rating}</span>
            <div className="kit-rating" aria-label={kit.rating}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} / 5`}
                  aria-pressed={rating === value}
                  data-active={value <= rating || undefined}
                  onClick={() => setRating(value)}
                >
                  <Star aria-hidden />
                </button>
              ))}
            </div>
          </div>

          <div className="kit-control-group kit-slider-span">
            <span className="kit-control-label kit-slider-label">
              <span>{kit.slider}</span>
              <span>{sliderValue}</span>
            </span>
            <Slider
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(typeof value === "number" ? value : (value[0] ?? 0))}
            />
          </div>
        </div>
      </article>

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
        <div className="kit-segments" role="radiogroup" data-value={segment}>
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

      <article className="kit-demo-card kit-span-rows">
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

      <article className="kit-demo-card kit-span-rows">
        <h3>{c.accordion}</h3>
        <div className="kit-accordion">
          {accordionItems.map(([value, title, body]) => {
            const open = accordion === value;
            return <section key={value} data-open={open || undefined}>
              <button type="button" aria-expanded={open} onClick={() => setAccordion(open ? "" : value)}><span>{title}</span><ChevronDown aria-hidden /></button>
              <div className="kit-accordion-panel">
                <p>{body}</p>
              </div>
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

      <article className="kit-demo-card kit-span-rows">
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
        <div className="kit-menu-demo" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdownOpen(false); }}>
          <button type="button" className="kit-menu-trigger" aria-expanded={dropdownOpen} onClick={() => setDropdownOpen((value) => !value)}>{c.actions}<ChevronDown aria-hidden /></button>
          {dropdownOpen ? <MenuItems labels={[c.edit, c.duplicate, c.archive]} disabledLast /> : null}
        </div>
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

    </>
  );
}

function MenuItems({ labels, disabledLast = false }: { labels: string[]; disabledLast?: boolean }) {
  return <div className="kit-menu-options" role="menu">
    {labels.map((label, index) => <button key={label} type="button" role="menuitem" disabled={disabledLast && index === labels.length - 1}>{label}</button>)}
  </div>;
}
