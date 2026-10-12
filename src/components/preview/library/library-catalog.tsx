"use client";

import { useEffect, useId, useRef, useState, type SetStateAction } from "react";
import { Copy, Eye, Search, X } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { useMatchuStore } from "@/lib/store";
import { COMPONENT_GROUPS, COMPONENT_TYPES, LIBRARY_ITEM_TYPES, componentCount, LIBRARY_ITEMS, type ComponentGroupId, type ComponentTypeId, type LibraryItemId } from "./catalog";
import { emptyUiKitStats, type UiKitStats } from "@/lib/ui-kit/stats";
import { ComponentPlayground } from "./playground";
import { defaultOptions, type ComponentOptions } from "./settings";
import { usePreviewTheme } from "../theme-scope";
import { navigateUiKit, readUiKitLocation, UI_KIT_NAVIGATION_EVENT, uiKitUrl } from "@/lib/ui-kit-navigation";
import "@/styles/library-kit.css";

function FilterTabs({ options, value, onChange, prefix, panel, label, secondary = false }: {
  options: readonly { id: string; label: string; count?: number }[];
  value: string; onChange: (value: string) => void; prefix: string; panel: string; label: string; secondary?: boolean;
}) {
  return <div className={`lk-filter-tabs${secondary ? " lk-filter-subtabs" : ""}`} role="tablist" aria-label={label}>
    {options.map((option, index) => <button type="button" key={option.id} id={`${prefix}-${option.id}`} role="tab" aria-selected={value === option.id} aria-controls={panel} tabIndex={value === option.id ? 0 : -1} onClick={() => onChange(option.id)} onKeyDown={event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowRight" ? 1 : options.length - 1)) % options.length;
      onChange(options[next].id);
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    }}>{option.label}{option.count !== undefined && <span>{option.count}</span>}</button>)}
  </div>;
}

export function LibraryCatalog() {
  const theme = usePreviewTheme();
  const ko = useMatchuStore(state => state.locale) === "ko";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LibraryItemId | null>(null);
  const [configurations, setConfigurations] = useState(() => Object.fromEntries(LIBRARY_ITEMS.map(([id]) => [id, defaultOptions(id)])) as Record<LibraryItemId, ComponentOptions>);
  const configure = (id: LibraryItemId, next: SetStateAction<ComponentOptions>) => setConfigurations(previous => ({ ...previous, [id]: typeof next === "function" ? next(previous[id]) : next }));
  const [stats, setStats] = useState<UiKitStats>(emptyUiKitStats);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [category, setCategory] = useState<ComponentGroupId>("all");
  const [subcategory, setSubcategory] = useState("all");
  const filterId = useId();
  const container = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const sync = () => {
      const route = readUiKitLocation();
      const id = LIBRARY_ITEMS.find(item => item[0] === route.component)?.[0] ?? null;
      if (route.active && route.component && !id) navigateUiKit(undefined, true);
      setSelected(id);
    };
    if (!readUiKitLocation().active) navigateUiKit(undefined, true);
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener(UI_KIT_NAVIGATION_EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener(UI_KIT_NAVIGATION_EVENT, sync);
    };
  }, []);
  useEffect(() => {
    let cancel = false;
    void fetch("/api/ui-kit/stats").then((response) => response.json()).then((data: { stats?: UiKitStats }) => {
      if (!cancel && data.stats) setStats((current) => ({ ...current, ...data.stats }));
    }).catch(() => undefined).finally(() => { if (!cancel) setStatsLoaded(true); });
    return () => { cancel = true; };
  }, []);
  const open = (id: LibraryItemId, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    navigateUiKit(id);
  };
  const close = () => {
    setSelected(null);
    if (window.history.state?.coaUiKitParent === uiKitUrl()) window.history.back();
    else navigateUiKit(undefined, true);
  };
  function noteCopy(id: LibraryItemId) {
    setStats((current) => ({ ...current, [id]: { ...current[id], copyCount: current[id].copyCount + 1 } }));
    void fetch("/api/ui-kit/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, kind: "copy" }) }).catch(() => undefined);
  }
  const query = search.trim().toLowerCase();
  const group = COMPONENT_GROUPS.find(group => group.id === category)!;
  const groupItems: readonly ComponentTypeId[] = group.items;
  const visible = LIBRARY_ITEMS.filter(([id, kr, en], i) => groupItems.includes(LIBRARY_ITEM_TYPES[id]) && (subcategory === "all" || subcategory === LIBRARY_ITEM_TYPES[id]) && `${id} ${kr} ${en} ${i + 1}`.toLowerCase().includes(query));
  const subcategories = [{ id: "all", label: "All", count: componentCount(groupItems) }, ...groupItems.map(id => ({ id, label: COMPONENT_TYPES.find(item => item[0] === id)![1], count: componentCount([id]) }))];
  const selectedItem = LIBRARY_ITEMS.find(([id]) => id === selected);
  const visibleKey = visible.map(([id]) => id).join("\n");
  useEffect(() => {
    if (!statsLoaded) return;
    const pending = visibleKey.split("\n").filter((id): id is LibraryItemId => LIBRARY_ITEMS.some(([itemId]) => itemId === id));
    const fresh = pending.filter((id) => {
      const key = `matchu-ui-kit-view:${id}`;
      try {
        if (window.localStorage.getItem(key)) return false;
        window.localStorage.setItem(key, "1");
        return true;
      } catch {
        return false;
      }
    });
    if (fresh.length === 0) return;
    setStats((current) => {
      const next = { ...current };
      for (const id of fresh) next[id] = { ...next[id], viewCount: next[id].viewCount + 1 };
      return next;
    });
    for (const id of fresh) {
      void fetch("/api/ui-kit/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, kind: "view" }) }).catch(() => undefined);
    }
  }, [statsLoaded, visibleKey]);
  return <div ref={container} className="library-kit">
    <header className="lk-catalog-heading"><div><span className="lk-eyebrow">COLOR OF APPLE / UI KIT</span><h3>{ko ? "컴포넌트" : "Components"}<small>{ko ? `${LIBRARY_ITEMS.length}가지 컴포넌트` : `${LIBRARY_ITEMS.length} components`}</small></h3></div>
      <p>{ko ? "컴포넌트를 체험하고, 내 설정으로 코드를 가져가세요." : "Explore components and copy code with your settings."}</p>
    </header>
    <label className="lk-catalog-search"><Search size={18} aria-hidden /><input type="search" aria-label={ko ? "컴포넌트 찾기" : "Find a component"} placeholder={ko ? "컴포넌트 찾기..." : "Search components..."} value={search} onChange={event => setSearch(event.target.value)} /><span>{visible.length}/{LIBRARY_ITEMS.length}</span></label>
    <nav className="lk-catalog-filters" aria-label={ko ? "컴포넌트 분류" : "Component filters"}>
      <FilterTabs prefix={`${filterId}-category`} panel={`${filterId}-panel`} label={ko ? "컴포넌트 그룹" : "Component groups"} options={COMPONENT_GROUPS.map(group => ({ id: group.id, label: group.label, count: componentCount(group.items) }))} value={category} onChange={value => { setCategory(value as ComponentGroupId); setSubcategory("all"); }} />
      {category !== "all" && <FilterTabs prefix={`${filterId}-type`} panel={`${filterId}-panel`} label={`${group.label} ${ko ? "컴포넌트 종류" : "component types"}`} options={subcategories} value={subcategory} onChange={setSubcategory} secondary />}
    </nav>
    <div className="lk-catalog-grid" id={`${filterId}-panel`} role="tabpanel" aria-labelledby={category === "all" ? `${filterId}-category-all` : `${filterId}-type-${subcategory}`}>{LIBRARY_ITEMS.map(([id, kr, en]) => {
      const name = ko ? kr : en;
      const counts = stats[id];
      return <article hidden={!visible.some(item => item[0] === id)} key={id} className="lk-example" data-component={id}>
      <ComponentPlayground id={id} ko={ko} compact options={configurations[id]} onOptionsChange={next => configure(id, next)} />
      <div className="lk-card-chrome">
        <p className="lk-card-name">{name}</p>
        <div className="lk-card-bar">
          <div className="lk-card-stats">
            <span className="lk-card-stat" aria-label={ko ? `조회 ${counts.viewCount}` : `${counts.viewCount} views`}><Eye size={14} aria-hidden />{counts.viewCount}</span>
            <span className="lk-card-stat" aria-label={ko ? `복사 ${counts.copyCount}` : `${counts.copyCount} copies`}><Copy size={14} aria-hidden />{counts.copyCount}</span>
          </div>
          <button type="button" className="lk-detail-link" onClick={event => open(id, event.currentTarget)}>{`</> Edit & Use`}</button>
        </div>
      </div>
    </article>;
    })}</div>
    {visible.length === 0 && <p className="lk-empty" role="status">{query ? ko ? "일치하는 컴포넌트가 없어요." : "No matching components." : ko ? "아직 등록된 컴포넌트가 없어요." : "No components registered yet."}</p>}
    <Dialog.Root open={Boolean(selected)} onOpenChange={open => { if (!open) close(); }}>
      <Dialog.Portal>
        <div className="library-kit lk-component-scope lk-detail-theme" style={theme}>
        <Dialog.Backdrop className="lk-detail-backdrop" />
        <Dialog.Popup className="lk-detail-modal" finalFocus={() => returnFocus.current}>
          {selected && selectedItem && <>
            <header className="lk-detail-heading"><div><span className="lk-eyebrow">UI KIT / {selectedItem[2]}</span><Dialog.Title>{ko ? selectedItem[1] : selectedItem[2]}</Dialog.Title><Dialog.Description>{ko ? "미리보기와 설정을 바꾸면 코드도 함께 변경됩니다." : "Preview and settings stay in sync with the code."}</Dialog.Description></div><Dialog.Close className="lk-back lk-modal-close" aria-label={ko ? "닫기" : "Close"}><X size={20} /></Dialog.Close></header>
            <ComponentPlayground key={selected} id={selected} ko={ko} options={configurations[selected]} onOptionsChange={next => configure(selected, next)} onCopied={() => noteCopy(selected)} />
          </>}
        </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  </div>;
}
