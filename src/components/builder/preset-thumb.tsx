"use client";

import type { CSSProperties, ReactNode } from "react";
import type { LayoutNode } from "@/lib/page-layout";
import { withHeaderDefaults, type HeaderMenuItem, type HeaderMobileMenu } from "@/lib/header-config";
import { withHeroDefaults } from "@/lib/hero-config";
import { withCardsDefaults } from "@/lib/cards-config";
import { withCtaDefaults } from "@/lib/cta-config";
import { withFooterDefaults } from "@/lib/footer-config";
import { withFloatingDefaults } from "@/lib/floating-config";
import { CardsFrame } from "./cards-frame";
import { CtaFrame } from "./cta-frame";
import { FloatingFrame, floatPos } from "./floating-frame";
import { FooterFrame } from "./footer-frame";
import { HeaderFrame } from "./header-frame";
import { HeroFrame } from "./hero-frame";
import { BlockFrame } from "./block-frames";
import { phoneBlocks } from "./block-registry";
import { blockPadding, specOf } from "@/lib/blocks";
import { withBlockDefaults } from "@/lib/block-schema";

// Thumbnail box in the style popover; each stage is centered and scaled to fit it, taken out of
// layout so its artboard-size box never widens the popover.
const box = { w: 232, h: 116 };
const fake = <div className="lb-thumb-fill" aria-hidden><i /><i /><i /></div>;

// A live, shrunken render of a component in one style, painted with the current palette.
// Headers open their first menu so the submenu frame is visible at a glance.
export function PresetThumb({ node, menu, items }: { node: LayoutNode; menu: HeaderMobileMenu; items: HeaderMenuItem[] }) {
  let stage = { w: 1440, h: 720 };
  let content: ReactNode = null;
  if (node.kind === "header") {
    // Headers are a thin bar at full PC width, so their stage is narrower to zoom in on the menu.
    stage = { w: 1040, h: 520 };
    const header = withHeaderDefaults(node.header ?? { items }, menu);
    const side = header.placement !== "top";
    content = side ? <div className="lb-thumb-row" data-side={header.placement}><div className="lb-thumb-node lb-thumb-sidebar"><HeaderFrame config={header} mobile={false} preview /></div>{fake}</div>
      : <><div className="lb-thumb-node lb-thumb-top"><HeaderFrame config={header} mobile={false} preview /></div>{header.surface === "transparent" ? <div className="lb-thumb-media" /> : fake}</>;
  } else if (node.kind === "hero") content = <HeroFrame config={withHeroDefaults(node.hero)} mobile={false} viewport={stage.h} />;
  else if (node.kind === "cards") content = <CardsFrame config={withCardsDefaults(node.cards)} mobile={false} />;
  else if (node.kind === "cta") content = <><div className="lb-thumb-spacer" />{<CtaFrame config={withCtaDefaults(node.cta)} mobile={false} />}<div className="lb-thumb-spacer" /></>;
  else if (node.kind === "footer") content = <>{fake}<FooterFrame config={withFooterDefaults(node.footer)} menu={items} mobile={false} /></>;
  else if (node.kind === "floating") {
    const floating = withFloatingDefaults(node.floating);
    // A tab bar only exists on the phone, so its style is shown on a phone-sized stage.
    const phone = floating.kind === "tabbar";
    if (phone) stage = { w: 375, h: 720 };
    content = <>{fake}<div className="lb-thumb-float" style={floatPos(floating, phone)}><FloatingFrame config={floating} mobile={phone} /></div></>;
  }
  const spec = specOf(node.kind);
  if (spec) {
    // App patterns read as a phone screen; layers are shown over a stand-in page.
    const phone = phoneBlocks.has(spec.kind);
    if (phone) stage = { w: 375, h: 720 };
    const [desk, mob] = blockPadding[spec.kind] ?? [[0, 0, 0, 0], [0, 0, 0, 0]];
    const pad = phone ? mob : desk;
    const frame = <BlockFrame kind={spec.kind} config={withBlockDefaults(spec, node.block)} mobile={phone} />;
    content = spec.place === "overlay" ? <>{fake}<div className="lb-thumb-layer">{frame}</div></>
      : <div className="lb-thumb-block" style={{ "--np-t": `${pad[0]}px`, "--np-r": `${pad[1]}px`, "--np-b": `${pad[2]}px`, "--np-l": `${pad[3]}px` } as CSSProperties}>{frame}</div>;
  }
  const scale = Math.min(box.w / stage.w, box.h / stage.h);
  return <span className="lb-thumb" aria-hidden><span className="lb-thumb-stage" style={{ width: stage.w, height: stage.h, transform: `translate(-50%, -50%) scale(${scale})` } as CSSProperties}>{content}</span></span>;
}
