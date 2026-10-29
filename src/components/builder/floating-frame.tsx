"use client";

import type { CSSProperties } from "react";
import { ArrowDown, ArrowUp, ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import type { FloatingConfig } from "@/lib/floating-config";
import { iconMap } from "./icons";

// Floating layers render in the artboard's overlay, pinned to the screen rather than the page.
export function FloatingFrame({ config, mobile }: { config: FloatingConfig; mobile: boolean }) {
  const kind = mobile ? config.mobileKind : config.kind;
  if (kind === "hidden" || (kind === "tabbar" && !mobile)) return <div className="fl fl-hidden" data-edit="frame">{mobile ? "모바일에서 숨김" : "PC에서는 숨김 · 모바일 탭바"}</div>;
  const icon = (name: FloatingConfig["items"][number]["icon"], size: number) => { const Icon = name ? iconMap[name] : ChevronRight; return <Icon size={size} />; };
  return <div className="fl" data-edit="frame" data-kind={kind} data-side={config.side} data-vertical={config.vertical} data-surface={config.surface} data-shape={config.shape} data-mobile={mobile || undefined}>
    {kind === "top" && <><span className="fl-round" data-edit="label"><ArrowUp size={18} /></span><span className="fl-round" data-edit="label"><ArrowDown size={18} /></span></>}
    {(kind === "rail" || kind === "tabbar") && <ul className="fl-items" data-edit="items">{config.items.map((item, i) => <li key={i} data-on={kind === "tabbar" && i === 0 || undefined}>{icon(item.icon, kind === "tabbar" ? 20 : 18)}<span>{item.label}</span></li>)}
      {kind === "rail" && <li className="fl-rail-top"><ArrowUp size={16} /><span>TOP</span></li>}</ul>}
    {kind === "fab" && <span className="fl-fab" data-edit="label"><Sparkles size={mobile ? 16 : 20} /><span>{config.label}</span></span>}
    {kind === "pill" && <span className="fl-pill" data-edit="label">{config.label}{config.badge && <em>{config.badge}</em>}</span>}
    {kind === "chat" && <><span className="fl-bubble" data-edit="label">{config.label}</span><span className="fl-chat" data-edit="label"><MessageCircle size={20} /></span></>}
  </div>;
}

// Where a floating layer sits on the screen; a tab bar or a phone pill spans the bottom edge.
export function floatPos(config: FloatingConfig, narrow: boolean): CSSProperties {
  const kind = narrow ? config.mobileKind : config.kind;
  if (kind === "tabbar" && narrow) return { left: 0, right: 0, bottom: 0 };
  if (kind === "pill" && narrow) return { left: 12, right: 12, bottom: 12 };
  return { [config.side]: narrow ? 16 : 28, ...(config.vertical === "center" ? { top: "50%", transform: "translateY(-50%)" } : { bottom: narrow ? 16 : 28 }) };
}
