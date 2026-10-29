"use client";

import type { CSSProperties } from "react";
import { ArrowRight, Image as ImageIcon, Play } from "lucide-react";
import { heroColorVars, heroHeight, type HeroConfig } from "@/lib/hero-config";

const tickerWords = ["새 컬렉션", "브랜드 스토리", "이벤트", "오프라인 스토어", "멤버십"];

export function HeroFrame({ config, mobile, viewport }: { config: HeroConfig; mobile: boolean; viewport: number }) {
  const onMedia = config.layout === "overlay" || config.layout === "band";
  // Thumbnail rails don't fit a phone, so surveyed sites fall back to dots there.
  const nav = config.slides < 2 ? "none" : mobile && config.nav === "thumbs" ? "dots" : config.nav;
  const style = { ...heroColorVars(config), minHeight: heroHeight(config, mobile, viewport) } as CSSProperties;
  const media = <div className="hr-media" data-edit="media" data-scrim={onMedia ? config.scrim : undefined} data-filled={config.image ? true : undefined}>
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
    {config.image && <img className="hr-img" src={config.image} alt="" data-fit={config.imageFit} draggable={false} />}
    {!config.image && <span>{config.media === "video" ? <Play size={14} /> : <ImageIcon size={14} />}{config.media === "video" ? "비디오 · 포스터 이미지를 끌어다 놓으세요" : "이미지를 끌어다 놓으세요"}{config.slides > 1 && ` · ${config.slides}장`}</span>}</div>;
  const copy = <div className="hr-copy">
    {config.eyebrow && <span className="hr-eyebrow" data-edit="eyebrow">{config.eyebrow}</span>}
    <h1 className="hr-title" data-edit="title">{config.title || "제목"}</h1>
    {config.body && <p className="hr-text" data-edit="body">{config.body}</p>}
    {(config.primary || config.secondary) && <div className="hr-actions">{config.primary && <span className="hr-btn" data-edit="primary">{config.primary}<ArrowRight size={16} /></span>}{config.secondary && <span className="hr-btn hr-btn-ghost" data-edit="secondary">{config.secondary}</span>}</div>}
  </div>;

  return <div className="hr" data-edit="frame" data-image-drop={config.layout === "text" || config.layout === "color" ? undefined : "hero"} data-layout={config.layout} data-align={config.align} data-mobile={mobile || undefined} data-ticker={config.ticker || undefined} data-button={config.buttonStyle} style={style}>
    {onMedia && media}
    {config.layout === "split" ? <div className="hr-split" data-media-first={config.mediaFirst || undefined}>{copy}{media}</div> : <div className="hr-body">{copy}</div>}
    {nav !== "none" && <div className="hr-nav" data-edit="nav" data-nav={nav}>
      {nav === "dots" && Array.from({ length: config.slides }, (_, i) => <i key={i} data-on={i === 0 || undefined} />)}
      {nav === "fraction" && <span><b>01</b> / {String(config.slides).padStart(2, "0")}</span>}
      {nav === "progress" && <><span>01</span><i><b style={{ width: `${100 / config.slides}%` }} /></i><span>{String(config.slides).padStart(2, "0")}</span></>}
      {nav === "thumbs" && Array.from({ length: config.slides }, (_, i) => <i key={i} data-on={i === 0 || undefined}><span>{String(i + 1).padStart(2, "0")}</span></i>)}
    </div>}
    {config.card && <aside className="hr-card" data-edit="card"><strong>공지사항</strong><span>새로운 소식을 확인하세요</span><small>2026.10.29</small></aside>}
    {config.ticker && <div className="hr-ticker" data-edit="ticker" aria-hidden><div>{[...tickerWords, ...tickerWords].map((word, i) => <span key={i}>{word}</span>)}</div></div>}
  </div>;
}
