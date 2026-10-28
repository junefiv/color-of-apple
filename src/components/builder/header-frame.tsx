"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { ChevronDown, Globe, Menu, Minus, Plus, Search, X } from "lucide-react";
import { headerColorVars, type HeaderConfig } from "@/lib/header-config";

const stop = (e: MouseEvent) => e.stopPropagation();

export function HeaderFrame({ config, mobile, preview }: { config: HeaderConfig; mobile: boolean; preview: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [sitemap, setSitemap] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(0);
  const firstWithChildren = config.items.findIndex(item => item.children.length > 0);
  const hasSub = !mobile && config.submenu !== "none" && config.arrangement !== "minimal";
  // The settings toggle pins the first menu open so the panel can be styled without hovering.
  const open = hasSub ? hovered ?? (preview && firstWithChildren >= 0 ? firstWithChildren : null) : null;
  const openItem = open === null ? undefined : config.items[open];
  const showPanel = !!openItem && openItem.children.length > 0;
  const raised = showPanel || sitemap || (mobile && menuOpen);
  const vars = headerColorVars(config) as CSSProperties;
  const burger = mobile || config.arrangement === "minimal" || config.sitemap;

  const logo = <span className={`hd-logo hd-logo-${config.logo}`}>{config.logo === "symbol" && <i aria-hidden />}{config.logo === "slot" ? "로고" : config.logoText || "Brand"}</span>;
  const actions = <div className="hd-actions">
    {!mobile && config.language && <span className="hd-util"><Globe size={15} />KOR</span>}
    {!mobile && config.login && <span className="hd-util">로그인</span>}
    {config.search && <button type="button" aria-label="검색" onClick={stop}><Search size={mobile ? 20 : 17} /></button>}
    {!mobile && config.cta && <span className="hd-cta">{config.cta}</span>}
    {burger && <button type="button" aria-label={mobile ? (menuOpen ? "모바일 메뉴 닫기" : "모바일 메뉴 열기") : sitemap ? "전체 메뉴 닫기" : "전체 메뉴 열기"} aria-expanded={mobile ? menuOpen : sitemap}
      onClick={e => { stop(e); if (mobile) setMenuOpen(!menuOpen); else { setSitemap(!sitemap); setHovered(null); } }}>{(mobile ? menuOpen : sitemap) ? <X size={22} /> : <Menu size={22} />}</button>}
  </div>;
  const nav = !mobile && config.arrangement !== "minimal" && <nav aria-label="헤더 메뉴"><ul className="hd-nav">{config.items.map((item, i) => <li key={i} data-open={open === i || undefined}
    onMouseEnter={() => { if (config.trigger === "hover" && hasSub) setHovered(i); }}>
    <button type="button" aria-current={i === 0 ? "page" : undefined} aria-expanded={hasSub && item.children.length ? open === i : undefined}
      onClick={e => { stop(e); if (config.trigger === "click" && hasSub) setHovered(hovered === i ? null : i); }}>{item.label}{config.trigger === "click" && hasSub && item.children.length > 0 && <ChevronDown size={13} />}</button>
    {config.submenu === "dropdown" && open === i && item.children.length > 0 && <ul className="hd-drop">{item.children.map((child, j) => <li key={j}>{child}</li>)}</ul>}
    {config.submenu === "all" && open !== null && <ul className="hd-all">{item.children.map((child, j) => <li key={j}>{child}</li>)}</ul>}
  </li>)}</ul></nav>;

  return <div className="hd" data-arrangement={config.arrangement} data-submenu={config.submenu} data-surface={config.surface} data-active={config.active} data-divider={config.divider || undefined} data-raised={raised || undefined} data-mobile={mobile || undefined} data-mobile-logo={config.mobileLogo}
    style={vars} onMouseLeave={() => { if (config.trigger === "hover") setHovered(null); }}>
    <div className="hd-backdrop" aria-hidden>{config.surface === "transparent" && !raised && <span>히어로 이미지 위에 놓이는 투명 헤더</span>}</div>
    {config.topBar && !mobile && <div className="hd-top"><span>새 소식을 확인하세요</span><span>고객센터 · 로그인 · 회원가입 · ENG</span></div>}
    {config.arrangement === "stacked" && !mobile ? <div className="hd-stack"><div className="hd-row">{logo}{actions}</div>{nav}</div>
      : <div className="hd-row">{config.arrangement === "logo-center" && !mobile ? <>{nav}{logo}{actions}</> : <>{logo}{nav}{actions}</>}</div>}
    {config.submenu === "all" && open !== null && <div className="hd-all-bg" aria-hidden />}
    {showPanel && config.submenu === "panel" && <div className="hd-panel"><strong>{openItem.label}</strong><ul>{openItem.children.map((child, j) => <li key={j}>{child}</li>)}</ul></div>}
    {showPanel && config.submenu === "bar" && <ul className="hd-bar">{openItem.children.map((child, j) => <li key={j}>{child}</li>)}</ul>}
    {sitemap && !mobile && <div className="hd-sitemap">{config.items.map((item, i) => <div key={i}><strong>{item.label}</strong><ul>{item.children.map((child, j) => <li key={j}>{child}</li>)}</ul></div>)}</div>}
    {mobile && menuOpen && <MobileMenu config={config} expanded={expanded} onExpand={setExpanded} onClose={() => setMenuOpen(false)} />}
  </div>;
}

function MobileMenu({ config, expanded, onExpand, onClose }: { config: HeaderConfig; expanded: number; onExpand: (i: number) => void; onClose: () => void }) {
  const mode = config.mobileMenu;
  if (mode === "split") {
    const current = config.items[expanded] ?? config.items[0];
    return <div className="hd-m hd-m-split" onClick={stop}><div className="hd-m-head"><strong>메뉴</strong><button type="button" aria-label="펼친 메뉴 닫기" onClick={onClose}><X size={20} /></button></div>
      <div className="hd-m-split-body"><ul className="hd-m-tabs">{config.items.map((item, i) => <li key={i}><button type="button" aria-pressed={i === expanded} onClick={() => onExpand(i)}>{item.label}</button></li>)}</ul>
        <ul className="hd-m-list">{(current?.children.length ? current.children : [current?.label ?? ""]).map((child, j) => <li key={j}>{child}</li>)}</ul></div></div>;
  }
  const list = <ul className="hd-m-accordion">{config.items.map((item, i) => <li key={i}><button type="button" aria-expanded={item.children.length ? expanded === i : undefined} onClick={() => item.children.length ? onExpand(expanded === i ? -1 : i) : onClose()}>
    {item.label}{item.children.length > 0 && (expanded === i ? <Minus size={16} /> : <Plus size={16} />)}</button>
    {expanded === i && item.children.length > 0 && <ul>{item.children.map((child, j) => <li key={j}>{child}</li>)}</ul>}</li>)}</ul>;
  const foot = (config.login || config.language || config.cta) && <div className="hd-m-foot">{config.login && <span>로그인</span>}{config.language && <span>KOR / ENG</span>}{config.cta && <span className="hd-cta">{config.cta}</span>}</div>;
  if (mode === "drawer") return <div className="hd-m-scrim" onClick={e => { stop(e); onClose(); }}><div className="hd-m hd-m-drawer" onClick={stop}><div className="hd-m-head"><button type="button" aria-label="펼친 메뉴 닫기" onClick={onClose}><X size={20} /></button></div>{list}{foot}</div></div>;
  return <div className={`hd-m hd-m-${mode}`} onClick={stop}>{mode === "overlay" && <div className="hd-m-head"><strong>메뉴</strong><button type="button" aria-label="펼친 메뉴 닫기" onClick={onClose}><X size={20} /></button></div>}{list}{foot}</div>;
}
