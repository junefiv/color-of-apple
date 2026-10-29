"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Bell, ChevronDown, ChevronLeft, ChevronRight, Download, Image as ImageIcon, MapPin, Menu, Minus, Paperclip, Play, Plus, Search, SlidersHorizontal, Smartphone, X } from "lucide-react";
import type { Config } from "@/lib/block-schema";
import type { HeaderIcon } from "@/lib/header-config";
import { surfaceVars, type SectionSurface } from "@/lib/section-surface";
import { SectionHeading } from "./cards-frame";
import { iconMap } from "./icons";

// Preview frames for the schema-described blocks (src/lib/blocks.ts). data-edit marks the key a click
// should edit; data-image-drop="img:<path>" marks where a dropped image file is written.
const S = (v: unknown) => typeof v === "string" ? v : "";
const N = (v: unknown) => typeof v === "number" ? v : 0;
const L = (v: unknown) => (Array.isArray(v) ? v : []) as Config[];
const ratios: Record<string, string> = { "4:3": "4 / 3", "1:1": "1 / 1", "3:4": "3 / 4", "16:9": "16 / 9" };
const Icon = ({ name, size = 20 }: { name: unknown; size?: number }) => { const I = iconMap[S(name) as Exclude<HeaderIcon, "">] ?? ChevronRight; return <I size={size} />; };

function Media({ src, slot, ratio, label = "이미지를 끌어다 놓으세요", className = "" }: { src: unknown; slot: string; ratio?: string; label?: string; className?: string }) {
  const edit = slot.split(":").slice(0, 2).join(":");
  // eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop
  return <span className={`bk-media ${className}`} data-image-drop={`img:${slot}`} data-edit={edit} style={ratio ? { aspectRatio: ratio } : undefined}>{S(src) ? <img src={S(src)} alt="" draggable={false} /> : <><ImageIcon size={20} /><small>{label}</small></>}</span>;
}
const Head = ({ c, align = "start" }: { c: Config; align?: "start" | "center" | "split" }) => <SectionHeading eyebrow={S(c.eyebrow)} title={S(c.title)} desc={S(c.desc)} more={S(c.more)} align={align} />;
const Btn = ({ children, ghost, edit }: { children: ReactNode; ghost?: boolean; edit?: string }) => <span className={`bk-btn${ghost ? " bk-ghost" : ""}`} data-edit={edit}>{children}</span>;

export function BlockFrame({ kind, config: c, mobile: m }: { kind: string; config: Config; mobile: boolean }) {
  const style = { ...surfaceVars("bk", S(c.surface) as SectionSurface || "surface", (S(c.accent) || "primary") as "primary"), "--bk-radius": `${N(c.radius)}px` } as CSSProperties;
  const overlay = ["popup", "intro", "consent", "progress", "sheet", "toast"].includes(kind);
  const body = BODIES[kind]?.(c, m);
  return overlay ? <div className="bk-ov" data-kind={kind} data-mobile={m || undefined} style={style}>{body}</div>
    : <section className="bk" data-kind={kind} data-mobile={m || undefined} style={style}>{body}</section>;
}

function Tabs({ c, m }: { c: Config; m: boolean }) {
  const [active, setActive] = useState(0);
  const items = L(c.items), i = Math.min(active, items.length - 1), cur = items[i] ?? {};
  const panel = (item: Config, k: number) => <div className="bk-tabpanel" data-panel={S(c.panel)}>{S(c.panel) !== "text" && <Media src={item.image} slot={`items:${k}:image`} ratio="16 / 10" />}
    {S(c.panel) !== "image" && <div className="bk-copy"><h3>{S(item.title)}</h3><p>{S(item.body)}</p></div>}</div>;
  if (m && c.mobile === "accordion") return <><Head c={c} /><ul className="bk-acc">{items.map((item, k) => <li key={k} data-open={k === i || undefined} data-edit={`items:${k}`}>
    <button type="button" onClick={e => { e.stopPropagation(); setActive(k); }}>{S(item.label)}{k === i ? <Minus size={16} /> : <Plus size={16} />}</button>{k === i && panel(item, k)}</li>)}</ul></>;
  return <><Head c={c} align={c.tabAlign === "center" ? "center" : "start"} />
    <div className="bk-tabs" data-style={S(c.tabStyle)} data-align={S(c.tabAlign)}>
      <div className="bk-tablist" role="tablist">{items.map((item, k) => <button key={k} type="button" role="tab" aria-selected={k === i} data-edit={`items:${k}`} onClick={() => setActive(k)}>{S(item.label)}</button>)}</div>
      {panel(cur, i)}
    </div></>;
}

function Faq({ c }: { c: Config }) {
  const [open, setOpen] = useState(c.firstOpen ? 0 : -1);
  return <div className="bk-faq" data-layout={S(c.layout)} data-style={S(c.style)}>
    <Head c={c} align={c.layout === "split" ? "start" : "center"} />
    <ul className="bk-faq-list">{L(c.items).map((item, i) => <li key={i} data-open={open === i || undefined} data-edit={`items:${i}`}>
      <button type="button" onClick={() => setOpen(open === i ? -1 : i)}>{c.style === "numbered" && <b>Q{i + 1}</b>}<span>{S(item.q)}</span>{c.icon === "plus" ? (open === i ? <Minus size={18} /> : <Plus size={18} />) : <ChevronDown size={18} />}</button>
      {open === i && <p>{S(item.a)}</p>}</li>)}</ul>
  </div>;
}

function Product({ c }: { c: Config }) {
  const [cur, setCur] = useState(0);
  const images = L(c.images), i = Math.min(cur, images.length - 1);
  return <div className="bk-product" data-layout={S(c.layout)}>
    <div className="bk-gallery" data-thumbs={S(c.thumbs)}>
      <Media src={images[i]?.image} slot={`images:${i}:image`} ratio={c.layout === "top" ? "21 / 9" : "1 / 1"} className="bk-gallery-main" />
      {c.thumbs !== "none" && images.length > 1 && <div className="bk-thumbs">{images.map((im, k) => <button key={k} type="button" data-on={k === i || undefined} onClick={() => setCur(k)}><Media src={im.image} slot={`images:${k}:image`} ratio="1 / 1" label="" /></button>)}</div>}
    </div>
    <div className="bk-product-info">
      {S(c.category) && <span className="bk-eyebrow" data-edit="category">{S(c.category)}</span>}<h1 data-edit="title">{S(c.title)}</h1><p data-edit="desc">{S(c.desc)}</p>
      {S(c.price) && <strong className="bk-price" data-edit="price">{S(c.price)}</strong>}
      {(S(c.primary) || S(c.secondary)) && <div className="bk-actions">{S(c.primary) && <Btn edit="primary">{S(c.primary)}</Btn>}{S(c.secondary) && <Btn ghost edit="secondary">{S(c.secondary)}</Btn>}</div>}
      {L(c.specs).length > 0 && <dl className="bk-specs">{L(c.specs).map((sp, k) => <div key={k} data-edit={`specs:${k}`}><dt>{S(sp.label)}</dt><dd>{S(sp.value)}</dd></div>)}</dl>}
    </div>
  </div>;
}

const BODIES: Record<string, (c: Config, m: boolean) => ReactNode> = {
  split: (c, m) => <div className="bk-split" data-ratio={S(c.ratio)} data-align={S(c.align)} data-boxed={c.boxed || undefined} style={{ gap: m ? N(c.gap) / 2 : N(c.gap) }}>
    {L(c.rows).map((r, i) => {
      const right = (c.side === "right") !== Boolean(c.alternate && i % 2);
      return <div key={i} className="bk-split-row" data-media-right={right || undefined} data-media-first={c.mobileMediaFirst || undefined} data-edit={`rows:${i}`}>
        <Media src={r.image} slot={`rows:${i}:image`} ratio={ratios[S(c.mediaRatio)]} />
        <div className="bk-copy">{S(r.eyebrow) && <span className="bk-eyebrow">{S(r.eyebrow)}</span>}<h3>{S(r.title)}</h3><p>{S(r.body)}</p>{S(r.cta) && <span className="bk-link">{S(r.cta)}<ArrowRight size={16} /></span>}</div>
      </div>;
    })}</div>,

  marquee: (c, m) => {
    const sep = ({ dot: "●", star: "✦", slash: "/", none: "" } as Record<string, string>)[S(c.separator)] ?? "";
    const row = (reverse: boolean) => <div className="bk-mq-row" data-reverse={reverse || undefined}><div className="bk-mq-track" style={{ animationDuration: `${N(c.speed)}s` }}>
      {[0, 1].map(k => <span key={k} className="bk-mq-set" aria-hidden={k === 1 || undefined}>{L(c.items).map((item, i) => <span key={i} className="bk-mq-item" data-edit={`items:${i}`} data-image-drop={c.kind === "logo" ? `img:items:${i}:image` : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
        {c.kind === "logo" && S(item.image) ? <img src={S(item.image)} alt={S(item.text)} draggable={false} /> : S(item.text)}{sep && <i aria-hidden>{sep}</i>}</span>)}</span>)}</div></div>;
    return <div className="bk-mq" data-kind={S(c.kind)} data-outline={c.outline || undefined} data-fade={c.fade || undefined} style={{ "--mq-size": `${m ? Math.max(14, N(c.size) * .55) : N(c.size)}px` } as CSSProperties}>
      {(S(c.eyebrow) || S(c.title)) && <div className="bk-mq-head">{S(c.eyebrow) && <span className="bk-eyebrow" data-edit="eyebrow">{S(c.eyebrow)}</span>}{S(c.title) && <b data-edit="title">{S(c.title)}</b>}</div>}
      {row(c.direction === "right")}{c.rows === "2" && row(c.direction !== "right")}</div>;
  },

  subhero: (c, m) => <div className="bk-sub" data-bg={S(c.bg)} data-align={S(c.align)} style={{ minHeight: N(c.height) * (m ? .62 : 1) }}>
    {c.bg === "image" && <Media src={c.image} slot="image" className="bk-sub-bg" label="배경 이미지를 끌어다 놓으세요" />}
    <div className="bk-sub-copy">
      {Boolean(c.crumbs) && <span className="bk-crumbs" data-edit="path">{S(c.path).split(">").map((p, i, all) => <span key={i}>{p.trim()}{i < all.length - 1 && <ChevronRight size={13} />}</span>)}</span>}
      <h1 data-edit="title">{S(c.title)}</h1>{S(c.desc) && <p data-edit="desc">{S(c.desc)}</p>}
    </div>
    {Boolean(c.showTabs) && L(c.tabs).length > 0 && <nav className="bk-sub-tabs" data-style={S(c.tabStyle)}>{L(c.tabs).map((tab, i) => <span key={i} data-on={i === 1 || undefined} data-edit={`tabs:${i}`}>{S(tab.label)}</span>)}</nav>}
  </div>,

  tabs: (c, m) => <Tabs c={c} m={m} />,

  video: (c, m) => {
    const copy = <div className="bk-copy">{S(c.eyebrow) && <span className="bk-eyebrow" data-edit="eyebrow">{S(c.eyebrow)}</span>}<h2 data-edit="title">{S(c.title)}</h2>{S(c.desc) && <p data-edit="desc">{S(c.desc)}</p>}{S(c.cta) && <Btn edit="cta">{S(c.cta)}</Btn>}</div>;
    return <div className="bk-video" data-layout={S(c.layout)} data-align={S(c.align)}>
      {c.layout !== "full" && copy}
      <div className="bk-video-box" style={{ height: N(c.height) * (m ? .5 : 1) }}>
        <Media src={c.poster} slot="poster" label="포스터 이미지를 끌어다 놓으세요" className="bk-video-poster" />
        {Boolean(c.scrim) && <i className="bk-scrim" aria-hidden />}
        {c.layout === "full" && copy}
        {c.play === "none" ? <span className="bk-autoplay">● 자동재생</span> : <span className="bk-play" data-play={S(c.play)}><Play size={c.play === "pill" ? 16 : 26} fill="currentColor" />{c.play === "pill" && "영상 보기"}</span>}
      </div>
    </div>;
  },

  form: c => <div className="bk-form" data-layout={S(c.layout)} data-field-style={S(c.fieldStyle)} data-card={c.card || undefined}>
    <Head c={c} align={c.layout === "split" ? "start" : c.card ? "center" : "start"} />
    <div className="bk-form-body" data-two={c.layout === "two" || undefined}>
      {L(c.fields).map((f, i) => {
        const type = S(f.type), options = S(f.options).split(",").map(o => o.trim()).filter(Boolean);
        const control = type === "chips" ? <span className="bk-chips">{options.map((o, k) => <span key={k} data-on={k === 0 || undefined}>{o}</span>)}</span>
          : type === "textarea" ? <span className="bk-input bk-textarea">{S(f.placeholder)}</span>
          : type === "file" ? <span className="bk-input bk-file"><Paperclip size={15} />파일을 끌어다 놓거나 선택하세요</span>
          : type === "select" ? <span className="bk-input">{S(f.placeholder) || options[0]}<ChevronDown size={16} /></span>
          : <span className="bk-input">{S(f.placeholder) || (type === "date" ? "YYYY. MM. DD" : "")}</span>;
        return <div key={i} className="bk-f" data-wide={["textarea", "chips", "file"].includes(type) || undefined} data-edit={`fields:${i}`}><span>{S(f.label)}{Boolean(f.required) && <em>*</em>}</span>{control}</div>;
      })}
      {c.consent !== "none" && <div className="bk-consent" data-edit="consent"><i className="bk-checkbox" aria-hidden />[필수] 개인정보 수집 및 이용에 동의합니다{c.consent === "expandable" && <u>내용 보기</u>}</div>}
      <span className="bk-btn bk-submit" data-width={S(c.submitWidth)} data-edit="submit">{S(c.submit)}<ArrowRight size={16} /></span>
    </div>
  </div>,

  faq: c => <Faq c={c} />,

  steps: c => <div className="bk-steps" data-variant={S(c.variant)} data-connector={c.connector || undefined}>
    <Head c={c} align={c.variant === "timeline" || c.variant === "years" ? "start" : "center"} />
    <ol className="bk-steps-list" style={{ "--steps": L(c.items).length } as CSSProperties}>{L(c.items).map((item, i) => <li key={i} data-edit={`items:${i}`}>
      {Boolean(c.icons) && S(item.icon) && c.variant !== "years" && <i className="bk-step-icon" aria-hidden><Icon name={item.icon} /></i>}
      <span className="bk-step-label">{S(item.label)}</span><b>{S(item.title)}</b><p>{S(item.body)}</p></li>)}</ol>
  </div>,

  board: (c, m) => {
    const cats = S(c.categories).split(",").map(x => x.trim()).filter(Boolean), items = L(c.items);
    const style = m && c.style === "table" ? "list" : S(c.style);
    return <div className="bk-board">
      <Head c={c} />
      {(cats.length > 0 || Boolean(c.search)) && <div className="bk-board-tools">{cats.length > 0 && <div className="bk-cats" data-edit="categories">{cats.map((x, i) => <span key={i} data-on={i === 0 || undefined}>{x}</span>)}</div>}
        {Boolean(c.search) && <span className="bk-board-search" data-edit="search">검색어를 입력하세요<Search size={16} /></span>}</div>}
      {style === "table" ? <div className="bk-board-table" data-edit="items"><div className="bk-bt-row bk-bt-head">{Boolean(c.number) && <span>번호</span>}<span className="bk-bt-title">제목</span><span>날짜</span>{Boolean(c.views) && <span>조회</span>}</div>
        {items.map((it, i) => <div key={i} className="bk-bt-row" data-edit={`items:${i}`}>{Boolean(c.number) && <span>{items.length - i}</span>}<span className="bk-bt-title"><em className="bk-tag">{S(it.tag)}</em>{S(it.title)}</span><span>{S(it.date)}</span>{Boolean(c.views) && <span>{120 + i * 37}</span>}</div>)}</div>
        : style === "gallery" ? <ul className="bk-board-gallery">{items.map((it, i) => <li key={i} data-edit={`items:${i}`}><Media src={it.image} slot={`items:${i}:image`} ratio="4 / 3" label="" /><em className="bk-tag">{S(it.tag)}</em><b>{S(it.title)}</b><small>{S(it.date)}</small></li>)}</ul>
        : <ul className="bk-board-list">{items.map((it, i) => <li key={i} data-edit={`items:${i}`}><em className="bk-tag">{S(it.tag)}</em><b>{S(it.title)}</b><small>{S(it.date)}</small><ChevronRight size={16} /></li>)}</ul>}
      {Boolean(c.pagination) && <div className="bk-pages" data-edit="pagination"><ChevronLeft size={16} />{[1, 2, 3, 4, 5].map(n => <span key={n} data-on={n === 1 || undefined}>{n}</span>)}<ChevronRight size={16} /></div>}
    </div>;
  },

  post: c => <article className="bk-post" style={{ maxWidth: N(c.width) }}>
    <header>{S(c.tag) && <span className="bk-tag" data-edit="tag">{S(c.tag)}</span>}<h1 data-edit="title">{S(c.title)}</h1><div className="bk-post-meta" data-edit="date">{S(c.date)}{S(c.author) && ` · ${S(c.author)}`} · 조회 128</div></header>
    <Media src={c.image} slot="image" ratio="16 / 9" label="본문 이미지를 끌어다 놓으세요" />
    <div className="bk-post-body" data-edit="body">{S(c.body)}</div>
    {L(c.files).length > 0 && <ul className="bk-files">{L(c.files).map((f, i) => <li key={i} data-edit={`files:${i}`}><Paperclip size={15} />{S(f.name)}<Download size={15} /></li>)}</ul>}
    {Boolean(c.nav) && <div className="bk-post-nav" data-edit="nav"><div><small>이전 글</small><span>추석 연휴 고객센터 운영 안내</span></div><div><small>다음 글</small><span>신제품 출시 이벤트</span></div></div>}
    <div className="bk-post-back"><Btn ghost edit="back">{S(c.back)}</Btn></div>
  </article>,

  location: (c, m) => <div className="bk-location">
    <Head c={c} />
    {L(c.branches).length > 0 && <div className="bk-cats">{L(c.branches).map((b, i) => <span key={i} data-on={i === 0 || undefined} data-edit={`branches:${i}`}>{S(b.name)}</span>)}</div>}
    <div className="bk-loc" data-layout={S(c.layout)}>
      <div className="bk-map" data-map={S(c.map)} style={{ height: N(c.mapHeight) * (m ? .65 : 1) }} data-edit="map"><span className="bk-pin"><MapPin size={22} /></span><small>지도 자리 · 실제 사이트에서 지도 API로 바꿔요</small></div>
      <dl className="bk-loc-info">
        {([["address", "주소"], ["phone", "전화"], ["hours", "운영 시간"], ["transit", "교통 안내"]] as const).filter(([k]) => S(c[k])).map(([k, label]) => <div key={k} data-edit={k}><dt>{label}</dt><dd>{S(c[k])}</dd></div>)}
      </dl>
    </div>
  </div>,

  about: c => {
    const items = L(c.items);
    return <div className="bk-about" data-variant={S(c.variant)}>
      <Head c={c} align={c.variant === "greeting" ? "start" : "center"} />
      {c.variant === "greeting" ? <div className="bk-greeting"><Media src={c.image} slot="image" ratio="3 / 4" label="대표 사진" /><div><p data-edit="body">{S(c.body)}</p><span className="bk-sign" data-edit="signName"><small>{S(c.signRole)}</small>{S(c.signName)}</span></div></div>
        : c.variant === "org" ? <div className="bk-org">{items[0] && <span className="bk-org-root" data-edit="items:0">{S(items[0].title)}</span>}<ul>{items.slice(1).map((it, i) => <li key={i} data-edit={`items:${i + 1}`}><b>{S(it.title)}</b><small>{S(it.text)}</small></li>)}</ul></div>
        : c.variant === "certs" ? <ul className="bk-certs">{items.map((it, i) => <li key={i} data-edit={`items:${i}`}><Media src={it.image} slot={`items:${i}:image`} ratio="3 / 4" label="" /><b>{S(it.title)}</b><small>{S(it.text)}</small></li>)}</ul>
        : <ul className="bk-values">{items.map((it, i) => <li key={i} data-edit={`items:${i}`}><i aria-hidden><Icon name={it.icon} size={24} /></i><b>{S(it.title)}</b><p>{S(it.text)}</p></li>)}</ul>}
    </div>;
  },

  product: c => <Product c={c} />,

  table: (c, m) => {
    const cols = S(c.columns).split(",").map(x => x.trim()), rows = L(c.rows).map(r => S(r.cells).split(",").map(x => x.trim())), hl = N(c.highlight);
    return <div className="bk-tbl"><Head c={c} />
      {m && c.mobile === "cards" ? <div className="bk-tcards">{rows.map((r, i) => <dl key={i} data-edit={`rows:${i}`}><dt>{r[0]}</dt>{cols.slice(1).map((col, j) => <div key={j}><span>{col}</span><b>{r[j + 1] ?? ""}</b></div>)}</dl>)}</div>
        : <div className="bk-tablewrap"><table className="bk-table" data-style={S(c.style)}><thead data-edit="columns"><tr>{cols.map((col, j) => <th key={j} data-hl={(hl > 0 && j === hl) || undefined}>{col}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} data-edit={`rows:${i}`}>{cols.map((_, j) => <td key={j} data-hl={(hl > 0 && j === hl) || undefined}>{r[j] ?? ""}</td>)}</tr>)}</tbody></table></div>}</div>;
  },

  appbar: c => <div className="bk-appbar" data-variant={S(c.variant)} data-divider={c.divider || undefined}>
    <div className="bk-ab-row"><span className="bk-ab-left" data-edit="left">{c.left === "back" ? <ChevronLeft size={24} /> : c.left === "menu" ? <Menu size={22} /> : c.left === "logo" ? <b>Brand</b> : null}</span>
      {c.variant !== "large" && <strong data-edit="title">{S(c.title)}</strong>}
      <span className="bk-ab-actions" data-edit="actions">{(c.actions === "search" || c.actions === "both") && <Search size={21} />}{(c.actions === "bell" || c.actions === "both") && <Bell size={21} />}</span></div>
    {c.variant === "large" && <h2 data-edit="title">{S(c.title)}</h2>}
  </div>,

  search: c => <div className="bk-search" data-variant={S(c.variant)} data-chip={S(c.chipStyle)}>
    <div className="bk-search-row"><span className="bk-search-box" data-edit="placeholder"><Search size={18} />{S(c.placeholder)}</span>{Boolean(c.filter) && <span className="bk-filter" data-edit="filter"><SlidersHorizontal size={18} /></span>}</div>
    {S(c.recent) && <div className="bk-recent" data-edit="recent"><small>최근 검색</small>{S(c.recent).split(",").map((r, i) => <span key={i}>{r.trim()}<X size={12} /></span>)}</div>}
    {L(c.chips).length > 0 && <div className="bk-chips bk-chip-row">{L(c.chips).map((ch, i) => <span key={i} data-on={i === 0 || undefined} data-edit={`chips:${i}`}>{S(ch.label)}</span>)}</div>}
  </div>,

  empty: c => <div className="bk-empty" data-size={S(c.size)}>
    {S(c.image) ? <Media src={c.image} slot="image" className="bk-empty-art" /> : <i className="bk-empty-icon" data-image-drop="img:image" data-edit="icon" aria-hidden><Icon name={c.icon} size={30} /></i>}
    <h3 data-edit="title">{S(c.title)}</h3><p data-edit="body">{S(c.body)}</p>{S(c.cta) && <Btn edit="cta">{S(c.cta)}</Btn>}
  </div>,

  appbanner: c => <div className="bk-appbanner" data-variant={S(c.variant)}>
    {Boolean(c.dismiss) && <X size={16} className="bk-ab-x" />}
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
    <span className="bk-app-icon" data-image-drop="img:image" data-edit="image">{S(c.image) ? <img src={S(c.image)} alt="" draggable={false} /> : <Smartphone size={20} />}</span>
    <div className="bk-app-text"><b data-edit="title">{S(c.title)}</b><small data-edit="text">{S(c.text)}{S(c.rating) && ` · ${S(c.rating)}`}</small></div>
    <span className="bk-btn bk-btn-sm" data-edit="cta">{S(c.cta)}</span>
  </div>,

  // ---- layers over the page ----
  popup: (c, m) => <div className="bk-popup" data-kind={S(c.kind)} data-size={S(c.size)} data-sheet={(m && c.mobile === "sheet") || undefined}>
    {Boolean(c.dim) && c.kind !== "corner" && <i className="bk-dim" aria-hidden />}
    <div className="bk-pop-card">
      {(S(c.image) || c.kind !== "corner") && <Media src={c.image} slot="image" ratio={c.kind === "full" ? undefined : "4 / 3"} className="bk-pop-media" />}
      {N(c.pages) > 1 && <span className="bk-pager">1 / {N(c.pages)}</span>}
      <div className="bk-pop-body"><h3 data-edit="title">{S(c.title)}</h3><p data-edit="body">{S(c.body)}</p>{S(c.cta) && <Btn edit="cta">{S(c.cta)}</Btn>}</div>
      <div className="bk-pop-foot" data-edit="dismiss">{c.dismiss === "both" && <span><i className="bk-checkbox" aria-hidden />오늘 하루 보지 않기</span>}<span>닫기 <X size={14} /></span></div>
    </div>
  </div>,

  intro: c => <div className="bk-intro" data-style={S(c.style)}>
    {c.style === "curtain" && <i className="bk-curtain" aria-hidden />}
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
    <strong className="bk-intro-logo" data-edit="logo" data-image-drop="img:image">{S(c.image) ? <img src={S(c.image)} alt={S(c.logo)} draggable={false} /> : S(c.logo)}</strong>
    {S(c.tagline) && <small data-edit="tagline">{S(c.tagline)}</small>}
    {c.style === "progress" && <span className="bk-intro-bar"><b /></span>}
    {c.style === "count" && <span className="bk-intro-count">72<small>%</small></span>}
  </div>,

  consent: c => <div className="bk-consent-layer" data-kind={S(c.kind)} data-side={S(c.side)}>
    {c.kind === "modal" && <i className="bk-dim" aria-hidden />}
    <div className="bk-consent-card"><div><b data-edit="title">{S(c.title)}</b><p data-edit="body">{S(c.body)}</p></div>
      <div className="bk-actions">{S(c.settings) && <span className="bk-link" data-edit="settings">{S(c.settings)}</span>}{S(c.decline) && <Btn ghost edit="decline">{S(c.decline)}</Btn>}<Btn edit="accept">{S(c.accept)}</Btn></div></div>
  </div>,

  progress: c => <div className="bk-progress" data-kind={S(c.kind)} data-side={S(c.side)}>
    {c.kind === "bar" ? <span className="bk-progress-bar"><b style={{ width: `${N(c.value)}%` }} /></span>
      : c.kind === "dots" ? <span className="bk-progress-dots">{Array.from({ length: N(c.count) }, (_, i) => <i key={i} data-on={i === Math.round(N(c.value) / 100 * (N(c.count) - 1)) || undefined} />)}</span>
      : <span className="bk-progress-frac"><b>{String(Math.round(N(c.value) / 100 * (N(c.count) - 1)) + 1).padStart(2, "0")}</b><i /><small>{String(N(c.count)).padStart(2, "0")}</small></span>}
  </div>,

  sheet: c => <div className="bk-sheet-layer">
    {Boolean(c.dim) && <i className="bk-dim" aria-hidden />}
    <div className="bk-sheet">{Boolean(c.handle) && <i className="bk-handle" aria-hidden />}<b data-edit="title">{S(c.title)}</b>{S(c.body) && <p data-edit="body">{S(c.body)}</p>}
      {c.kind === "actions" && <ul>{L(c.items).map((it, i) => <li key={i} data-edit={`items:${i}`}><Icon name={it.icon} />{S(it.label)}</li>)}</ul>}
      {S(c.cta) && <span className="bk-btn bk-submit" data-width="full" data-edit="cta">{S(c.cta)}</span>}</div>
  </div>,

  toast: c => <div className="bk-toast-layer" data-position={S(c.position)}>
    <div className="bk-toast" data-kind={S(c.kind)} data-tone={S(c.tone)}><i className="bk-tone" aria-hidden /><span data-edit="text">{S(c.text)}</span>{S(c.action) && <b data-edit="action">{S(c.action)}</b>}</div>
  </div>,
};

