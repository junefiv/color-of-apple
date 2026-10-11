"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import { useMatchuStore } from "@/lib/store";
import { COMPONENT_GROUPS, LIBRARY_ITEMS, type ComponentGroupId, type LibraryItemId } from "./catalog";
import { ComponentPlayground } from "./playground";
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
  const ko = useMatchuStore(state => state.locale) === "ko";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LibraryItemId | null>(null);
  const [category, setCategory] = useState<ComponentGroupId>("all");
  const [subcategory, setSubcategory] = useState("all");
  const filterId = useId();
  const container = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const back = useRef<HTMLButtonElement>(null);
  const listScroll = useRef(0);
  useEffect(() => {
    const sync = () => {
      const route = readUiKitLocation();
      const id = LIBRARY_ITEMS.find(item => item[0] === route.component)?.[0] ?? null;
      if (route.active && route.component && !id) navigateUiKit(undefined, true);
      setSelected(id);
      requestAnimationFrame(() => {
        if (id) { container.current?.scrollTo?.({ top: 0 }); back.current?.focus(); }
        else { container.current?.scrollTo?.({ top: listScroll.current }); returnFocus.current?.focus(); }
      });
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
  const open = (id: LibraryItemId, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    listScroll.current = container.current?.scrollTop ?? 0;
    navigateUiKit(id);
  };
  const close = () => {
    setSelected(null);
    if (window.history.state?.coaUiKitParent === uiKitUrl()) window.history.back();
    else navigateUiKit(undefined, true);
    requestAnimationFrame(() => returnFocus.current?.focus());
  };
  const query = search.trim().toLowerCase();
  const group = COMPONENT_GROUPS.find(group => group.id === category)!;
  const groupItems: readonly LibraryItemId[] = group.items;
  const visible = LIBRARY_ITEMS.filter(([id, kr, en], i) => groupItems.includes(id) && (subcategory === "all" || subcategory === id) && `${id} ${kr} ${en} ${i + 1}`.toLowerCase().includes(query));
  const subcategories = [{ id: "all", label: "All" }, ...groupItems.map(id => ({ id, label: LIBRARY_ITEMS.find(item => item[0] === id)![2] }))];
  return <div ref={container} className="library-kit" data-detail={Boolean(selected)} onKeyDown={event => {
    if (selected && event.key === "Escape" && !event.defaultPrevented && !container.current?.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) close();
  }}>
    <header className="lk-catalog-heading"><div><span className="lk-eyebrow">COLOR OF APPLE / UI KIT</span><h3>{ko ? "컴포넌트" : "Components"}<small>{ko ? `${LIBRARY_ITEMS.length}가지 컴포넌트` : `${LIBRARY_ITEMS.length} components`}</small></h3></div>
      {!selected && <label className="lk-catalog-search"><Search size={16} aria-hidden /><input type="search" aria-label={ko ? "컴포넌트 찾기" : "Find a component"} placeholder={ko ? "컴포넌트 찾기" : "Find a component"} value={search} onChange={event => setSearch(event.target.value)} /><span>{visible.length}/{LIBRARY_ITEMS.length}</span></label>}
    </header>
    {!selected && <nav className="lk-catalog-filters" aria-label={ko ? "컴포넌트 분류" : "Component filters"}>
      <FilterTabs prefix={`${filterId}-category`} panel={`${filterId}-panel`} label={ko ? "컴포넌트 그룹" : "Component groups"} options={COMPONENT_GROUPS.map(group => ({ id: group.id, label: group.label, count: group.items.length }))} value={category} onChange={value => { setCategory(value as ComponentGroupId); setSubcategory("all"); }} />
      {category !== "all" && <FilterTabs prefix={`${filterId}-type`} panel={`${filterId}-panel`} label={`${group.label} ${ko ? "컴포넌트 종류" : "component types"}`} options={subcategories} value={subcategory} onChange={setSubcategory} secondary />}
    </nav>}
    {selected && <button ref={back} type="button" className="lk-back" onClick={close}><ArrowLeft size={16} aria-hidden />{ko ? "전체 컴포넌트" : "All components"}</button>}
    <div className="lk-catalog-grid" id={`${filterId}-panel`} role={selected ? undefined : "tabpanel"} aria-labelledby={selected ? undefined : category === "all" ? `${filterId}-category-all` : `${filterId}-type-${subcategory}`}>{LIBRARY_ITEMS.map(([id, kr, en]) => <article hidden={selected ? selected !== id : !visible.some(item => item[0] === id)} key={id} className="lk-example" data-component={id} data-expanded={selected === id}>
      {selected === id && <header className="lk-example-heading"><h4>{ko ? kr : en}</h4><small>{en}</small></header>}
      <ComponentPlayground id={id} ko={ko} compact={selected !== id} />
      {selected !== id && <footer className="lk-card-footer"><span>{ko ? kr : en}</span><small>{en}</small><button type="button" className="lk-detail-link" title={ko ? `${kr} 상세보기` : `View ${en}`} aria-label={ko ? `${kr} 상세보기` : `View ${en}`} onClick={event => open(id, event.currentTarget)}><ArrowUpRight size={16} aria-hidden /></button></footer>}
    </article>)}</div>
    {!selected && visible.length === 0 && <p className="lk-empty" role="status">{ko ? "일치하는 컴포넌트가 없어요." : "No matching components."}</p>}
  </div>;
}
