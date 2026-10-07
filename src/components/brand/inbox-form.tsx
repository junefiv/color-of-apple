"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uiToast } from "@/components/ui/toast";
import {
  INBOX_COOLDOWN_MS,
  INBOX_COOLDOWN_STORAGE_KEY,
  inquiryTopics,
  joinRoles,
  type InquiryTopic,
  type JoinRole,
} from "@/lib/inbox/schema";
import { useMatchuStore } from "@/lib/store";

const controlClass = "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const topicLabels: Record<InquiryTopic, { ko: string; en: string }> = {
  general: { ko: "일반 문의", en: "General" },
  collaboration: { ko: "협업 문의", en: "Collaboration" },
  bug: { ko: "오류 제보", en: "Bug report" },
  feature: { ko: "기능 제안", en: "Feature idea" },
  billing: { ko: "구독·결제", en: "Billing" },
  press: { ko: "소개·인터뷰", en: "Press" },
  other: { ko: "기타", en: "Other" },
};

const roleLabels: Record<JoinRole, { ko: string; en: string }> = {
  engineering: { ko: "개발", en: "Engineering" },
  design: { ko: "디자인", en: "Design" },
  product: { ko: "기획·제품", en: "Product" },
  marketing: { ko: "마케팅", en: "Marketing" },
  operations: { ko: "운영", en: "Operations" },
  other: { ko: "그 밖의 역할", en: "Another role" },
};

function waitLabel(ms: number, isKo: boolean) {
  const total = Math.max(1, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (isKo) return minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function InboxForm({ mode, layout = "page", onSent }: { mode: "join" | "inquiry"; layout?: "page" | "dialog"; onSent?: () => void }) {
  const locale = useMatchuStore((state) => state.locale);
  const isKo = locale === "ko";
  const [topic, setTopic] = useState<InquiryTopic>("general");
  const [role, setRole] = useState<JoinRole>("engineering");
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(INBOX_COOLDOWN_STORAGE_KEY));
    if (Number.isFinite(stored)) setUntil(stored);
  }, []);

  useEffect(() => {
    if (until <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [until]);

  const remaining = Math.max(0, until - now);
  const cooling = remaining > 0;

  function setField(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function rememberCooldown(retryAfterMs: number) {
    const next = Date.now() + retryAfterMs;
    window.localStorage.setItem(INBOX_COOLDOWN_STORAGE_KEY, String(next));
    setUntil(next);
    setNow(Date.now());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || cooling) return;
    setPending(true);
    setError("");
    const payload = mode === "join"
      ? { kind: "join", locale, name: values.name ?? "", email: values.email ?? "", link: values.link ?? "", message: values.message ?? "", role }
      : { kind: "inquiry", locale, ...values, topic };

    try {
      const response = await fetch("/api/inbox", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null) as { error?: string; retryAfterMs?: number } | null;
      if (response.status === 429) {
        rememberCooldown(typeof data?.retryAfterMs === "number" ? data.retryAfterMs : INBOX_COOLDOWN_MS);
        setError(isKo ? "방금 보낸 내용이 있어요. 잠시 후 다시 보낼 수 있습니다." : "A message was just sent. You can send another shortly.");
        return;
      }
      if (!response.ok) {
        setError(isKo ? "보내지 못했습니다. 내용을 확인한 뒤 다시 시도해 주세요." : "Could not send this. Check the form and try again.");
        return;
      }
      rememberCooldown(INBOX_COOLDOWN_MS);
      setValues({});
      setTopic("general");
      setRole("engineering");
      uiToast.success(isKo ? "전달했습니다. 입력한 메일로 회신합니다." : "Sent. We will reply to the email you entered.", locale);
      onSent?.();
    } catch {
      setError(isKo ? "보내지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요." : "Could not send this. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const messagePlaceholder = mode === "join"
    ? (isKo ? "만들고 싶은 것, 해 본 일, 함께하고 싶은 이유를 적어 주세요." : "What you want to build, what you have made, and why you want to join.")
    : topic === "bug"
      ? (isKo ? "어떤 화면에서, 어떤 순서로, 무엇이 보였는지 적어 주세요." : "Which page, which steps, and what you saw.")
      : topic === "feature"
        ? (isKo ? "어떤 일을 더 쉽게 하고 싶은지 적어 주세요." : "What you want the product to make easier.")
        : topic === "collaboration"
          ? (isKo ? "어떤 협업을 제안하는지 적어 주세요." : "What you would like to work on together.")
          : (isKo ? "전하고 싶은 내용을 적어 주세요." : "Write your message.");

  return (
    <form className={layout === "dialog" ? "space-y-4" : "mt-8 space-y-5"} onSubmit={(event) => { void submit(event); }}>
      {mode === "inquiry" ? (
        <Field label={isKo ? "문의 종류" : "Topic"}>
          <select className={controlClass} value={topic} onChange={(event) => setTopic(event.target.value as InquiryTopic)}>
            {inquiryTopics.map((item) => <option key={item} value={item}>{topicLabels[item][locale]}</option>)}
          </select>
        </Field>
      ) : (
        <Field label={isKo ? "맡고 싶은 역할" : "Role"}>
          <select className={controlClass} value={role} onChange={(event) => setRole(event.target.value as JoinRole)}>
            {joinRoles.map((item) => <option key={item} value={item}>{roleLabels[item][locale]}</option>)}
          </select>
        </Field>
      )}
      <Field label={isKo ? "이름" : "Name"}>
        <Input required autoComplete="name" className="h-10" value={values.name ?? ""} onChange={(event) => setField("name", event.target.value)} />
      </Field>
      <Field label={isKo ? "회신받을 이메일" : "Email for our reply"}>
        <Input required type="email" autoComplete="email" className="h-10" value={values.email ?? ""} onChange={(event) => setField("email", event.target.value)} />
      </Field>
      {mode === "inquiry" && (topic === "collaboration" || topic === "press") ? (
        <Field label={isKo ? "소속" : "Organization"}>
          <Input required className="h-10" value={values.organization ?? ""} onChange={(event) => setField("organization", event.target.value)} />
        </Field>
      ) : null}
      {mode === "inquiry" && topic === "collaboration" ? (
        <Field label={isKo ? "참고 링크" : "Reference link"}>
          <Input className="h-10" inputMode="url" value={values.link ?? ""} onChange={(event) => setField("link", event.target.value)} />
        </Field>
      ) : null}
      {mode === "inquiry" && topic === "bug" ? (
        <Field label={isKo ? "문제가 있던 화면" : "Page"}>
          <Input required className="h-10" value={values.page ?? ""} onChange={(event) => setField("page", event.target.value)} />
        </Field>
      ) : null}
      {mode === "inquiry" && topic === "billing" ? (
        <>
          <Field label={isKo ? "영수증의 거래 번호" : "Transaction reference"}>
            <Input required className="h-10" value={values.reference ?? ""} onChange={(event) => setField("reference", event.target.value)} />
          </Field>
          <Field label={isKo ? "결제 이메일 (회신 메일과 다를 때)" : "Billing email, if different"}>
            <Input type="email" autoComplete="email" className="h-10" value={values.billingEmail ?? ""} onChange={(event) => setField("billingEmail", event.target.value)} />
          </Field>
        </>
      ) : null}
      {mode === "inquiry" && topic === "press" ? (
        <Field label={isKo ? "희망 일정" : "Deadline"}>
          <Input className="h-10" value={values.deadline ?? ""} onChange={(event) => setField("deadline", event.target.value)} />
        </Field>
      ) : null}
      {mode === "inquiry" && topic === "other" ? (
        <Field label={isKo ? "제목" : "Subject"}>
          <Input required className="h-10" value={values.subject ?? ""} onChange={(event) => setField("subject", event.target.value)} />
        </Field>
      ) : null}
      {mode === "join" ? (
        <Field label={isKo ? "작업물 링크" : "Work link"}>
          <Input className="h-10" inputMode="url" value={values.link ?? ""} onChange={(event) => setField("link", event.target.value)} />
        </Field>
      ) : null}
      <Field label={mode === "join" ? (isKo ? "소개" : "Introduction") : (isKo ? "내용" : "Message")}>
        <Textarea required className="min-h-28" placeholder={messagePlaceholder} value={values.message ?? ""} onChange={(event) => setField("message", event.target.value)} />
      </Field>
      {cooling ? <p className="text-sm leading-6" role="status">{isKo ? `${waitLabel(remaining, true)} 후에 다시 보낼 수 있습니다.` : `You can send again in ${waitLabel(remaining, false)}.`}</p> : null}
      {error ? <p className="text-sm leading-6 text-destructive" role="alert">{error}</p> : null}
      <button type="submit" disabled={pending || cooling} className="inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
        {pending ? (isKo ? "보내는 중…" : "Sending…") : (isKo ? "보내기" : "Send")}
      </button>
    </form>
  );
}
