"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Moon, Sun } from "lucide-react";
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

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

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
          <div className="kit-docs-preview kit-form-preview">
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
          </div>
        </section>

        <section className="kit-docs-section kit-docs-section-wide">
          <div className="kit-docs-preview kit-choice-preview">
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
