"use client";

import { useId, useState, type CSSProperties } from "react";
import { Check, Copy } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ProtectedCodeView } from "@/components/protected-code-view";
import type { LibraryItemId } from "./catalog";
import type { ComponentOptions } from "./settings";
import { componentSources, generateComponentCode, generateHtmlCode } from "./code";

const labels = { html: "HTML + CSS", react: "React" };
const formats = ["html", "react"] as const;

function sourceFor(id: LibraryItemId, options: ComponentOptions, ko: boolean, theme: CSSProperties, format: keyof typeof labels) {
  return format === "react" ? generateComponentCode(id, options, ko, theme) : generateHtmlCode(id, options, ko, theme);
}

export function ComponentCodePanel({ id, options, theme, ko, onCopied }: { id: LibraryItemId; options: ComponentOptions; theme: CSSProperties; ko: boolean; onCopied?: () => void }) {
  const { user, signIn } = useAuth();
  const [format, setFormat] = useState<keyof typeof labels>("react");
  const panelId = useId();
  const source = componentSources(id, options, ko, theme);
  const code = sourceFor(id, options, ko, theme, format);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const copied = copiedCode === code;
  async function copy() {
    try {
      const current = user ?? await signIn();
      if (!current) return;
      const next = sourceFor(id, options, ko, theme, format);
      await navigator.clipboard.writeText(next);
      setCopiedCode(next);
      setFailed(false);
      onCopied?.();
    } catch { setFailed(true); }
  }
  return <section className="lk-code-panel copy-protected" aria-label={ko ? "컴포넌트 코드" : "Component code"}>
    <header><div className="lk-code-tabs" role="tablist" aria-label={ko ? "코드 형식" : "Code format"}>{formats.map(value => <button type="button" key={value} role="tab" id={`${panelId}-${value}`} aria-selected={format === value} aria-controls={panelId} tabIndex={format === value ? 0 : -1} onClick={() => { setFormat(value); setFailed(false); }} onKeyDown={event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault(); const next = event.key === "Home" ? "html" : event.key === "End" ? "react" : formats[(formats.indexOf(value) + (event.key === "ArrowRight" ? 1 : formats.length - 1)) % formats.length];
      setFormat(next); setFailed(false); document.getElementById(`${panelId}-${next}`)?.focus();
    }}>{labels[value]}</button>)}</div><button type="button" className="lk-copy-code" onClick={() => { void copy(); }}>{copied ? <Check size={14} /> : <Copy size={14} />}{ko ? user ? copied ? "복사됨" : "코드 복사" : "로그인 후 복사" : user ? copied ? "Copied" : "Copy code" : "Sign in to copy"}</button></header>
    <p className="lk-code-hint">{user ? ko ? "설정과 팔레트가 실제 소스에 반영됩니다. 복사 버튼으로 가져가세요." : "Settings and palette are included in the source. Use the copy button." : ko ? "코드는 바로 볼 수 있어요. 복사하려면 로그인해 주세요." : "You can read the code now. Sign in to copy it."}</p>
    <p className="lk-code-hint">{format === "react" ? ko ? "CSS가 포함된 컴포넌트 한 파일입니다. 추가 패키지 설치 없이 사용하세요." : "One component file with CSS included. No extra packages." : source.js ? ko ? "HTML·CSS와 필요한 JavaScript가 포함되어 있습니다. 복사 버튼으로 한 번에 가져가세요." : "Includes HTML, CSS and the required JavaScript. Use the copy button." : ko ? "HTML과 CSS가 포함되어 있습니다. 복사 버튼으로 한 번에 가져가세요." : "Includes HTML and CSS. Use the copy button."}</p>
    <div role="tabpanel" id={panelId} aria-labelledby={`${panelId}-${format}`}><ProtectedCodeView code={code} label={ko ? `${labels[format]} 코드` : `${labels[format]} code`} /></div>
    <span className="lk-copy-status" role="status">{failed ? ko ? "복사하지 못했습니다. 로그인한 뒤 복사 버튼을 다시 눌러 주세요." : "Could not copy. Sign in and use the copy button again." : copied ? ko ? "코드를 복사했습니다." : "Code copied." : ""}</span>
  </section>;
}
