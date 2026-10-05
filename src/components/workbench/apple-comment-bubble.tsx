"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type AnimationEvent, type CSSProperties } from "react";
import { appleCommentLines, colorsFromTheme } from "@/lib/color-commentary";
import { contrastRatio, resolveSurfaceInk, type SemanticTokens } from "@/lib/color-engine";
import { ensureReadable } from "@/lib/palette/adaptive";
import { prefersReducedMotion } from "@/lib/match-reveal";

const HOLD_MS = 4200;

export function AppleCommentBubble({
  theme,
  resetNonce,
  locale,
  prompt,
  intermittent = false,
}: {
  theme: SemanticTokens;
  resetNonce: number;
  locale: "ko" | "en";
  prompt: string;
  intermittent?: boolean;
}) {
  const comment = useSettledComment(theme, resetNonce, locale);
  const [visible, setVisible] = useState(!intermittent);
  useEffect(() => {
    if (!intermittent) { setVisible(true); return; }
    let timer: number;
    const show = () => {
      setVisible(true);
      timer = window.setTimeout(() => {
        setVisible(false);
        timer = window.setTimeout(show, 20000);
      }, 5000);
    };
    if (comment) show();
    else { setVisible(false); timer = window.setTimeout(show, 1800); }
    return () => window.clearTimeout(timer);
  }, [comment, intermittent, prompt]);
  const style = useMemo(() => {
    const surface = theme.surface.default;
    const brandColors = [theme.accent.default, theme.primary.default, theme.secondary.default];
    const strongest = brandColors.reduce((best, color) => contrastRatio(color, surface) > contrastRatio(best, surface) ? color : best);
    const fill = ensureReadable(strongest, [surface], 3);
    const bubble = resolveSurfaceInk(fill, 4.5);
    return {
      "--apple-bubble-fill": bubble.background,
      "--apple-bubble-ink": bubble.on,
      "--apple-bubble-accent": theme.accent.default,
    } as CSSProperties;
  }, [theme]);
  return <FlipBubble prompt={prompt} comment={comment} style={style} visible={visible} />;
}

function useSettledComment(theme: SemanticTokens, resetNonce: number, locale: "ko" | "en") {
  const [comment, setComment] = useState<{ id: number; text: string } | null>(null);
  const settled = useRef<ReturnType<typeof colorsFromTheme> | null>(null);
  const commentId = useRef(0);
  const resetSeen = useRef(resetNonce);
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const colors = useMemo(() => colorsFromTheme(theme), [theme]);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;
  const signature = JSON.stringify(colors);

  useEffect(() => {
    if (!settled.current) {
      settled.current = colorsRef.current;
      resetSeen.current = resetNonce;
      return;
    }
    const reset = resetNonce !== resetSeen.current;
    const timer = window.setTimeout(() => {
      const snapshot = colorsRef.current;
      const previous = settled.current;
      if (previous) {
        const lines = appleCommentLines(snapshot, previous, { reset, locale: localeRef.current });
        if (lines.length > 0) {
          commentId.current += 1;
          setComment({ id: commentId.current, text: lines.join(" ") });
        }
      }
      settled.current = snapshot;
      resetSeen.current = resetNonce;
    }, 640);
    return () => window.clearTimeout(timer);
  }, [resetNonce, signature]);

  return comment;
}

function FlipBubble({ prompt, comment, style, visible }: { prompt: string; comment: { id: number; text: string } | null; style: CSSProperties; visible: boolean }) {
  const [text, setText] = useState(prompt);
  const [flip, setFlip] = useState("idle");
  const messageRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const promptRef = useRef(prompt);
  const targetRef = useRef(prompt);
  const modeRef = useRef<"idle" | "comment" | "holding" | "return">("idle");
  const phaseRef = useRef<"idle" | "out" | "in">("idle");
  const holdRef = useRef<number | null>(null);
  promptRef.current = prompt;

  useEffect(() => {
    if (modeRef.current === "idle") setText(prompt);
  }, [prompt]);

  useLayoutEffect(() => {
    const box = messageRef.current;
    const label = labelRef.current;
    if (!box || !label) return;

    const fit = () => {
      const max = 13;
      const min = text === prompt ? 11 : 7;
      const style = getComputedStyle(box);
      const available = box.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      let size = max;
      box.style.fontSize = `${size}px`;
      while (size > min && label.scrollHeight > available + 1) {
        size -= 0.5;
        box.style.fontSize = `${size}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [prompt, text]);

  useEffect(() => {
    if (!comment) return;
    if (holdRef.current !== null) {
      window.clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    targetRef.current = comment.text;
    if (prefersReducedMotion()) {
      modeRef.current = "holding";
      setText(comment.text);
      holdRef.current = window.setTimeout(() => {
        modeRef.current = "idle";
        setText(promptRef.current);
        holdRef.current = null;
      }, HOLD_MS);
      return () => {
        if (holdRef.current !== null) window.clearTimeout(holdRef.current);
      };
    }
    modeRef.current = "comment";
    phaseRef.current = "out";
    setFlip(`out-${comment.id}`);
    return () => {
      if (holdRef.current !== null) window.clearTimeout(holdRef.current);
    };
  }, [comment]);

  function finishFlip(event: AnimationEvent<HTMLParagraphElement>) {
    if (event.target !== event.currentTarget) return;
    if (phaseRef.current === "out") {
      setText(targetRef.current);
      phaseRef.current = "in";
      setFlip((value) => value.replace(/^out-/, "in-"));
      return;
    }
    if (phaseRef.current !== "in") return;
    phaseRef.current = "idle";
    setFlip("idle");
    if (modeRef.current === "comment") {
      modeRef.current = "holding";
      holdRef.current = window.setTimeout(() => {
        modeRef.current = "return";
        targetRef.current = promptRef.current;
        phaseRef.current = "out";
        setFlip(`out-back-${comment?.id ?? 0}`);
        holdRef.current = null;
      }, HOLD_MS);
    } else if (modeRef.current === "return") {
      modeRef.current = "idle";
    }
  }

  return (
    <div className="token-apple-message-stage" aria-hidden={!visible} style={{ ...style, visibility: visible ? "visible" : "hidden", opacity: visible ? 1 : 0 }}>
      <p
        ref={messageRef}
        className="token-apple-message"
        role="note"
        aria-live="polite"
        data-flip={flip}
        onAnimationEnd={finishFlip}
      >
        <span ref={labelRef}>{text}</span>
      </p>
    </div>
  );
}
