"use client";

import { useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Image as ImageIcon } from "lucide-react";
import { surfaceVars } from "@/lib/section-surface";
import type { CardItem, CardsConfig } from "@/lib/cards-config";
import { iconMap } from "./icons";

// Heading block shared by content sections: eyebrow, title, description and a "more" link.
export function SectionHeading({ eyebrow, title, desc, more, align }: { eyebrow: string; title: string; desc: string; more: string; align: "start" | "center" | "split" }) {
  if (!eyebrow && !title && !desc && !more) return null;
  return <div className="sc-head" data-align={align}>
    <div>{eyebrow && <span className="sc-eyebrow" data-edit="eyebrow">{eyebrow}</span>}{title && <h2 data-edit="title">{title}</h2>}{desc && <p data-edit="desc">{desc}</p>}</div>
    {more && <span className="sc-more" data-edit="more">{more}<ChevronRight size={16} /></span>}
  </div>;
}

const ratios: Record<CardsConfig["ratio"], string> = { "1:1": "1 / 1", "4:3": "4 / 3", "3:4": "3 / 4", "16:9": "16 / 9" };

export function CardsFrame({ config, mobile }: { config: CardsConfig; mobile: boolean }) {
  const [page, setPage] = useState(0);
  const cols = mobile ? (config.mobileMode === "two" ? 2 : 1) : config.variant === "list" || config.variant === "board" ? 1 : config.columns;
  // A slider shows a sliver of the next card; on a phone the swipe mode does the same.
  const swipe = config.variant === "slider" || (mobile && config.mobileMode === "swipe" && config.variant !== "board");
  const perView = swipe ? (mobile ? 1.15 : config.columns + .25) : cols;
  const pages = swipe ? Math.max(1, Math.ceil(config.items.length - Math.floor(perView) + 1)) : 1;
  const style = { ...surfaceVars("sc", config.surface, config.accent), "--sc-cols": cols, "--sc-gap": `${config.gap}px`, "--sc-radius": `${config.radius}px`, "--sc-ratio": ratios[config.ratio],
    "--sc-per": perView, "--sc-shift": page } as CSSProperties;
  const media = (item: CardItem, i: number) => {
    if (config.media === "none" || config.variant === "board" || config.variant === "stats") return null;
    if (config.media === "icon") { const Icon = item.icon ? iconMap[item.icon] : ChevronRight; return <i className="sc-icon" aria-hidden><Icon size={22} /></i>; }
    // eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop
    return <span className="sc-media" data-image-drop={`card:${i}`} data-edit={`card:${i}`}>{item.image ? <img src={item.image} alt="" draggable={false} /> : <ImageIcon size={20} />}</span>;
  };
  const card = (item: CardItem, i: number) => config.variant === "board"
    ? <li key={i} className="sc-row" data-edit={`card:${i}`}>{config.meta && <span className="sc-tag">{item.tag}</span>}<b>{item.title}</b><small>2026.10.{String(30 - i).padStart(2, "0")}</small><ChevronRight size={16} /></li>
    : <li key={i} className="sc-card" data-edit={`card:${i}`}>
      {config.variant === "stats" ? <strong className="sc-value">{item.value}</strong> : media(item, i)}
      <div className="sc-body">{config.meta && config.variant !== "stats" && item.tag && <span className="sc-tag">{item.tag}</span>}<b>{item.title}</b>{item.text && <p>{item.text}</p>}
        {config.meta && config.variant !== "stats" && <small>2026.10.{String(30 - i).padStart(2, "0")}</small>}</div>
    </li>;

  return <section className="sc" data-edit="frame" data-variant={config.variant} data-media={config.media} data-card={config.card} data-hover={config.hover} data-mobile={mobile || undefined} data-swipe={swipe || undefined} style={style}>
    <SectionHeading eyebrow={config.eyebrow} title={config.title} desc={config.desc} more={config.more} align={mobile && config.headAlign === "split" ? "start" : config.headAlign} />
    <div className="sc-viewport"><ul className="sc-list" data-edit="items">{config.items.map(card)}</ul></div>
    {swipe && <div className="sc-nav" data-edit="layout">
      {(config.nav === "dots" || config.nav === "both" || mobile) && <span className="sc-dots">{Array.from({ length: pages }, (_, i) => <i key={i} data-on={i === Math.min(page, pages - 1) || undefined} />)}</span>}
      {!mobile && (config.nav === "arrows" || config.nav === "both") && <span className="sc-arrows"><button type="button" aria-label="이전 카드" disabled={page === 0} onClick={e => { e.stopPropagation(); setPage(Math.max(0, page - 1)); }}><ArrowLeft size={16} /></button>
        <button type="button" aria-label="다음 카드" disabled={page >= pages - 1} onClick={e => { e.stopPropagation(); setPage(Math.min(pages - 1, page + 1)); }}><ArrowRight size={16} /></button></span>}
    </div>}
  </section>;
}
