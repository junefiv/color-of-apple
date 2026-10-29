"use client";

import type { CSSProperties } from "react";
import { csvText, ctaTexts, tx } from "@/lib/component-texts";
import { ArrowRight, ChevronRight, Image as ImageIcon } from "lucide-react";
import { surfaceVars } from "@/lib/section-surface";
import type { CtaConfig } from "@/lib/cta-config";
import { iconMap } from "./icons";

export function CtaFrame({ config, mobile }: { config: CtaConfig; mobile: boolean }) {
  // With a background image the copy reads light-on-dark whatever the surface role is.
  const onImage = !!config.image && config.layout !== "split";
  const style = { ...surfaceVars("ct", onImage ? "transparent" : config.surface, config.accent), "--ct-radius": `${config.buttonRadius}px` } as CSSProperties;
  const copy = <div className="ct-copy">
    {config.eyebrow && <span className="ct-eyebrow" data-edit="eyebrow">{config.eyebrow}</span>}
    <h2 data-edit="title">{config.title || "제목"}</h2>
    {config.text && <p data-edit="text">{config.text}</p>}
    {config.countdown && <div className="ct-count" data-edit="countdown"><small>{config.countdownLabel}</small>{csvText(tx(config.texts, ctaTexts, "countValues")).map((n, i) => <span key={i}><b>{n}</b>{csvText(tx(config.texts, ctaTexts, "countUnits"))[i] ?? ""}</span>)}</div>}
  </div>;
  const actions = (config.primary || config.secondary) && <div className="ct-actions" data-edit="buttons">
    {config.primary && <span className="ct-btn">{config.primary}<ArrowRight size={16} /></span>}{config.secondary && <span className="ct-btn ct-ghost">{config.secondary}</span>}</div>;
  // eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop
  const media = <span className="ct-media" data-edit="image">{config.image ? <img src={config.image} alt="" draggable={false} /> : <><ImageIcon size={18} />이미지를 끌어다 놓으세요</>}</span>;

  return <section className="ct" data-edit="frame" data-image-drop="cta" data-layout={config.layout} data-boxed={config.boxed || undefined} data-on-image={onImage || undefined} data-mobile={mobile || undefined} style={style}>
    {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop */}
    {onImage && <img className="ct-bg" src={config.image} alt="" draggable={false} />}
    <div className="ct-inner">
      {config.layout === "split" ? <>{<div className="ct-side">{copy}{actions}</div>}{media}</>
        : config.layout === "cards" ? <><div className="ct-side">{copy}{actions}</div><ul className="ct-contacts" data-edit="contacts">{config.contacts.map((c, i) => { const Icon = c.icon ? iconMap[c.icon] : ChevronRight; return <li key={i}><i aria-hidden><Icon size={18} /></i><small>{c.label}</small><b>{c.value}</b></li>; })}</ul></>
        : <>{copy}{actions}</>}
    </div>
  </section>;
}
