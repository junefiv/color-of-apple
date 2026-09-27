"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  PanelRight,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCopy } from "@/hooks/use-copy";

export type AlertTone = "success" | "info" | "warning" | "danger";

const ALERT_ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
} as const;

export function FeedbackShowcase({
  viewportRef,
  alert,
  onDismissAlert,
}: {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  alert: AlertTone | null;
  onDismissAlert: () => void;
}) {
  const k = useCopy().preview.kit;
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [popover, setPopover] = useState(false);
  const [loading, setLoading] = useState(false);
  const loadingTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (loadingTimerRef.current !== null) window.clearTimeout(loadingTimerRef.current);
  }, []);

  function showLoading() {
    setLoading(true);
    if (loadingTimerRef.current !== null) window.clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = window.setTimeout(() => {
      setLoading(false);
      loadingTimerRef.current = null;
    }, 1400);
  }

  const actions = [
    { label: k.actionConfirmModal, run: () => setModal(true) },
    { label: k.actionDrawer, run: () => setDrawer(true) },
    { label: k.actionPopover, run: () => setPopover((value) => !value) },
    { label: k.actionTooltip, tooltip: k.tooltipBody },
    { label: k.actionLoading, run: showLoading },
  ];

  const alertCopy = alert ? {
    success: [k.successAlertTitle, k.successAlertBody],
    info: [k.infoAlertTitle, k.infoAlertBody],
    warning: [k.warningAlertTitle, k.warningAlertBody],
    danger: [k.errorAlertTitle, k.errorAlertBody],
  }[alert] : null;
  const AlertIcon = alert ? ALERT_ICONS[alert] : null;

  return (
    <div className="kit-feedback-showcase">
      <div className="kit-feedback-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="kit-btn kit-feedback-action"
            data-look="soft"
            data-tone="neutral"
            data-tooltip={action.tooltip || undefined}
            aria-describedby={action.tooltip ? "kit-action-tooltip" : undefined}
            onClick={action.run}
          >
            {action.label}
          </button>
        ))}
      </div>

      {popover ? (
        <div className="kit-feedback-popover" role="dialog" aria-label={k.popoverTitle}>
          <strong>{k.popoverTitle}</strong>
          <p>{k.popoverBody}</p>
          <button type="button" onClick={() => setPopover(false)}>{k.close}</button>
        </div>
      ) : null}

      <span id="kit-action-tooltip" role="tooltip" className="sr-only">{k.tooltipBody}</span>

      {viewportRef.current ? createPortal(
        <>
          {alert && alertCopy && AlertIcon ? (
            <div className="kit-feedback-alert kit-global-alert" data-tone={alert} role="alert">
              <AlertIcon aria-hidden />
              <span>
                <strong>{alertCopy[0]}</strong>
                <small>{alertCopy[1]}</small>
              </span>
              <button type="button" aria-label={k.close} onClick={onDismissAlert}><X aria-hidden /></button>
            </div>
          ) : null}

          {modal ? (
            <div className="kit-feedback-scrim" role="presentation">
              <div className="kit-feedback-dialog" role="dialog" aria-modal="true">
                <CheckCircle2 aria-hidden />
                <h3>{k.confirmModalTitle}</h3>
                <p>{k.confirmModalBody}</p>
                <div>
                  <button type="button" onClick={() => setModal(false)}>{k.cancel}</button>
                  <button type="button" data-primary onClick={() => setModal(false)}>{k.confirm}</button>
                </div>
              </div>
            </div>
          ) : null}

          {drawer ? (
            <div className="kit-feedback-scrim" role="presentation">
              <aside className="kit-feedback-drawer" role="dialog" aria-modal="true" aria-label={k.drawerTitle}>
                <header><PanelRight aria-hidden /><strong>{k.drawerTitle}</strong><button type="button" aria-label={k.close} onClick={() => setDrawer(false)}><X aria-hidden /></button></header>
                <p>{k.drawerBody}</p>
                <button type="button" onClick={() => setDrawer(false)}>{k.close}</button>
              </aside>
            </div>
          ) : null}

          {loading ? (
            <div className="kit-feedback-loading" role="status">
              <Loader2 aria-hidden />
              <span>{k.loadingBody}</span>
            </div>
          ) : null}
        </>,
        viewportRef.current,
      ) : null}
    </div>
  );
}
