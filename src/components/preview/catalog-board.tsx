"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Minus, Moon, Plus, Search, SendHorizontal, Star, Sun } from "lucide-react";
import { AppleArtwork } from "@/components/flow/apple-artwork";
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
const SOFT_TONES = ["default", ...COLOR_TONES.slice(1)] as const;

function ButtonRow({
  look,
  tones,
  labels,
}: {
  look: "solid" | "soft" | "outline" | "dash";
  tones: readonly string[];
  labels: Record<string, string>;
}) {
  return (
    <div className="kit-btn-row">
      {tones.map((tone) => (
        <button key={`${look}-${tone}`} type="button" className="kit-btn" data-look={look} data-tone={tone}>
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
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [planTouched, setPlanTouched] = useState(false);
  const [note, setNote] = useState("");
  const [noteTouched, setNoteTouched] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "sent">("idle");
  const [requestToastVisible, setRequestToastVisible] = useState(false);
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
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(3);
  const [sliderValue, setSliderValue] = useState(42);
  const chatThreadRef = useRef<HTMLDivElement>(null);
  const chatMessageIdRef = useRef(0);
  const chatReplyIndexRef = useRef(0);
  const chatReplyTimersRef = useRef<number[]>([]);
  const emailInvalid = emailTouched && !email.trim().includes("@");
  const planInvalid = planTouched && !plan;
  const noteInvalid = noteTouched && note.trim().length < 10;
  const emailHasError = emailInvalid;
  const planHasError = planInvalid;
  const noteHasError = noteInvalid;
  const formLocked = submitState !== "idle";
  const planLabels: Record<string, string> = {
    general: k.requestGeneral,
    planning: k.requestPlanning,
    partnership: k.requestPartnership,
  };
  const filteredSearchOptions = k.searchOptions.filter((option) =>
    option.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
  );

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

  function sendRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailTouched(true);
    setPlanTouched(true);
    setNoteTouched(true);

    if (!email.trim().includes("@") || !plan || note.trim().length < 10) return;

    setSubmitState("loading");
    submitTimerRef.current = window.setTimeout(() => {
      setSubmitState("sent");
      submitTimerRef.current = null;
      setRequestToastVisible(true);
      toastTimerRef.current = window.setTimeout(() => {
        setRequestToastVisible(false);
        toastTimerRef.current = null;
      }, 5000);
    }, 5000);
  }

  function resetRequest() {
    if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    submitTimerRef.current = null;
    toastTimerRef.current = null;
    setEmail("");
    setPlan(null);
    setNote("");
    setEmailTouched(false);
    setPlanTouched(false);
    setNoteTouched(false);
    setSubmitState("idle");
    setRequestToastVisible(false);
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
    default: b.default,
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
    <div className="preview-viewport">
      <div ref={portalRef} className="preview-scroll kit-docs" data-platform={platform}>
        <section className="kit-docs-section">
          <h2># {b.color}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="solid" tones={COLOR_TONES} labels={labels} />
          </div>
        </section>

        <section className="kit-docs-section">
          <h2># {b.soft}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="soft" tones={SOFT_TONES} labels={labels} />
          </div>
        </section>

        <section className="kit-docs-section">
          <h2># {b.outline}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="outline" tones={COLOR_TONES} labels={labels} />
          </div>
        </section>

        <section className="kit-docs-section">
          <h2># {b.dash}</h2>
          <div className="kit-docs-preview">
            <ButtonRow look="dash" tones={COLOR_TONES} labels={labels} />
          </div>
        </section>

        <section className="kit-docs-section kit-docs-section-wide">
          <h2># {k.formControls}</h2>
          <div className="kit-docs-preview kit-component-row">
            <form className="kit-request-card" onSubmit={sendRequest}>
              <div className="kit-field-grid">
              <div className="kit-field-group">
                <Label htmlFor="kit-email">{k.email}</Label>
                <Input
                  id="kit-email"
                  className="kit-field"
                  type="email"
                  value={email}
                  placeholder={k.emailPlaceholder}
                  disabled={formLocked}
                  aria-invalid={emailHasError}
                  aria-describedby="kit-email-help"
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => setEmailTouched(true)}
                />
                <p id="kit-email-help" className="kit-field-help" data-error={emailHasError || undefined}>
                  {emailHasError ? k.emailError : k.focusHint}
                </p>
              </div>

              <div className="kit-field-group">
                <Label htmlFor="kit-plan">{k.requestType}</Label>
                <Select value={plan} onValueChange={setPlan} disabled={formLocked}>
                  <SelectTrigger
                    id="kit-plan"
                    className="kit-field kit-select-trigger"
                    aria-invalid={planHasError}
                    aria-describedby="kit-plan-help"
                    onBlur={() => setPlanTouched(true)}
                  >
                    <SelectValue placeholder={k.requestTypePlaceholder}>
                      {plan ? planLabels[plan] : k.requestTypePlaceholder}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent portalContainer={portalRef} className="kit-select-content">
                    <SelectItem value="general">{k.requestGeneral}</SelectItem>
                    <SelectItem value="planning">{k.requestPlanning}</SelectItem>
                    <SelectItem value="partnership">{k.requestPartnership}</SelectItem>
                  </SelectContent>
                </Select>
                <p id="kit-plan-help" className="kit-field-help" data-error={planHasError || undefined}>
                  {planHasError ? k.requestTypeError : k.requestTypeHint}
                </p>
              </div>

              <div className="kit-field-group kit-field-group-wide">
                <div className="kit-field-label-row">
                  <Label htmlFor="kit-note">{k.requestMessage}</Label>
                  <span>{note.length}/120</span>
                </div>
                <Textarea
                  id="kit-note"
                  className="kit-field kit-textarea"
                  value={note}
                  maxLength={120}
                  placeholder={k.requestMessagePlaceholder}
                  disabled={formLocked}
                  aria-invalid={noteHasError}
                  aria-describedby="kit-note-help"
                  onChange={(event) => setNote(event.target.value)}
                  onBlur={() => setNoteTouched(true)}
                />
                <p id="kit-note-help" className="kit-field-help" data-error={noteHasError || undefined}>
                  {noteHasError ? k.requestMessageError : k.requestMessageHint}
                </p>
              </div>
              </div>

              <div className="kit-request-actions">
                <button
                  type="submit"
                  className="kit-btn"
                  data-look="solid"
                  data-tone="primary"
                  disabled={formLocked}
                >
                  {submitState === "loading" ? <Loader2 className="kit-send-spinner" aria-hidden /> : null}
                  {submitState === "loading" ? "SENDING" : submitState === "sent" ? "SENT" : "SEND"}
                </button>
                {submitState === "sent" ? (
                  <button type="button" className="kit-btn" data-look="outline" data-tone="neutral" onClick={resetRequest}>
                    {k.writeAgain}
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
              <header className="kit-input-set-header">
                <strong>{k.inputSetTitle}</strong>
              </header>

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

        {requestToastVisible ? (
          <div className="kit-request-toast" role="status" aria-live="polite">
            {k.requestSent}
          </div>
        ) : null}
      </div>
    </div>
  );
}
