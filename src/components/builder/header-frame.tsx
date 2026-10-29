"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { headerTexts, tx } from "@/lib/component-texts";
import { ArrowRight, ChevronDown, ChevronRight, Globe, Image as ImageIcon, Menu, Minus, Plus, Search, X } from "lucide-react";
import { iconMap as icons } from "./icons";
import { headerColorVars, type HeaderConfig, type HeaderMenuItem, type HeaderSubItem } from "@/lib/header-config";

const stop = (e: MouseEvent) => e.stopPropagation();
// Frames that need room of their own: beside a sidebar they open as a flyout instead of an accordion.
const panelFrames = new Set<HeaderConfig["submenu"]>(["panel", "mega", "tabs", "cards", "side"]);

export function HeaderFrame({ config, mobile, preview }: { config: HeaderConfig; mobile: boolean; preview: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const [sitemap, setSitemap] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(0);
  const side = !mobile && config.placement !== "top";
  const firstWithChildren = config.items.findIndex(item => item.children.length > 0);
  const hasSub = !mobile && config.submenu !== "none" && (side || config.arrangement !== "minimal");
  // The settings toggle pins the first menu open so the panel can be styled without hovering.
  const open = hasSub ? hovered ?? (preview && firstWithChildren >= 0 ? firstWithChildren : null) : null;
  const openItem = open === null ? undefined : config.items[open];
  const showPanel = !!openItem && openItem.children.length > 0;
  const flyout = side && panelFrames.has(config.submenu);
  const raised = showPanel || sitemap || (mobile && menuOpen);
  const vars = headerColorVars(config) as CSSProperties;
  const burger = !side && (mobile || config.arrangement === "minimal" || config.sitemap);
  const openAt = (i: number | null) => { setHovered(i); setTab(0); };

  const logoImage = config.logo === "slot" && config.logoImage;
  // eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop
  const logo = <span className={`hd-logo hd-logo-${config.logo}`} data-edit="logo" data-image-drop="logo" data-filled={logoImage ? true : undefined}>{config.logo === "symbol" && <i aria-hidden />}{logoImage ? <img src={logoImage} alt={config.logoText || "로고"} draggable={false} /> : config.logo === "slot" ? "로고" : config.logoText || "Brand"}</span>;
  const actions = <div className="hd-actions" data-edit="utility">
    {!mobile && config.language && <span className="hd-util"><Globe size={15} />{tx(config.texts, headerTexts, "language")}</span>}
    {!mobile && config.login && <span className="hd-util">{tx(config.texts, headerTexts, "login")}</span>}
    {config.search && <button type="button" aria-label="검색" onClick={stop}><Search size={mobile ? 20 : 17} /></button>}
    {!mobile && config.cta && <span className="hd-cta" data-edit="cta">{config.cta}</span>}
    {burger && <button type="button" aria-label={mobile ? (menuOpen ? "모바일 메뉴 닫기" : "모바일 메뉴 열기") : sitemap ? "전체 메뉴 닫기" : "전체 메뉴 열기"} aria-expanded={mobile ? menuOpen : sitemap}
      onClick={e => { stop(e); if (mobile) setMenuOpen(!menuOpen); else { setSitemap(!sitemap); setHovered(null); } }}>{(mobile ? menuOpen : sitemap) ? <X size={22} /> : <Menu size={22} />}</button>}
  </div>;
  const itemButton = (item: HeaderMenuItem, i: number, chevron: ReactNode) => <button type="button" aria-current={i === 0 ? "page" : undefined} aria-expanded={hasSub && item.children.length ? open === i : undefined}
    onClick={e => { stop(e); if (config.trigger === "click" && hasSub) openAt(hovered === i ? null : i); }}>{item.label}{hasSub && item.children.length > 0 && chevron}</button>;
  const hover = (i: number) => () => { if (config.trigger === "hover" && hasSub) openAt(i); };
  const panel = showPanel && <SubPanel config={config} item={openItem} tab={tab} onTab={setTab} />;
  const dim = config.dim && (showPanel || sitemap) && <div className="hd-dim" aria-hidden />;

  if (side) return <div className="hd hd-side" data-edit="frame" data-placement={config.placement} data-submenu={config.submenu} data-surface={config.surface} data-active={config.active} data-motion={config.motion} data-divider={config.divider || undefined} data-raised={raised || undefined}
    style={vars} onMouseLeave={() => { if (config.trigger === "hover") setHovered(null); }}>
    <div className="hd-backdrop" aria-hidden />
    <div className="hd-side-head">{logo}</div>
    <nav aria-label="사이드 메뉴" data-edit="menu"><ul className="hd-snav">{config.items.map((item, i) => <li key={i} data-open={open === i || undefined} onMouseEnter={hover(i)}>
      {itemButton(item, i, flyout ? <ChevronRight size={14} /> : <ChevronDown size={14} />)}
      {!flyout && open === i && item.children.length > 0 && <ul className="hd-sacc hd-anim">{item.children.map((child, j) => <li key={j}><SubLink child={child} style={config.subStyle} /><Depth3 items={child.items} /></li>)}</ul>}
    </li>)}</ul></nav>
    <div className="hd-side-foot">{actions}</div>
    {dim}
    {flyout && panel && <div className="hd-fly hd-anim" data-kind={config.submenu}>{panel}</div>}
  </div>;

  const nav = !mobile && config.arrangement !== "minimal" && <nav aria-label="헤더 메뉴" data-edit="menu"><ul className="hd-nav">{config.items.map((item, i) => <li key={i} data-open={open === i || undefined} onMouseEnter={hover(i)}>
    {itemButton(item, i, config.trigger === "click" ? <ChevronDown size={13} /> : null)}
    {(config.submenu === "dropdown" || config.submenu === "bubble") && open === i && item.children.length > 0 && <ul className="hd-drop hd-anim" data-bubble={config.submenu === "bubble" || undefined} data-style={config.subStyle}>{item.children.map((child, j) => <li key={j}><SubLink child={child} style={config.subStyle} /></li>)}</ul>}
    {config.submenu === "all" && open !== null && <ul className="hd-all hd-anim">{item.children.map((child, j) => <li key={j}><SubLink child={child} style={config.subStyle} /><Depth3 items={child.items} /></li>)}</ul>}
  </li>)}</ul></nav>;

  return <div className="hd" data-edit="frame" data-arrangement={config.arrangement} data-submenu={config.submenu} data-surface={config.surface} data-active={config.active} data-motion={config.motion} data-divider={config.divider || undefined} data-raised={raised || undefined} data-mobile={mobile || undefined} data-mobile-logo={config.mobileLogo}
    style={vars} onMouseLeave={() => { if (config.trigger === "hover") setHovered(null); }}>
    <div className="hd-backdrop" aria-hidden>{config.surface === "transparent" && !raised && <span>히어로 이미지 위에 놓이는 투명 헤더</span>}</div>
    {config.topBar && !mobile && <div className="hd-top" data-edit="utility"><span>{tx(config.texts, headerTexts, "topLeft")}</span><span>{tx(config.texts, headerTexts, "topRight")}</span></div>}
    {config.arrangement === "stacked" && !mobile ? <div className="hd-stack"><div className="hd-row">{logo}{actions}</div>{nav}</div>
      : <div className="hd-row">{config.arrangement === "logo-center" && !mobile ? <>{nav}{logo}{actions}</> : <>{logo}{nav}{actions}</>}</div>}
    {dim}
    {config.submenu === "all" && open !== null && <div className="hd-all-bg hd-anim" aria-hidden />}
    {panel && config.submenu === "side" && <div className="hd-drawer hd-anim">{panel}</div>}
    {panel && panelFrames.has(config.submenu) && config.submenu !== "side" && <div className="hd-panel hd-anim" data-kind={config.submenu} data-promo={config.promo || undefined}>{panel}</div>}
    {showPanel && config.submenu === "bar" && <ul className="hd-bar hd-anim">{openItem.children.map((child, j) => <li key={j}><SubLink child={child} style="text" /></li>)}</ul>}
    {sitemap && !mobile && <div className="hd-sitemap hd-anim">{config.items.map((item, i) => <div key={i}><strong>{item.label}</strong><ul>{item.children.map((child, j) => <li key={j}>{child.label}</li>)}</ul></div>)}</div>}
    {mobile && menuOpen && <MobileMenu config={config} expanded={expanded} onExpand={setExpanded} onClose={() => setMenuOpen(false)} />}
  </div>;
}

function SubLink({ child, style }: { child: HeaderSubItem; style: HeaderConfig["subStyle"] }) {
  const Icon = child.icon ? icons[child.icon] : ChevronRight;
  return <span className="hd-sub" data-style={style}>
    {style === "desc" && <i className="hd-sub-icon" aria-hidden><Icon size={16} /></i>}
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL picked in settings */}
    {style === "thumb" && <i className="hd-sub-thumb" aria-hidden>{child.image ? <img src={child.image} alt="" /> : <ImageIcon size={14} />}</i>}
    <span className="hd-sub-text"><b>{child.label}{child.badge && <em>{child.badge}</em>}</b>{style !== "text" && child.desc && <small>{child.desc}</small>}</span>
  </span>;
}

function Depth3({ items }: { items: string[] }) {
  return items.length > 0 ? <ul className="hd-d3">{items.map((item, k) => <li key={k}>{item}</li>)}</ul> : null;
}

function Promo({ config }: { config: HeaderConfig }) {
  return <aside className="hd-promo" data-edit="promo" data-image-drop="promo">
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
    <span className="hd-promo-art">{config.promoImage ? <img src={config.promoImage} alt="" draggable={false} /> : <ImageIcon size={18} />}</span>
    <strong>{config.promoTitle}</strong>{config.promoText && <small>{config.promoText}</small>}
    {config.promoCta && <span className="hd-promo-cta">{config.promoCta}<ArrowRight size={13} /></span>}
  </aside>;
}

// The content of the wide frames, shared by the top bar's panels and a sidebar's flyout.
function SubPanel({ config, item, tab, onTab }: { config: HeaderConfig; item: HeaderMenuItem; tab: number; onTab: (i: number) => void }) {
  const style = config.subStyle;
  const promo = config.promo && <Promo config={config} />;
  if (config.submenu === "mega") return <><div className="hd-mega">{item.children.map((child, j) => <div key={j}><SubLink child={child} style={style} /><Depth3 items={child.items} /></div>)}</div>{promo}</>;
  if (config.submenu === "tabs") {
    const current = item.children[tab] ?? item.children[0];
    return <><ul className="hd-tabs">{item.children.map((child, j) => <li key={j} data-on={j === tab || undefined} onMouseEnter={() => onTab(j)} onClick={e => { stop(e); onTab(j); }}><SubLink child={child} style={style} /><ChevronRight size={14} /></li>)}</ul>
      <div className="hd-tab-body"><strong>{current.label}</strong>{current.desc && <p>{current.desc}</p>}<ul>{(current.items.length ? current.items : [`${current.label} 바로가기`]).map((entry, k) => <li key={k}>{entry}</li>)}</ul></div>{promo}</>;
  }
  if (config.submenu === "cards") return <ul className="hd-cards">{item.children.map((child, j) => <li key={j}>
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL picked in settings */}
    <span className="hd-card-art">{child.image ? <img src={child.image} alt="" /> : <ImageIcon size={20} />}</span><b>{child.label}{child.badge && <em>{child.badge}</em>}</b>{child.desc && <small>{child.desc}</small>}</li>)}</ul>;
  if (config.submenu === "side") return <><strong className="hd-drawer-title">{item.label}</strong><ul className="hd-drawer-list">{item.children.map((child, j) => <li key={j}><SubLink child={child} style={style} /><Depth3 items={child.items} /></li>)}</ul>{promo}</>;
  return <><strong>{item.label}</strong><ul>{item.children.map((child, j) => <li key={j}><SubLink child={child} style={style} /></li>)}</ul>{promo}</>;
}

function MobileMenu({ config, expanded, onExpand, onClose }: { config: HeaderConfig; expanded: number; onExpand: (i: number) => void; onClose: () => void }) {
  const mode = config.mobileMenu;
  if (mode === "split") {
    const current = config.items[expanded] ?? config.items[0];
    return <div className="hd-m hd-m-split" onClick={stop}><div className="hd-m-head"><strong>{tx(config.texts, headerTexts, "menuTitle")}</strong><button type="button" aria-label="펼친 메뉴 닫기" onClick={onClose}><X size={20} /></button></div>
      <div className="hd-m-split-body"><ul className="hd-m-tabs">{config.items.map((item, i) => <li key={i}><button type="button" aria-pressed={i === expanded} onClick={() => onExpand(i)}>{item.label}</button></li>)}</ul>
        <ul className="hd-m-list">{(current?.children.length ? current.children.map(child => child.label) : [current?.label ?? ""]).map((child, j) => <li key={j}>{child}</li>)}</ul></div></div>;
  }
  const list = <ul className="hd-m-accordion">{config.items.map((item, i) => <li key={i}><button type="button" aria-expanded={item.children.length ? expanded === i : undefined} onClick={() => item.children.length ? onExpand(expanded === i ? -1 : i) : onClose()}>
    {item.label}{item.children.length > 0 && (expanded === i ? <Minus size={16} /> : <Plus size={16} />)}</button>
    {expanded === i && item.children.length > 0 && <ul>{item.children.map((child, j) => <li key={j}>{child.label}</li>)}</ul>}</li>)}</ul>;
  const foot = (config.login || config.language || config.cta) && <div className="hd-m-foot">{config.login && <span>{tx(config.texts, headerTexts, "login")}</span>}{config.language && <span>{tx(config.texts, headerTexts, "mobileLanguage")}</span>}{config.cta && <span className="hd-cta">{config.cta}</span>}</div>;
  if (mode === "drawer") return <div className="hd-m-scrim" onClick={e => { stop(e); onClose(); }}><div className="hd-m hd-m-drawer" onClick={stop}><div className="hd-m-head"><button type="button" aria-label="펼친 메뉴 닫기" onClick={onClose}><X size={20} /></button></div>{list}{foot}</div></div>;
  return <div className={`hd-m hd-m-${mode}`} onClick={stop}>{mode === "overlay" && <div className="hd-m-head"><strong>{tx(config.texts, headerTexts, "menuTitle")}</strong><button type="button" aria-label="펼친 메뉴 닫기" onClick={onClose}><X size={20} /></button></div>}{list}{foot}</div>;
}
