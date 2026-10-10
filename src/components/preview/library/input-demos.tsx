"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { KitButton, KitField } from "./primitives";

export function TextInputsDemo({ ko }: { ko: boolean }) {
  const [number, setNumber] = useState(1);
  return <div className="lk-stack">
    <KitField label={ko ? "텍스트" : "Text input"}><input placeholder="Apple" /></KitField>
    <KitField label={ko ? "숫자" : "Number input"}><input type="number" min={0} max={99} value={number} onChange={event => setNumber(Math.max(0, Math.min(99, Number(event.target.value))))} /></KitField>
    <div className="lk-stack"><span>{ko ? "인증번호" : "Verification code"}</span><OtpDemo ko={ko} /></div>
  </div>;
}

export function SelectionDemo({ ko }: { ko: boolean }) {
  const id = useId();
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState("Comfort");
  const [enabled, setEnabled] = useState(false);
  return <div className="lk-stack lk-selection-samples">
    <fieldset><legend>{ko ? "체크박스" : "Checkbox"}</legend><label className="lk-choice"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />{ko ? "업데이트 받기" : "Receive updates"}</label></fieldset>
    <fieldset className="lk-stack"><legend>{ko ? "라디오 버튼" : "Radio buttons"}</legend>{["Compact", "Comfort"].map(option => <label key={option} className="lk-choice"><input type="radio" name={id} checked={radio === option} onChange={() => setRadio(option)} />{option}</label>)}</fieldset>
    <fieldset><legend>{ko ? "스위치" : "Switch"}</legend><label className="lk-choice"><input type="checkbox" role="switch" className="lk-switch" checked={enabled} onChange={event => setEnabled(event.target.checked)} />{ko ? "알림" : "Notifications"}</label></fieldset>
  </div>;
}

export function OtpDemo({ ko }: { ko: boolean }) {
  // Empty slots must stay empty: a space consumes maxLength and blocks the next digit.
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  function enter(index: number, text: string) {
    const numbers = text.replace(/\D/g, "").slice(0, 6 - index);
    setDigits(previous => {
      const next = [...previous];
      if (!numbers) next[index] = "";
      else Array.from(numbers).forEach((digit, offset) => { next[index + offset] = digit; });
      return next;
    });
    if (numbers) inputs.current[Math.min(index + numbers.length, 5)]?.focus();
  }
  return <div className="lk-stack"><div className="lk-otp" role="group" aria-label={ko ? "6자리 인증번호" : "Six-digit code"}>
    {digits.map((digit, index) => <input key={index} ref={input => { inputs.current[index] = input; }} aria-label={`${ko ? "인증번호" : "Digit"} ${index + 1}`} inputMode="numeric" pattern="[0-9]*" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={6} value={digit}
      onFocus={event => event.currentTarget.select()} onChange={event => enter(index, event.target.value)}
      onPaste={event => { event.preventDefault(); enter(index, event.clipboardData.getData("text")); }}
      onKeyDown={event => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); inputs.current[Math.max(0, Math.min(5, index + (event.key === "ArrowLeft" ? -1 : 1)))]?.focus(); }
        if (event.key === "Backspace" && !digit && index > 0) { event.preventDefault(); setDigits(previous => previous.map((value, i) => i === index - 1 ? "" : value)); inputs.current[index - 1]?.focus(); }
      }} />)}
  </div><output aria-live="polite">{digits.every(Boolean) ? (ko ? "입력 완료" : "Code entered") : (ko ? "6자리 숫자 입력" : "Enter six digits")}</output></div>;
}

function dateKey(year: number, month: number, day: number) { return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; }

export function CalendarDemo({ ko, value, onSelect }: { ko: boolean; value?: string; onSelect?: (value: string) => void }) {
  const [month, setMonth] = useState(() => { const now = value ? new Date(`${value}T12:00:00`) : new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const [selected, setSelected] = useState(value ?? "");
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const label = month.toLocaleDateString(ko ? "ko-KR" : "en-US", { year: "numeric", month: "long" });
  return <div className="lk-stack"><div className="lk-calendar-heading"><KitButton tone="soft" aria-label={ko ? "이전 달" : "Previous month"} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></KitButton><strong aria-live="polite">{label}</strong><KitButton tone="soft" aria-label={ko ? "다음 달" : "Next month"} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></KitButton></div>
    <div className="lk-calendar">{(ko ? ["일", "월", "화", "수", "목", "금", "토"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map(day => <span key={day}>{day}</span>)}
      {Array.from({ length: month.getDay() }, (_, index) => <span key={`blank${index}`} />)}
      {Array.from({ length: count }, (_, index) => { const key = dateKey(month.getFullYear(), month.getMonth(), index + 1); return <KitButton key={key} tone={key === (value ?? selected) ? "primary" : "soft"} aria-pressed={key === (value ?? selected)} aria-label={key} onClick={() => { setSelected(key); onSelect?.(key); }}>{index + 1}</KitButton>; })}
    </div>{!onSelect && <output>{selected || (ko ? "날짜를 선택하세요" : "Choose a date")}</output>}</div>;
}

export function DatePickerDemo({ ko }: { ko: boolean }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, maxHeight: 360 });
  const popup = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!open || !popup.current || !trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const height = popup.current.offsetHeight;
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    setPosition(previous => ({ ...previous, top: below >= height || below >= above ? rect.bottom + 8 : Math.max(12, rect.top - height - 8) }));
  }, [open]);
  useEffect(() => {
    if (!open) return;
    popup.current?.querySelector<HTMLButtonElement>('.lk-calendar button[aria-pressed="true"], .lk-calendar button')?.focus({ preventScroll: true });
    const dismiss = () => popup.current?.hidePopover();
    window.addEventListener("resize", dismiss);
    // Close rather than leave the floating calendar detached from its trigger.
    const scroller = trigger.current?.closest(".library-kit");
    scroller?.addEventListener("scroll", dismiss);
    return () => { window.removeEventListener("resize", dismiss); scroller?.removeEventListener("scroll", dismiss); };
  }, [open]);
  function show() {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect || !popup.current) return;
    const width = Math.min(280, window.innerWidth - 24);
    const below = window.innerHeight - rect.bottom - 12;
    const above = rect.top - 12;
    const height = Math.min(340, Math.max(below, above));
    setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: below >= 340 || below >= above ? rect.bottom + 8 : Math.max(12, rect.top - height - 8), maxHeight: height });
    popup.current.showPopover();
  }
  return <div className="lk-stack"><span>{ko ? "날짜" : "Date"}</span><span ref={trigger} className="lk-date-trigger"><KitButton tone="soft" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={() => open ? popup.current?.hidePopover() : show()}><CalendarDays size={16} />{value || (ko ? "날짜 선택" : "Choose a date")}</KitButton></span>
    <div ref={popup} id={id} popover="auto" role="dialog" aria-label={ko ? "날짜 선택 캘린더" : "Date selection calendar"} className="lk-floating lk-date-popup" style={position as CSSProperties} onToggle={event => { setOpen(event.newState === "open"); }} onKeyDown={event => {
      if (event.key === "Escape") trigger.current?.querySelector<HTMLButtonElement>("button")?.focus();
      if (event.key === "Tab") { const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button")); const first = buttons[0], last = buttons.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
    }}>
      {open && <CalendarDemo ko={ko} value={value} onSelect={date => { setValue(date); popup.current?.hidePopover(); trigger.current?.querySelector<HTMLButtonElement>("button")?.focus(); }} />}
    </div>
  </div>;
}
