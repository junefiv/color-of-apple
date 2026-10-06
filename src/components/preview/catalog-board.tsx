"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2, Moon, SendHorizontal, Sun } from "lucide-react";
import { AppleArtwork } from "@/components/flow/apple-artwork";
import { DataChartShowcase } from "@/components/preview/catalog-charts";
import { FeedbackShowcase, type AlertTone } from "@/components/preview/catalog-feedback";
import { SelectableTableShowcase } from "@/components/preview/catalog-table";
import { CatalogExtendedShowcase } from "@/components/preview/catalog-extended";
import { CatalogProductShowcase } from "@/components/preview/catalog-products";
import { ConceptSamples } from "@/components/preview/concept-samples";
import { useCopy } from "@/hooks/use-copy";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const COLOR_TONES = ["neutral", "primary", "secondary", "accent", "info", "success", "warning", "error"] as const;

function ButtonRow({
  look,
  tones,
  labels,
  onToneAction,
}: {
  look: "solid" | "soft" | "outline";
  tones: readonly string[];
  labels: Record<string, string>;
  onToneAction?: (tone: string) => void;
}) {
  return (
    <div className="kit-btn-row">
      {tones.map((tone) => (
        <button
          key={`${look}-${tone}`}
          type="button"
          className="kit-btn"
          data-look={look}
          data-tone={tone}
          onClick={() => onToneAction?.(tone)}
        >
          {labels[tone]}
        </button>
      ))}
    </div>
  );
}

export function CatalogBoard({ platform }: { platform: "web" | "app" }) {
  const copy = useCopy();
  const b = copy.preview.buttons;
  const k = copy.preview.kit;
  const portalRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [loginId, setLoginId] = useState("");
  const [emailDomain, setEmailDomain] = useState<string | null>("gmail.com");
  const [customDomain, setCustomDomain] = useState("");
  const [password, setPassword] = useState("");
  const [loginIdTouched, setLoginIdTouched] = useState(false);
  const [domainTouched, setDomainTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "sent">("idle");
  const [loginToastVisible, setLoginToastVisible] = useState(false);
  const submitTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [nightMode, setNightMode] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [blinkEnabled, setBlinkEnabled] = useState(true);
  const [chatDraft, setChatDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; side: "me" | "other"; text: string }>>([]);
  const [pendingReplies, setPendingReplies] = useState(0);
  const [feedbackAlert, setFeedbackAlert] = useState<AlertTone | null>(null);
  const chatThreadRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatMessageIdRef = useRef(0);
  const chatReplyIndexRef = useRef(0);
  const chatReplyTimersRef = useRef<number[]>([]);
  const passwordIsValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,16}$/.test(password);
  const loginIdHasError = loginIdTouched && !/^[A-Za-z0-9._-]+$/.test(loginId.trim());
  const domainHasError = domainTouched && (
    !emailDomain || (emailDomain === "custom" && !/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(customDomain.trim()))
  );
  const passwordHasError = passwordTouched && !passwordIsValid;
  const formLocked = submitState !== "idle";

  useLayoutEffect(() => {
    const grid = portalRef.current;
    if (!grid) return;

    const itemSelector = [
      ".kit-tile",
      ".kit-login-card",
      ".kit-choice-preview",
      ".kit-chat-card",
      ".kit-demo-card",
      ".kit-product-card",
      ".kit-span-full",
    ].join(",");
    const items = Array.from(grid.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.matches(itemSelector),
    );
    let animationFrame = 0;

    const fitItems = () => {
      const styles = window.getComputedStyle(grid);
      const rowHeight = Number.parseFloat(styles.gridAutoRows);
      const rowGap = Number.parseFloat(styles.rowGap);
      if (!Number.isFinite(rowHeight) || rowHeight <= 0) return;

      items.forEach((item) => {
        item.style.gridRowEnd = "auto";
      });
      items.forEach((item) => {
        const height = item.getBoundingClientRect().height;
        const span = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));
        item.style.gridRowEnd = `span ${span}`;
      });
    };

    const queueFit = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(fitItems);
    };
    const resizeObserver = new ResizeObserver(queueFit);
    resizeObserver.observe(grid);
    items.forEach((item) => resizeObserver.observe(item));
    queueFit();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      items.forEach((item) => item.style.removeProperty("grid-row-end"));
    };
  }, [platform]);

  function showToneAlert(tone: string) {
    if (tone === "error") setFeedbackAlert("danger");
    else if (tone === "info" || tone === "success" || tone === "warning") setFeedbackAlert(tone);
  }

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      chatReplyTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const thread = chatThreadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [chatMessages, pendingReplies]);

  useEffect(() => {
    const input = chatInputRef.current;
    if (!input) return;
    input.scrollLeft = input.scrollWidth;
  }, [chatDraft]);

  function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginIdTouched(true);
    setDomainTouched(true);
    setPasswordTouched(true);

    const domainIsValid = emailDomain && (
      emailDomain !== "custom" || /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(customDomain.trim())
    );
    if (!/^[A-Za-z0-9._-]+$/.test(loginId.trim()) || !domainIsValid || !passwordIsValid) return;

    setSubmitState("loading");
    submitTimerRef.current = window.setTimeout(() => {
      setSubmitState("sent");
      submitTimerRef.current = null;
      setLoginToastVisible(true);
      toastTimerRef.current = window.setTimeout(() => {
        setLoginToastVisible(false);
        toastTimerRef.current = null;
      }, 3000);
    }, 900);
  }

  function resetLogin() {
    if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    submitTimerRef.current = null;
    toastTimerRef.current = null;
    setLoginId("");
    setEmailDomain("gmail.com");
    setCustomDomain("");
    setPassword("");
    setLoginIdTouched(false);
    setDomainTouched(false);
    setPasswordTouched(false);
    setSubmitState("idle");
    setLoginToastVisible(false);
  }

  function sendChat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;

    chatMessageIdRef.current += 1;
    setChatMessages((messages) => [...messages, { id: chatMessageIdRef.current, side: "me", text }]);
    setChatDraft("");
    setPendingReplies((count) => count + 1);

    const reply = k.chatReplies[chatReplyIndexRef.current % k.chatReplies.length];
    chatReplyIndexRef.current += 1;
    const timer = window.setTimeout(() => {
      chatMessageIdRef.current += 1;
      setChatMessages((messages) => [...messages, { id: chatMessageIdRef.current, side: "other", text: reply }]);
      setPendingReplies((count) => Math.max(0, count - 1));
      chatReplyTimersRef.current = chatReplyTimersRef.current.filter((item) => item !== timer);
    }, 650);
    chatReplyTimersRef.current.push(timer);
  }
  const labels = {
    neutral: b.neutral,
    primary: b.primary,
    secondary: b.secondary,
    accent: b.accent,
    info: b.info,
    success: b.success,
    warning: b.warning,
    error: b.error,
  };

  return (
    <div ref={viewportRef} className="preview-viewport">
      <div ref={portalRef} className="preview-scroll kit-docs" data-platform={platform}>
        <ConceptSamples />
        <article className="kit-tile">
          <ButtonRow look="solid" tones={COLOR_TONES} labels={labels} onToneAction={showToneAlert} />
        </article>
        <article className="kit-tile">
          <ButtonRow look="soft" tones={COLOR_TONES} labels={labels} onToneAction={showToneAlert} />
        </article>
        <article className="kit-tile">
          <ButtonRow look="outline" tones={COLOR_TONES} labels={labels} onToneAction={showToneAlert} />
        </article>
        <article className="kit-tile kit-feedback-tile">
          <FeedbackShowcase
            viewportRef={viewportRef}
            alert={feedbackAlert}
            onDismissAlert={() => setFeedbackAlert(null)}
          />
        </article>

            <form className="kit-login-card kit-span-rows" onSubmit={login}>
              <header className="kit-login-header">
                <strong>{k.loginTitle}</strong>
                <small>{k.loginDescription}</small>
              </header>
              <div className="kit-field-grid">
                <div className="kit-field-group">
                  <Label htmlFor="kit-login-id">{k.loginEmail}</Label>
                  <div className="kit-email-composer">
                    <Input
                      id="kit-login-id"
                      className="kit-field"
                      value={loginId}
                      placeholder={k.loginIdPlaceholder}
                      disabled={formLocked}
                      aria-invalid={loginIdHasError}
                      aria-describedby="kit-login-email-help"
                      autoComplete="username"
                      onChange={(event) => setLoginId(event.target.value)}
                      onBlur={() => setLoginIdTouched(true)}
                    />
                    <span aria-hidden>@</span>
                    <Select
                      value={emailDomain}
                      onValueChange={(value) => {
                        setEmailDomain(value);
                        setDomainTouched(false);
                      }}
                      disabled={formLocked}
                    >
                      <SelectTrigger
                        className="kit-field kit-select-trigger kit-domain-trigger"
                        aria-label={k.emailDomain}
                        aria-invalid={domainHasError}
                        onBlur={() => setDomainTouched(true)}
                      >
                        <SelectValue placeholder={k.emailDomain} />
                      </SelectTrigger>
                      <SelectContent portalContainer={portalRef} className="kit-select-content">
                        <SelectItem value="gmail.com">gmail.com</SelectItem>
                        <SelectItem value="naver.com">naver.com</SelectItem>
                        <SelectItem value="daum.net">daum.net</SelectItem>
                        <SelectItem value="custom">{k.domainCustom}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {emailDomain === "custom" ? (
                    <Input
                      className="kit-field kit-custom-domain"
                      value={customDomain}
                      placeholder={k.customDomainPlaceholder}
                      disabled={formLocked}
                      aria-label={k.customDomainPlaceholder}
                      aria-invalid={domainHasError}
                      aria-describedby="kit-login-email-help"
                      inputMode="email"
                      onChange={(event) => setCustomDomain(event.target.value)}
                      onBlur={() => setDomainTouched(true)}
                    />
                  ) : null}
                  <p id="kit-login-email-help" className="kit-field-help" data-error={(loginIdHasError || domainHasError) || undefined}>
                    {loginIdHasError ? k.loginIdError : domainHasError ? k.emailDomainError : k.loginEmailHint}
                  </p>
                </div>

                <div className="kit-field-group">
                  <Label htmlFor="kit-login-password">{k.loginPassword}</Label>
                  <Input
                    id="kit-login-password"
                    className="kit-field"
                    type="password"
                    value={password}
                    placeholder={k.passwordPlaceholder}
                    disabled={formLocked}
                    aria-invalid={passwordHasError}
                    aria-describedby="kit-login-password-help"
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                  />
                  <p id="kit-login-password-help" className="kit-field-help" data-error={passwordHasError || undefined}>
                    {passwordHasError ? k.passwordError : k.passwordRule}
                  </p>
                </div>
              </div>

              <div className="kit-login-actions">
                <button
                  type="submit"
                  className="kit-btn"
                  data-look="solid"
                  data-tone="primary"
                  disabled={formLocked}
                >
                  {submitState === "loading" ? <Loader2 className="kit-send-spinner" aria-hidden /> : null}
                  {submitState === "loading" ? k.loggingIn : submitState === "sent" ? k.loggedIn : k.login}
                </button>
                {submitState === "sent" ? (
                  <button type="button" className="kit-btn" data-look="outline" data-tone="neutral" onClick={resetLogin}>
                    {k.loginReset}
                  </button>
                ) : null}
              </div>
            </form>
            <div className="kit-choice-preview kit-span-rows">
              <div className="kit-a11y-card" data-night={nightMode || undefined}>
                <div className="kit-a11y-theme-row">
                  <Switch
                    className="kit-theme-switch"
                    checked={nightMode}
                    onCheckedChange={setNightMode}
                    aria-label={k.nightMode}
                    icon={nightMode ? <Moon key="moon" /> : <Sun key="sun" />}
                  />
                </div>

                <div className="kit-a11y-grid">
                  <fieldset className="kit-a11y-setting">
                  <legend>{k.fontSize}</legend>
                  <RadioGroup value={fontSize} onValueChange={setFontSize} className="kit-radio-row">
                    {[
                      ["small", k.fontSmall],
                      ["medium", k.fontMedium],
                      ["large", k.fontLarge],
                    ].map(([value, label]) => (
                      <label key={value} className="kit-choice-row">
                        <RadioGroupItem value={value} />
                        <span>{label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <p className="kit-font-sample" data-size={fontSize}>
                    {k.fontSample}
                  </p>
                  </fieldset>

                  <fieldset className="kit-a11y-setting">
                  <legend>{k.motionSettings}</legend>
                  <div className="kit-motion-layout">
                    <div className="kit-motion-options">
                      <label className="kit-choice-row">
                        <Checkbox checked={motionEnabled} onCheckedChange={setMotionEnabled} />
                        <span>{k.appleMotion}</span>
                      </label>
                      <label className="kit-choice-row">
                        <Checkbox checked={blinkEnabled} onCheckedChange={setBlinkEnabled} />
                        <span>{k.appleBlink}</span>
                      </label>
                    </div>
                    <div
                      className="kit-a11y-apple"
                      data-motion={motionEnabled || undefined}
                      data-blink={blinkEnabled || undefined}
                      style={{ "--apple": "var(--color-primary-default)" } as React.CSSProperties}
                      role="img"
                      aria-label={k.applePreview}
                    >
                      <AppleArtwork />
                    </div>
                  </div>
                  </fieldset>
                </div>
              </div>
            </div>

            <article className="kit-chat-card kit-span-rows">
              <header className="kit-chat-header">
                <span className="kit-chat-avatar" aria-hidden>M</span>
                <span className="kit-chat-profile">
                  <strong>{k.chatTitle}</strong>
                  <small>{k.chatStatus}</small>
                </span>
              </header>

              <div ref={chatThreadRef} className="kit-chat-thread" aria-live="polite">
                <div className="kit-chat-message" data-side="other">
                  <span>{k.chatGreeting}</span>
                </div>
                {chatMessages.map((message) => (
                  <div key={message.id} className="kit-chat-message" data-side={message.side}>
                    <span>{message.text}</span>
                  </div>
                ))}
                {pendingReplies > 0 ? (
                  <div className="kit-chat-message kit-chat-typing" data-side="other">
                    <span>{k.chatTyping}</span>
                  </div>
                ) : null}
              </div>

              <form className="kit-chat-composer" onSubmit={sendChat}>
                <input
                  ref={chatInputRef}
                  className="kit-chat-input"
                  value={chatDraft}
                  placeholder={k.chatPlaceholder}
                  aria-label={k.chatPlaceholder}
                  onChange={(event) => {
                    setChatDraft(event.target.value);
                    event.currentTarget.scrollLeft = event.currentTarget.scrollWidth;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <button type="submit" className="kit-chat-send" disabled={!chatDraft.trim()} aria-label={k.chatSend}>
                  <SendHorizontal aria-hidden />
                </button>
              </form>
            </article>

        <CatalogExtendedShowcase />

        <CatalogProductShowcase />

        <div className="kit-span-full kit-data-section">
          <DataChartShowcase />
        </div>
        <div className="kit-span-full kit-data-section">
          <SelectableTableShowcase />
        </div>
      </div>
      {loginToastVisible ? (
        <div className="kit-login-toast" role="status" aria-live="polite">
          {k.loginSuccess}
        </div>
      ) : null}
    </div>
  );
}
