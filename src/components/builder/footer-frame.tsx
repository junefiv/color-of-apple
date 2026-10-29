"use client";

import { useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUp, AtSign, ChevronDown, Globe, Minus, Play, Plus } from "lucide-react";
import { surfaceVars } from "@/lib/section-surface";
import type { FooterConfig } from "@/lib/footer-config";
import type { HeaderMenuItem } from "@/lib/header-config";

// `menu` is the page's header menu, so the sitemap columns follow whatever the header lists.
export function FooterFrame({ config, menu, mobile }: { config: FooterConfig; menu: HeaderMenuItem[]; mobile: boolean }) {
  const [open, setOpen] = useState(0);
  const style = surfaceVars("ft", config.surface) as CSSProperties;
  // eslint-disable-next-line @next/next/no-img-element -- inline data URL from the user's drop
  const logo = <span className="ft-logo" data-edit="brand" data-image-drop="footer" data-filled={config.logoImage ? true : undefined}>{config.logoImage ? <img src={config.logoImage} alt={config.logoText} draggable={false} /> : config.logoText || "Brand"}</span>;
  const legal = config.legal.length > 0 && <ul className="ft-legal" data-edit="legal">{config.legal.map((item, i) => <li key={i} data-strong={i === 1 || undefined}>{item}</li>)}</ul>;
  const sns = config.sns && <div className="ft-sns" data-edit="sns" aria-label="SNS"><i><AtSign size={15} /></i><i><Play size={15} /></i><i><Globe size={15} /></i></div>;
  const top = config.backToTop && <span className="ft-top" data-edit="extras"><ArrowUp size={16} />{!mobile && "TOP"}</span>;
  const family = config.familySite && <span className="ft-family" data-edit="extras">Family Site<ChevronDown size={14} /></span>;
  const columns = config.sitemap && config.layout !== "info" && config.layout !== "minimal" && menu.length > 0 && <nav className="ft-cols" data-edit="sitemap" data-mobile-cols={mobile ? config.mobileColumns : undefined}>
    {menu.map((item, i) => mobile && config.mobileColumns === "accordion"
      ? <div key={i} className="ft-acc" data-open={open === i || undefined}><button type="button" onClick={e => { e.stopPropagation(); setOpen(open === i ? -1 : i); }}>{item.label}{open === i ? <Minus size={14} /> : <Plus size={14} />}</button>
        {open === i && <ul>{item.children.map((child, j) => <li key={j}>{child.label}</li>)}</ul>}</div>
      : <div key={i}><strong>{item.label}</strong><ul>{item.children.map((child, j) => <li key={j}>{child.label}</li>)}</ul></div>)}</nav>;

  return <footer className="ft" data-edit="frame" data-layout={config.layout} data-mobile={mobile || undefined} style={style}>
    {config.lead !== "none" && <div className="ft-lead" data-edit="lead" data-lead={config.lead}>
      <div><strong>{config.leadTitle}</strong>{config.lead !== "slogan" && config.leadText && <p>{config.leadText}</p>}</div>
      {config.lead === "cta" && config.leadCta && <span className="ft-btn">{config.leadCta}<ArrowRight size={15} /></span>}
      {config.lead === "newsletter" && <span className="ft-news"><span>이메일 주소</span><b>{config.leadCta || "구독"}</b></span>}
    </div>}
    {config.layout === "minimal" ? <div className="ft-row">{logo}{legal}<small data-edit="info">{config.copyright}</small>{sns}{top}</div> : <>
      <div className="ft-main">
        <div className="ft-brand">{logo}<p data-edit="info">{config.info}</p></div>
        {columns}
      </div>
      <div className="ft-bottom">{legal}<small data-edit="info">{config.copyright}</small><div className="ft-tools">{family}{sns}{top}</div></div>
      {config.layout === "poster" && <div className="ft-poster" data-edit="brand" aria-hidden>{config.logoText || "Brand"}</div>}
    </>}
  </footer>;
}
