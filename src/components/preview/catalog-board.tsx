"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Minus, Moon, Plus, Search, SendHorizontal, Star, Sun } from "lucide-react";
import { AppleArtwork } from "@/components/flow/apple-artwork";
import { DataChartShowcase } from "@/components/preview/catalog-charts";
import { FeedbackShowcase, type AlertTone } from "@/components/preview/catalog-feedback";
import { SelectableTableShowcase } from "@/components/preview/catalog-table";
import { CatalogExtendedShowcase } from "@/components/preview/catalog-extended";
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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [multiSelectOpen, setMultiSelectOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["design", "development"]);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(3);
  const [sliderValue, setSliderValue] = useState(42);
  const [feedbackAlert, setFeedbackAlert] = useState<AlertTone | null>(null);
  const chatThreadRef = useRef<HTMLDivElement>(null);
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
  const filteredSearchOptions = k.searchOptions.filter((option) =>
    option.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
  );
  const multiSelectOptions = [
    { value: "design", label: k.multiSelectDesign },
    { value: "development", label: k.multiSelectDevelopment },
    { value: "marketing", label: k.multiSelectMarketing },
    { value: "research", label: k.multiSelectResearch },
  ];
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
        <section className="kit-docs-section kit-docs-section-wide kit-button-showcase">
          <div className="kit-button-sections">
            <section className="kit-button-column">
              <h2># {b.color}</h2>
              <div className="kit-docs-preview">
                <ButtonRow look="solid" tones={COLOR_TONES} labels={labels} onToneAction={showToneAlert} />
              </div>
            </section>

            <section className="kit-button-column">
              <h2># {b.soft}</h2>
              <div className="kit-docs-preview">
                <ButtonRow look="soft" tones={COLOR_TONES} labels={labels} onToneAction={showToneAlert} />
              </div>
            </section>

            <section className="kit-button-column">
              <h2># {b.outline}</h2>
              <div className="kit-docs-preview">
                <ButtonRow look="outline" tones={COLOR_TONES} labels={labels} onToneAction={showToneAlert} />
              </div>
            </section>

            <section className="kit-button-column kit-feedback-column">
              <h2># {k.feedbackActions}</h2>
              <div className="kit-docs-preview">
                <FeedbackShowcase
                  viewportRef={viewportRef}
                  alert={feedbackAlert}
                  onDismissAlert={() => setFeedbackAlert(null)}
                />
              </div>
            </section>
          </div>
        </section>

        <section className="kit-docs-section kit-docs-section-wide">
          <h2># {k.formControls}</h2>
          <div className="kit-docs-preview kit-component-row">
            <form className="kit-login-card" onSubmit={login}>
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
            <div className="kit-choice-preview">
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

            <article className="kit-chat-card">
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
                <Textarea
                  className="kit-chat-input"
                  rows={1}
                  value={chatDraft}
                  placeholder={k.chatPlaceholder}
                  aria-label={k.chatPlaceholder}
                  onChange={(event) => setChatDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
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

            <article className="kit-input-set-card">
              <div className="kit-input-set-body">
                <div className="kit-control-group">
                  <span className="kit-control-label">{k.searchPlaceholder}</span>
                  <div
                    className="kit-search-combobox"
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false);
                    }}
                  >
                    <Search aria-hidden />
                    <input
                      role="combobox"
                      aria-expanded={searchOpen}
                      aria-controls="kit-search-options"
                      aria-autocomplete="list"
                      value={searchQuery}
                      placeholder={k.searchPlaceholder}
                      onFocus={() => setSearchOpen(true)}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setSearchOpen(true);
                      }}
                    />
                    {searchOpen ? (
                      <div id="kit-search-options" className="kit-search-options" role="listbox">
                        {filteredSearchOptions.length > 0 ? filteredSearchOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={searchQuery === option}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setSearchQuery(option);
                              setSearchOpen(false);
                            }}
                          >
                            {option}
                          </button>
                        )) : <p>{k.noSearchResults}</p>}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="kit-control-group">
                  <span className="kit-control-label">{k.multiSelect}</span>
                  <div
                    className="kit-multi-select"
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) setMultiSelectOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className="kit-multi-select-trigger"
                      aria-expanded={multiSelectOpen}
                      aria-controls="kit-multi-select-options"
                      onClick={() => setMultiSelectOpen((value) => !value)}
                    >
                      <span>
                        {selectedCategories.length > 0
                          ? k.multiSelectCount.replace("{n}", String(selectedCategories.length))
                          : k.multiSelectPlaceholder}
                      </span>
                      <ChevronDown aria-hidden />
                    </button>
                    {multiSelectOpen ? (
                      <div id="kit-multi-select-options" className="kit-multi-select-options" role="listbox" aria-multiselectable="true">
                        {multiSelectOptions.map((option) => {
                          const selected = selectedCategories.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => setSelectedCategories((current) => (
                                selected
                                  ? current.filter((value) => value !== option.value)
                                  : [...current, option.value]
                              ))}
                            >
                              <span className="kit-multi-select-check" data-selected={selected || undefined}>
                                {selected ? <Check aria-hidden /> : null}
                              </span>
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="kit-control-group">
                  <span className="kit-control-label">{k.quantity}</span>
                  <div className="kit-quantity-control">
                    <button
                      type="button"
                      aria-label={k.decreaseQuantity}
                      disabled={quantity <= 0}
                      onClick={() => setQuantity((value) => Math.max(0, value - 1))}
                    >
                      <Minus aria-hidden />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={quantity}
                      aria-label={k.quantity}
                      onChange={(event) => setQuantity(Math.max(0, Number(event.target.value) || 0))}
                    />
                    <button type="button" aria-label={k.increaseQuantity} onClick={() => setQuantity((value) => value + 1)}>
                      <Plus aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="kit-control-group">
                  <span className="kit-control-label">{k.rating}</span>
                  <div className="kit-rating" aria-label={k.rating}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} / 5`}
                        aria-pressed={rating === value}
                        data-active={value <= rating || undefined}
                        onClick={() => setRating(value)}
                      >
                        <Star aria-hidden />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="kit-control-group">
                  <span className="kit-control-label kit-slider-label">
                    <span>{k.slider}</span>
                    <span>{sliderValue}</span>
                  </span>
                  <Slider
                    value={[sliderValue]}
                    onValueChange={(value) => setSliderValue(typeof value === "number" ? value : (value[0] ?? 0))}
                  />
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="kit-docs-section kit-docs-section-wide">
          <h2># {k.extendedKit.title}</h2>
          <div className="kit-docs-preview kit-wide-preview">
            <CatalogExtendedShowcase />
          </div>
        </section>

        <section className="kit-docs-section kit-docs-section-wide">
          <h2># {k.dataCharts}</h2>
          <div className="kit-docs-preview kit-wide-preview">
            <DataChartShowcase />
          </div>
        </section>

        <section className="kit-docs-section kit-docs-section-wide">
          <h2># {k.selectableTable}</h2>
          <div className="kit-docs-preview kit-wide-preview">
            <SelectableTableShowcase />
          </div>
        </section>

        {loginToastVisible ? (
          <div className="kit-login-toast" role="status" aria-live="polite">
            {k.loginSuccess}
          </div>
        ) : null}
      </div>
    </div>
  );
}
