"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Bell, ChevronDown, ChevronLeft, ChevronRight, Heart, Image as ImageIcon, Minus, MoreHorizontal, Plus, Send, ShoppingBag, SlidersHorizontal, Star, X } from "lucide-react";
import type { Config } from "@/lib/block-schema";
import type { HeaderIcon } from "@/lib/header-config";
import { SectionHeading } from "./cards-frame";
import { iconMap } from "./icons";

// Preview frames for the second block batch (src/lib/blocks-more.ts). Same conventions as
// block-frames.tsx: data-edit names the key a click edits, data-image-drop the image slot.
const S = (v: unknown) => typeof v === "string" ? v : "";
const N = (v: unknown) => typeof v === "number" ? v : 0;
const L = (v: unknown) => (Array.isArray(v) ? v : []) as Config[];
const csv = (v: unknown) => S(v).split(",").map(s => s.trim()).filter(Boolean);
const ratio = (v: unknown) => S(v).replace(":", " / ") || undefined;
const Icon = ({ name, size = 20 }: { name: unknown; size?: number }) => { const I = iconMap[S(name) as Exclude<HeaderIcon, "">]; return I ? <I size={size} /> : null; };

function Media({ src, slot, ratio, label = "이미지를 끌어다 놓으세요", className = "" }: { src: unknown; slot: string; ratio?: string; label?: string; className?: string }) {
  const edit = slot.split(":").slice(0, 2).join(":");
  // eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop
  return <span className={`bk-media ${className}`} data-image-drop={`img:${slot}`} data-edit={edit} style={ratio ? { aspectRatio: ratio } : undefined}>{S(src) ? <img src={S(src)} alt="" draggable={false} /> : <><ImageIcon size={18} />{label && <small>{label}</small>}</>}</span>;
}
const Head = ({ c, align = "start" }: { c: Config; align?: "start" | "center" }) => (S(c.title) || S(c.eyebrow)) ? <SectionHeading eyebrow={S(c.eyebrow)} title={S(c.title)} desc={S(c.desc)} more={S(c.more)} align={align} /> : null;
const Btn = ({ children, ghost, edit, small }: { children: ReactNode; ghost?: boolean; edit?: string; small?: boolean }) => <span className={`bk-btn${ghost ? " bk-ghost" : ""}${small ? " bk-btn-sm" : ""}`} data-edit={edit}>{children}</span>;
const Stars = ({ n }: { n: number }) => <span className="bm-stars" aria-label={`${n}점`}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= n ? "currentColor" : "none"} />)}</span>;
const cols = (c: Config, m: boolean, mobileMax = 2) => ({ "--bm-cols": m ? Math.min(mobileMax, N(c.columns) || 1) : N(c.columns) || 1 }) as CSSProperties;

function Gallery({ c, m }: { c: Config; m: boolean }) {
  const [big, setBig] = useState<number | null>(null);
  const items = L(c.items), r = c.layout === "masonry" ? undefined : ratio(c.ratio);
  return <><Head c={c} />
    <div className="bm-gallery" data-layout={S(c.layout)} style={{ ...cols(c, m), gap: N(c.gap) }}>
      {items.map((it, i) => <figure key={i} data-edit={`items:${i}`} onClick={c.lightbox ? () => setBig(i) : undefined}>
        <Media src={it.image} slot={`items:${i}:image`} ratio={c.layout === "masonry" ? ["3 / 4", "1 / 1", "4 / 5", "4 / 3"][i % 4] : c.layout === "wide" && i === 0 ? undefined : r} label="" />
        {Boolean(c.captions) && <figcaption>{S(it.caption)}</figcaption>}</figure>)}
    </div>
    {big !== null && items[big] && <div className="bm-lightbox" onClick={() => setBig(null)}><X size={22} /><Media src={items[big].image} slot={`items:${big}:image`} ratio="4 / 3" /><span>{S(items[big].caption)} · {big + 1} / {items.length}</span></div>}</>;
}

function Booking({ c, m }: { c: Config; m: boolean }) {
  const [day, setDay] = useState(0);
  const sel = day || N(c.selected), lead = N(c.startDay), days = N(c.days) || 30;
  const [slot, setSlot] = useState(-1);
  return <><Head c={c} align={m ? "start" : "center"} />
    <div className="bm-booking" data-layout={m ? "stack" : S(c.layout)}>
      <div className="bm-cal" data-edit="month">
        <div className="bm-cal-head"><ChevronLeft size={18} /><b>{S(c.month)}</b><ChevronRight size={18} /></div>
        <div className="bm-cal-grid">{csv(c.weekdays).map((w, i) => <i key={`w${i}`}>{w}</i>)}
          {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
          {Array.from({ length: days }, (_, i) => <button key={i} type="button" data-on={i + 1 === sel || undefined} data-sun={(i + lead) % 7 === 0 || undefined} onClick={e => { e.stopPropagation(); setDay(i + 1); }}>{i + 1}</button>)}</div>
      </div>
      <div className="bm-book-side">
        {L(c.slots).length > 0 && <><b data-edit="slotsLabel">{S(c.slotsLabel)}</b><div className="bm-slots">{L(c.slots).map((s, i) => <button key={i} type="button" data-off={s.off || undefined} data-on={i === slot || undefined} data-edit={`slots:${i}`} onClick={e => { e.stopPropagation(); if (!s.off) setSlot(i); }}>{S(s.label)}</button>)}</div></>}
        <div className="bm-people" data-edit="people"><b>{S(c.peopleLabel)}</b><span><Minus size={16} /><em>{N(c.people)}</em><Plus size={16} /></span></div>
        <Btn edit="button">{S(c.button)}</Btn>
        {S(c.note) && <small data-edit="note">{S(c.note)}</small>}
      </div>
    </div></>;
}

function Banners({ c }: { c: Config }) {
  const [cur, setCur] = useState(0);
  const items = L(c.items), i = Math.min(cur, Math.max(0, items.length - 1));
  return <div className="bm-banners" data-peek={c.peek || undefined} data-align={S(c.align)} style={{ "--bm-ratio": ratio(c.ratio) } as CSSProperties}>
    <div className="bm-banner-track" style={{ transform: `translateX(calc(${-i} * (var(--bm-slide) + 12px)))` }}>
      {items.map((b, k) => <div key={k} className="bm-banner" data-edit={`items:${k}`} onClick={() => setCur((k + 1) % items.length)}>
        <Media src={b.image} slot={`items:${k}:image`} label="" className="bm-banner-bg" />
        <div>{S(b.badge) && <em className="bk-tag">{S(b.badge)}</em>}<b>{S(b.title)}</b><small>{S(b.sub)}</small></div>
      </div>)}
    </div>
    {c.indicator === "fraction" && items.length > 0 && <span className="bm-fraction">{i + 1} / {items.length}</span>}
    {c.indicator === "dots" && <span className="bm-dots">{items.map((_, k) => <i key={k} data-on={k === i || undefined} />)}</span>}
  </div>;
}

function Onboarding({ c }: { c: Config }) {
  const items = L(c.items);
  const [cur, setCur] = useState(-1);
  const i = Math.min(cur >= 0 ? cur : (N(c.current) || 1) - 1, Math.max(0, items.length - 1)), it = items[i] ?? {}, last = i === items.length - 1;
  return <div className="bm-onb">
    {S(c.skip) && <span className="bm-skip" data-edit="skip">{S(c.skip)}</span>}
    <Media src={it.image} slot={`items:${i}:image`} ratio="1 / 1" label="그림을 끌어다 놓으세요" />
    <div className="bm-onb-copy" data-edit={`items:${i}`}><h2>{S(it.title)}</h2><p>{S(it.body)}</p></div>
    <span className="bm-dots">{items.map((_, k) => <i key={k} data-on={k === i || undefined} />)}</span>
    <span onClick={e => { e.stopPropagation(); setCur(last ? 0 : i + 1); }}><Btn edit={last ? "last" : "primary"}>{last ? S(c.last) : S(c.primary)}</Btn></span>
  </div>;
}

function Compare({ c }: { c: Config }) {
  const [pos, setPos] = useState<number | null>(null);
  const p = pos ?? N(c.position);
  return <><Head c={c} align="center" />
    <div className="bm-compare" style={{ aspectRatio: ratio(c.ratio), maxWidth: N(c.width) }} onPointerMove={e => { if (e.buttons !== 1) return; const r = e.currentTarget.getBoundingClientRect(); setPos(Math.round(Math.min(95, Math.max(5, (e.clientX - r.left) / r.width * 100)))); }}>
      <Media src={c.after} slot="after" label="후 사진을 끌어다 놓으세요" />
      <div className="bm-compare-before" style={{ clipPath: `inset(0 ${100 - p}% 0 0)` }}><Media src={c.before} slot="before" label="전 사진을 끌어다 놓으세요" /></div>
      <em data-edit="beforeLabel" className="bm-cmp-l">{S(c.beforeLabel)}</em><em data-edit="afterLabel" className="bm-cmp-r">{S(c.afterLabel)}</em>
      <i className="bm-compare-bar" style={{ left: `${p}%` }} data-edit="position"><span><ChevronLeft size={14} /><ChevronRight size={14} /></span></i>
    </div></>;
}

function Ticker({ c }: { c: Config }) {
  const [cur, setCur] = useState(0);
  const items = L(c.items), i = items.length ? cur % items.length : 0, it = items[i] ?? {};
  return <div className="bm-ticker" data-variant={S(c.variant)}>
    <b data-edit="label">{S(c.label)}</b>
    <span className="bm-ticker-text" data-edit={`items:${i}`} key={i}>{S(it.text)}</span>
    {S(it.date) && <small>{S(it.date)}</small>}
    {Boolean(c.arrows) && <span className="bm-ticker-arrows"><button type="button" onClick={e => { e.stopPropagation(); setCur(i + items.length - 1); }}><ChevronDown size={16} style={{ rotate: "180deg" }} /></button><button type="button" onClick={e => { e.stopPropagation(); setCur(i + 1); }}><ChevronDown size={16} /></button></span>}
    {S(c.more) && <span className="bm-ticker-more" data-edit="more">{S(c.more)}<Plus size={14} /></span>}
  </div>;
}

function Pricing({ c, m }: { c: Config; m: boolean }) {
  const [yearly, setYearly] = useState(false);
  const toggle = csv(c.toggleText);
  return <><Head c={c} align="center" />
    {Boolean(c.toggle) && toggle.length > 1 && <div className="bm-switch" data-edit="toggleText">{toggle.slice(0, 2).map((t, i) => <button key={i} type="button" data-on={(i === 1) === yearly || undefined} onClick={e => { e.stopPropagation(); setYearly(i === 1); }}>{t}</button>)}</div>}
    <div className="bm-plans" style={{ "--bm-cols": m ? 1 : L(c.items).length || 1 } as CSSProperties}>
      {L(c.items).map((p, i) => <div key={i} className="bm-plan" data-featured={p.featured || undefined} data-edit={`items:${i}`}>
        {S(p.badge) && <em className="bk-tag">{S(p.badge)}</em>}
        <b>{S(p.name)}</b><p>{S(p.desc)}</p>
        <strong>{S(p.price)}<small>{S(p.period)}</small></strong>
        <ul>{csv(p.features).map((f, k) => <li key={k}>{f}</li>)}</ul>
        <Btn ghost={!p.featured}>{S(p.button)}</Btn>
      </div>)}
    </div></>;
}

function Tabbed({ labels, edit }: { labels: string[]; edit: string }) {
  const [on, setOn] = useState(0);
  return <div className="bm-tabs" data-edit={edit}>{labels.map((t, i) => <button key={i} type="button" data-on={i === on || undefined} onClick={e => { e.stopPropagation(); setOn(i); }}>{t}</button>)}</div>;
}

const moveIcon = (v: unknown) => v === "up" ? <em className="bm-move" data-move="up"><ArrowUp size={12} /></em> : v === "down" ? <em className="bm-move" data-move="down"><ArrowDown size={12} /></em> : v === "new" ? <em className="bm-move" data-move="new">NEW</em> : <em className="bm-move">–</em>;
const socialTone: Record<string, [string, string]> = { kakao: ["#FEE500", "#191919"], naver: ["#03C75A", "#fff"], apple: ["#000", "#fff"], google: ["#fff", "#303039"] };

export const MORE_BODIES: Record<string, (c: Config, m: boolean) => ReactNode> = {
  gallery: (c, m) => <Gallery c={c} m={m} />,

  logos: (c, m) => <><Head c={c} align="center" />
    <div className="bm-logos" data-tile={S(c.tile)} data-mono={c.mono || undefined} style={{ ...cols(c, m, 3), "--bm-logo": `${N(c.size) * (m ? .75 : 1)}px` } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
      {L(c.items).map((it, i) => <span key={i} data-edit={`items:${i}`} data-image-drop={`img:items:${i}:image`}>{S(it.image) ? <img src={S(it.image)} alt={S(it.name)} draggable={false} /> : S(it.name)}</span>)}
    </div></>,

  reviews: (c, m) => {
    const items = L(c.items), quote = c.layout === "quote";
    return <><div className="bm-rev-head"><Head c={c} align={quote ? "center" : "start"} />{Boolean(c.summary) && !quote && <div className="bm-rev-sum" data-edit="score"><strong>{S(c.score)}</strong><Stars n={5} /><small data-edit="count">{S(c.count)}</small></div>}</div>
      {quote ? <figure className="bm-quote" data-edit="items:0"><Stars n={N(items[0]?.rating)} /><blockquote>“{S(items[0]?.text)}”</blockquote><figcaption>{Boolean(c.avatar) && <Media src={items[0]?.image} slot="items:0:image" ratio="1 / 1" label="" className="bm-avatar" />}<b>{S(items[0]?.name)}</b><small>{S(items[0]?.meta)}</small></figcaption></figure>
        : <div className="bm-reviews" data-layout={S(c.layout)} style={cols(c, m, 1)}>{items.map((r, i) => <article key={i} data-edit={`items:${i}`}>
          {Boolean(c.stars) && <Stars n={N(r.rating)} />}<p>{S(r.text)}</p>
          <footer>{Boolean(c.avatar) && <Media src={r.image} slot={`items:${i}:image`} ratio="1 / 1" label="" className="bm-avatar" />}<span><b>{S(r.name)}</b><small>{S(r.meta)}</small></span></footer>
        </article>)}</div>}</>;
  },

  newsletter: c => <div className="bm-news" data-layout={S(c.layout)}>
    <div className="bm-news-copy">{S(c.eyebrow) && <span className="bk-eyebrow" data-edit="eyebrow">{S(c.eyebrow)}</span>}<h2 data-edit="title">{S(c.title)}</h2>{S(c.desc) && <p data-edit="desc">{S(c.desc)}</p>}</div>
    <div className="bm-news-form"><span className="bm-input" data-edit="placeholder">{S(c.placeholder)}</span><Btn edit="button">{S(c.button)}</Btn>{S(c.note) && <small data-edit="note">{S(c.note)}</small>}</div>
  </div>,

  promo: (c, m) => {
    const vals = csv(c.countValues), units = csv(c.countUnits);
    const count = Boolean(c.countdown) && <div className="bm-count" data-edit="countValues">{S(c.countLabel) && <small data-edit="countLabel">{S(c.countLabel)}</small>}{vals.map((v, i) => <span key={i}><b>{v}</b><i>{units[i] ?? ""}</i></span>)}</div>;
    return <div className="bm-promo" data-layout={S(c.layout)} data-mobile={m || undefined}>
      {c.layout !== "strip" && <Media src={c.image} slot="image" className="bm-promo-img" label="이벤트 이미지를 끌어다 놓으세요" />}
      <div className="bm-promo-copy">{S(c.badge) && <em className="bk-tag" data-edit="badge">{S(c.badge)}</em>}<b data-edit="title">{S(c.title)}</b>{S(c.desc) && <small data-edit="desc">{S(c.desc)}</small>}</div>
      {count}
      {S(c.cta) && <Btn edit="cta" small={c.layout === "strip"}>{S(c.cta)}<ArrowRight size={15} /></Btn>}
      {Boolean(c.close) && <X size={18} className="bm-promo-x" data-edit="close" />}
    </div>;
  },

  stats: (c, m) => <><Head c={c} align={c.align === "center" ? "center" : "start"} />
    <div className="bm-stats" data-divider={S(c.divider)} data-align={S(c.align)} style={cols(c, m)}>
      {L(c.items).map((s, i) => <div key={i} data-edit={`items:${i}`}>{S(s.icon) && <Icon name={s.icon} size={26} />}<strong>{S(s.value)}<small>{S(s.unit)}</small></strong><span>{S(s.label)}</span></div>)}
    </div></>,

  pricing: (c, m) => <Pricing c={c} m={m} />,

  team: (c, m) => <><Head c={c} />
    <div className="bm-team" data-shape={S(c.shape)} style={cols(c, m)}>{L(c.items).map((p, i) => <div key={i} data-edit={`items:${i}`}>
      <Media src={p.image} slot={`items:${i}:image`} ratio={c.shape === "circle" ? "1 / 1" : ratio(c.ratio)} label="" />
      <b>{S(p.name)}</b><small>{S(p.role)}</small>{Boolean(c.bio) && <p>{S(p.bio)}</p>}</div>)}</div></>,

  compare: c => <Compare c={c} />,
  ticker: c => <Ticker c={c} />,

  feed: (c, m) => <div className="bm-feed">
    <div className="bm-feed-head"><span className="bm-feed-id"><i aria-hidden /><b data-edit="handle">{S(c.handle)}</b></span><h2 data-edit="title">{S(c.title)}</h2>{S(c.button) && <Btn small edit="button">{S(c.button)}</Btn>}</div>
    <div className="bm-feed-grid" data-overlay={c.overlay || undefined} style={{ ...cols(c, m, 3), gap: N(c.gap) }}>{L(c.items).map((p, i) => <div key={i} data-edit={`items:${i}`}><Media src={p.image} slot={`items:${i}:image`} ratio="1 / 1" label="" /><span><Heart size={14} fill="currentColor" />{S(p.likes)}</span></div>)}</div>
  </div>,

  productlist: (c, m) => <><Head c={c} />
    {Boolean(c.toolbar) && <div className="bm-toolbar"><span data-edit="sortText">{csv(c.sortText).map((s, i) => <b key={i} data-on={i === 0 || undefined}>{s}</b>)}</span><span className="bm-filter" data-edit="filterText"><SlidersHorizontal size={15} />{S(c.filterText)}</span></div>}
    <div className="bm-products" style={{ "--bm-cols": m ? Number(S(c.mobileColumns) || 2) : N(c.columns) } as CSSProperties}>
      {L(c.items).map((p, i) => <div key={i} className="bm-product" data-edit={`items:${i}`}>
        <div className="bm-product-img"><Media src={p.image} slot={`items:${i}:image`} ratio={ratio(c.ratio)} label="" />{S(p.badge) && <em className="bk-tag">{S(p.badge)}</em>}{Boolean(c.wish) && <Heart size={18} className="bm-wish" />}</div>
        <small>{S(p.brand)}</small><b>{S(p.name)}</b>
        <span className="bm-price">{S(p.sale) && <em>{S(p.sale)}</em>}{S(p.price)}</span>
        {S(p.rating) && <small className="bm-rating">{S(p.rating)}</small>}
        {Boolean(c.cart) && <Btn small ghost edit="cartText"><ShoppingBag size={14} />{S(c.cartText)}</Btn>}
      </div>)}
    </div></>,

  cart: (c, m) => <div className="bm-cart" data-layout={m ? "stack" : S(c.layout)}>
    <div className="bm-cart-list">
      <h2 data-edit="title">{S(c.title)}</h2>
      <div className="bm-cart-bar"><span data-edit="selectText"><i className="bk-checkbox" data-on aria-hidden />{S(c.selectText)}</span><small data-edit="deleteText">{S(c.deleteText)}</small></div>
      {L(c.items).map((it, i) => <div key={i} className="bm-cart-item" data-edit={`items:${i}`}><i className="bk-checkbox" data-on aria-hidden /><Media src={it.image} slot={`items:${i}:image`} ratio="1 / 1" label="" />
        <div><b>{S(it.name)}</b><small>{S(it.option)}</small><span className="bm-qty"><Minus size={14} /><em>{N(it.qty)}</em><Plus size={14} /></span></div><strong>{S(it.price)}</strong><X size={16} /></div>)}
    </div>
    <aside className="bm-cart-sum" data-sticky={(m && c.sticky) || undefined}>
      {L(c.lines).map((l, i) => <div key={i} data-edit={`lines:${i}`}><span>{S(l.label)}</span><span>{S(l.value)}</span></div>)}
      <div className="bm-total" data-edit="total"><b data-edit="totalLabel">{S(c.totalLabel)}</b><strong>{S(c.total)}</strong></div>
      <Btn edit="button">{S(c.button)}</Btn>
    </aside>
  </div>,

  buybar: (c, m) => <div className="bm-buybar-layer"><div className="bm-buybar" data-mobile={m || undefined}>
    {Boolean(c.wish) && <span className="bm-buy-wish" data-edit="wish"><Heart size={20} /><small data-edit="wishCount">{S(c.wishCount)}</small></span>}
    {S(c.price) && <b className="bm-buy-price" data-edit="price">{S(c.price)}</b>}
    {S(c.secondary) && <Btn ghost edit="secondary">{S(c.secondary)}</Btn>}
    <Btn edit="primary">{S(c.primary)}</Btn>
  </div></div>,

  booking: (c, m) => <Booking c={c} m={m} />,

  coupons: (c, m) => <><Head c={c} />
    <div className="bm-coupons" data-shape={S(c.shape)} style={cols(c, m, 1)}>{L(c.items).map((cp, i) => <div key={i} data-edit={`items:${i}`}>
      <div className="bm-coupon-main"><strong>{S(cp.value)}</strong><b>{S(cp.title)}</b><small>{S(cp.cond)}</small></div>
      <span className="bm-coupon-btn">{S(cp.button)}<ArrowDown size={14} /></span></div>)}</div></>,

  orderstatus: (c, m) => {
    const steps = L(c.steps), cur = Math.min(N(c.current), steps.length);
    return <div className="bm-order">
      <div className="bm-order-head"><h2 data-edit="title">{S(c.title)}</h2><small data-edit="sub">{S(c.sub)}</small></div>
      <ol className="bm-order-steps" data-mobile={m || undefined} style={{ "--bm-n": Math.max(1, steps.length), "--bm-p": steps.length > 1 ? Math.max(0, cur - 1) / (steps.length - 1) : 0 } as CSSProperties}>
        {steps.map((s, i) => <li key={i} data-done={i < cur || undefined} data-now={i === cur - 1 || undefined} data-edit={`steps:${i}`}><i>{i + 1}</i><b>{S(s.label)}</b><small>{S(s.time)}</small></li>)}
      </ol>
      {L(c.info).length > 0 && <dl className="bm-order-info">{L(c.info).map((r, i) => <div key={i} data-edit={`info:${i}`}><dt>{S(r.label)}</dt><dd>{S(r.value)}</dd></div>)}</dl>}
      {S(c.button) && <Btn ghost edit="button">{S(c.button)}</Btn>}
    </div>;
  },

  iconmenu: (c, m) => <div className="bm-icons" data-shape={S(c.shape)} data-scroll={c.scroll || undefined} style={{ "--bm-cols": m ? Math.min(5, N(c.columns)) : N(c.columns), "--bm-icon": `${N(c.size) * (m ? .85 : 1)}px` } as CSSProperties}>
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
    {L(c.items).map((it, i) => <span key={i} data-edit={`items:${i}`}><i data-image-drop={`img:items:${i}:image`}>{S(it.image) ? <img src={S(it.image)} alt="" draggable={false} /> : <Icon name={it.icon} size={Math.round(N(c.size) * .42)} />}{S(it.badge) && <em>{S(it.badge)}</em>}</i><b>{S(it.label)}</b></span>)}
  </div>,

  banners: c => <Banners c={c} />,

  ranking: c => <><Head c={c} />
    {Boolean(c.tabs) && <Tabbed labels={csv(c.tabText)} edit="tabText" />}
    <ol className="bm-rank" data-variant={S(c.variant)}>{L(c.items).map((r, i) => <li key={i} data-edit={`items:${i}`}>
      <strong>{i + 1}</strong>{Boolean(c.thumb) && <Media src={r.image} slot={`items:${i}:image`} ratio="1 / 1" label="" />}
      <span><b>{S(r.title)}</b><small>{S(r.meta)}</small></span>{moveIcon(r.move)}</li>)}</ol></>,

  onboarding: c => <Onboarding c={c} />,

  auth: (c, m) => {
    const signup = c.mode === "signup";
    const form = <div className="bm-auth-card">
      <span className="bm-auth-logo" data-edit="logo" data-image-drop="img:image">{/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}{S(c.image) ? <img src={S(c.image)} alt={S(c.logo)} draggable={false} /> : S(c.logo)}</span>
      <h2 data-edit="title">{S(c.title)}</h2>{S(c.desc) && <p data-edit="desc">{S(c.desc)}</p>}
      {signup && <span className="bm-input" data-edit="nameLabel">{S(c.nameLabel)}</span>}
      <span className="bm-input" data-edit="idLabel">{S(c.idLabel)}</span><span className="bm-input" data-edit="pwLabel">{S(c.pwLabel)}</span>
      {S(c.keep) && !signup && <span className="bm-keep" data-edit="keep"><i className="bk-checkbox" aria-hidden />{S(c.keep)}</span>}
      <Btn edit="button">{S(c.button)}</Btn>
      {csv(c.links).length > 0 && <nav className="bm-auth-links" data-edit="links">{csv(c.links).map((l, i) => <span key={i}>{l}</span>)}</nav>}
      {L(c.social).length > 0 && <>{S(c.socialLabel) && <span className="bm-or" data-edit="socialLabel">{S(c.socialLabel)}</span>}
        <div className="bm-social">{L(c.social).map((s, i) => { const [bg, fg] = socialTone[S(s.tone)] ?? socialTone.google; return <span key={i} data-edit={`social:${i}`} style={{ background: bg, color: fg }}>{S(s.label)}</span>; })}</div></>}
    </div>;
    return <div className="bm-auth" data-layout={m ? "center" : S(c.layout)}>{c.layout === "split" && !m && <Media src={c.image} slot="image" className="bm-auth-art" label="이미지를 끌어다 놓으세요" />}{form}</div>;
  },

  mypage: c => <div className="bm-my">
    <div className="bm-my-profile"><Media src={c.avatar} slot="avatar" ratio="1 / 1" label="" className="bm-avatar" /><span><b data-edit="name">{S(c.name)}</b><small data-edit="grade">{S(c.grade)}</small></span>{S(c.edit) && <span className="bm-my-edit" data-edit="edit">{S(c.edit)}<ChevronRight size={14} /></span>}</div>
    {L(c.stats).length > 0 && <div className="bm-my-stats">{L(c.stats).map((s, i) => <span key={i} data-edit={`stats:${i}`}><small>{S(s.label)}</small><b>{S(s.value)}</b></span>)}</div>}
    <ul className="bm-my-menu">{L(c.menu).map((it, i) => <li key={i} data-group={it.group || undefined} data-edit={`menu:${i}`}><Icon name={it.icon} size={18} /><span>{S(it.label)}</span>{S(it.value) && <small>{S(it.value)}</small>}{it.toggle ? <i className="bm-toggle" data-on aria-hidden /> : <ChevronRight size={16} />}</li>)}</ul>
  </div>,

  notices: c => <div className="bm-noti">
    <div className="bm-noti-head">{Boolean(c.tabs) && <Tabbed labels={csv(c.tabText)} edit="tabText" />}{S(c.readAll) && <small data-edit="readAll">{S(c.readAll)}</small>}</div>
    <ul>{L(c.items).map((n, i) => <li key={i} data-unread={n.unread || undefined} data-edit={`items:${i}`}><i>{S(n.icon) ? <Icon name={n.icon} size={18} /> : <Bell size={18} />}</i><span><b>{S(n.title)}</b><p>{S(n.body)}</p><small>{S(n.time)}</small></span></li>)}</ul>
  </div>,

  chat: c => <div className="bm-chat">
    <div className="bm-chat-head"><ChevronLeft size={20} /><span><b data-edit="title">{S(c.title)}</b>{S(c.status) && <small data-edit="status">{S(c.status)}</small>}</span><MoreHorizontal size={20} /></div>
    <div className="bm-chat-body">{S(c.date) && <small className="bm-chat-date" data-edit="date">{S(c.date)}</small>}
      {L(c.items).map((b, i) => <div key={i} className="bm-bubble" data-me={b.from === "me" || undefined} data-edit={`items:${i}`}><p>{S(b.text)}</p><small>{S(b.time)}</small></div>)}</div>
    {L(c.quick).length > 0 && <div className="bm-chat-quick">{L(c.quick).map((q, i) => <span key={i} data-edit={`quick:${i}`}>{S(q.label)}</span>)}</div>}
    <div className="bm-chat-input"><Plus size={20} /><span data-edit="placeholder">{S(c.placeholder)}</span><i><Send size={16} /></i></div>
  </div>,
};
